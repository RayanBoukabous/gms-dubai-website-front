'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Script from 'next/script'

type RegisterResult = {
  status: string
  face_id: string
  short_id: string
  image_path?: string
  qr_code_path: string
  message?: string
}

type StudentProgram = {
  id: string
  label: string
  grade: string
  curriculum?: string
  stream?: string
}

const PROFILE_OPTIONS = ['Student', 'Staff', 'Guardian', 'Admin'] as const

function buildStudentPrograms(): StudentProgram[] {
  const base: StudentProgram[] = [
    { id: 'prekg', label: 'Pre-KG', grade: 'Pre-KG' },
    { id: 'kg1', label: 'KG 1', grade: 'KG1' },
    { id: 'kg2', label: 'KG 2', grade: 'KG2' },
  ]
  for (let n = 1; n <= 9; n++) {
    base.push({ id: `g${n}`, label: `Grade ${n}`, grade: `G${n}` })
  }
  base.push(
    { id: 'g10-cbse', label: 'Grade 10 — CBSE', grade: 'G10', curriculum: 'CBSE' },
    { id: 'g10-kb', label: 'Grade 10 — Kerala Board (KB)', grade: 'G10', curriculum: 'KB' }
  )
  const streams = ['Science', 'Commerce', 'Humanities'] as const
  const curricula = ['CBSE', 'KB'] as const
  for (const g of [11, 12] as const) {
    for (const cur of curricula) {
      for (const s of streams) {
        base.push({
          id: `g${g}-${cur}-${s}`.toLowerCase().replace(/\s+/g, '-'),
          label: `Grade ${g} — ${cur} — ${s}`,
          grade: `G${g}`,
          curriculum: cur,
          stream: s,
        })
      }
    }
  }
  return base
}

const STUDENT_PROGRAMS = buildStudentPrograms()

export default function EnrolmentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RegisterResult | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [matricule, setMatricule] = useState('')
  const [classNameOpt, setClassNameOpt] = useState('')
  const [profile, setProfile] = useState<(typeof PROFILE_OPTIONS)[number]>('Student')
  const [studentProgramId, setStudentProgramId] = useState(STUDENT_PROGRAMS[0].id)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const recaptchaWidgetIdRef = useRef<number | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null)
  const errorRef = useRef<HTMLDivElement | null>(null)
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''
  const skipRecaptcha = process.env.NEXT_PUBLIC_SKIP_RECAPTCHA === 'true'

  const selectedStudentProgram = useMemo(
    () => STUDENT_PROGRAMS.find((p) => p.id === studentProgramId) ?? STUDENT_PROGRAMS[0],
    [studentProgramId]
  )

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (skipRecaptcha || !recaptchaLoaded || !recaptchaSiteKey || !recaptchaContainerRef.current) return
    const grecaptcha = (window as any).grecaptcha
    if (!grecaptcha || typeof grecaptcha.render !== 'function') return
    if (recaptchaWidgetIdRef.current !== null) return

    recaptchaWidgetIdRef.current = grecaptcha.render(recaptchaContainerRef.current, {
      sitekey: recaptchaSiteKey,
      callback: (token: string) => setRecaptchaToken(token),
      'expired-callback': () => setRecaptchaToken(''),
      'error-callback': () => setRecaptchaToken(''),
    })
  }, [skipRecaptcha, recaptchaLoaded, recaptchaSiteKey])

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [error])

  const onSubmit = async () => {
    setError(null)
    setResult(null)

    if (!file) return setError('Please upload a JPG/PNG face image.')
    if (!firstName.trim()) return setError('First name is required.')
    if (!lastName.trim()) return setError('Last name is required.')
    if (!profile.trim()) return setError('Profile is required.')
    if (profile === 'Student' && !selectedStudentProgram.grade) {
      return setError('Please select a grade / programme.')
    }
    if (!skipRecaptcha) {
      if (!recaptchaSiteKey) return setError('Captcha is not configured. Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.')
      if (!recaptchaToken) return setError('Please complete the captcha verification.')
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('first_name', firstName.trim())
      fd.append('last_name', lastName.trim())
      fd.append('profile', profile)
      if (!skipRecaptcha) {
        fd.append('recaptcha_token', recaptchaToken)
      }

      if (parentEmail.trim()) fd.append('parent_email', parentEmail.trim())
      if (parentPhone.trim()) fd.append('parent_phone', parentPhone.trim())
      if (matricule.trim()) fd.append('matricule', matricule.trim())
      if (classNameOpt.trim()) fd.append('class_name', classNameOpt.trim())

      if (profile === 'Student') {
        fd.append('grade', selectedStudentProgram.grade)
        if (selectedStudentProgram.curriculum) {
          fd.append('curriculum', selectedStudentProgram.curriculum)
        }
        if (selectedStudentProgram.stream) {
          fd.append('stream', selectedStudentProgram.stream)
        }
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        body: fd,
      })

      const data = (await res.json().catch(() => null)) as RegisterResult | null

      if (process.env.NODE_ENV === 'development') {
        console.log('[enrolment] /api/register response', {
          httpStatus: res.status,
          ok: res.ok,
          body: data,
        })
      }

      if (!res.ok) {
        const msg = data?.message ?? 'Register failed.'
        const detail = (data as any)?.detail ? ` (${String((data as any).detail)})` : ''
        setError(msg + detail)
        return
      }

      setResult(data)
      if (!skipRecaptcha) {
        const grecaptcha = (window as any).grecaptcha
        if (grecaptcha && recaptchaWidgetIdRef.current !== null) {
          grecaptcha.reset(recaptchaWidgetIdRef.current)
        }
        setRecaptchaToken('')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!skipRecaptcha ? (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setRecaptchaLoaded(true)}
        />
      ) : null}
      <div className="enrolment-no-print">
        <div className="page-banner">
          <div className="breadcrumb">
            Home <span>›</span> Admissions <span>›</span> Registration
          </div>
          <h1>Online Registration</h1>
          <p>Submit your face registration details</p>
        </div>

        <section>
          <div className="section-inner">
            <div className="admission-form-wrap" id="admission-form-anchor">
              <div className="form-section-title">Register (Face + details)</div>

              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  void onSubmit()
                }}
              >
              <div className="form-grid-3">
                <div className="form-group">
                  <label>
                    Face image (JPG/PNG) <span className="required">*</span>
                  </label>
                  <div className="enrolment-filebox">
                    {previewUrl ? (
                      <img className="enrolment-face-preview" src={previewUrl} alt="Selected face preview" />
                    ) : (
                      <div className="enrolment-filebox-empty">
                        <div className="enrolment-filebox-title">Upload Face Photo</div>
                        <div className="enrolment-filebox-sub">JPG/PNG only</div>
                      </div>
                    )}
                    <input
                      className="enrolment-file-input"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Profile <span className="required">*</span></label>
                  <select value={profile} onChange={(e) => setProfile(e.target.value as (typeof PROFILE_OPTIONS)[number])}>
                    {PROFILE_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {profile === 'Student' ? (
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>
                      Grade / programme <span className="required">*</span>
                    </label>
                    <select
                      value={studentProgramId}
                      onChange={(e) => setStudentProgramId(e.target.value)}
                    >
                      {STUDENT_PROGRAMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Parent email (optional)</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Parent phone (optional)</label>
                  <input
                    type="tel"
                    placeholder="+971 …"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Matricule (optional)</label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Class name (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. homeroom / section"
                    value={classNameOpt}
                    onChange={(e) => setClassNameOpt(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: 'rgba(26,21,16,0.65)', fontSize: 13, lineHeight: 1.5 }}>
                    API authentication is handled on the server via{' '}
                    <code style={{ fontSize: 12 }}>X-API-Key</code> (not exposed to the browser).
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(13,27,62,0.04)',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 20,
                  fontSize: 14,
                  color: 'var(--text-light)',
                  lineHeight: 1.7,
                }}
              >
                By submitting, you confirm that the uploaded image and details are accurate. Submission
                does not guarantee admission.
              </div>

              {!skipRecaptcha ? (
                <div className="enrolment-captcha-wrap">
                  <div className="enrolment-captcha-title">Security Verification</div>
                  {recaptchaSiteKey ? (
                    <div ref={recaptchaContainerRef} />
                  ) : (
                    <div className="enrolment-captcha-missing">
                      Missing reCAPTCHA site key. Set <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code>.
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="enrolment-captcha-wrap"
                  style={{ fontSize: 13, color: 'rgba(26,21,16,0.55)' }}
                >
                  reCAPTCHA is disabled for testing (<code>NEXT_PUBLIC_SKIP_RECAPTCHA=true</code>).
                </div>
              )}

              {error && (
                <div
                  ref={errorRef}
                  role="alert"
                  className="success-message"
                  style={{
                    background: 'rgba(217,56,42,0.08)',
                    borderColor: 'rgba(217,56,42,0.25)',
                    color: '#7A1111',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: 16, padding: '16px 40px' }}
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : 'Submit Registration →'}
                </button>
              </div>
              </form>

              {result?.status === 'success' && (
                <div className="enrolment-result-wrap">
                  <div className="form-section-title">✅ Registration Result</div>

                  <div className="enrolment-result-grid">
                    <div className="enrolment-result-card enrolment-qr-card">
                      <div className="enrolment-result-card-title">QR Code</div>
                      {result.qr_code_path ? (
                        <img
                          className="enrolment-qr-img"
                          src={result.qr_code_path}
                          alt="QR code"
                        />
                      ) : (
                        <div className="enrolment-muted">No QR returned.</div>
                      )}
                      <div className="enrolment-qr-shortid">
                        <span className="enrolment-qr-shortid-label">Short ID</span>
                        <code className="enrolment-qr-shortid-code">{result.short_id}</code>
                      </div>
                    </div>

                    <div className="enrolment-result-card enrolment-ids-card">
                      <div className="enrolment-result-card-title">Your IDs</div>

                      <div className="enrolment-id-row">
                        <div className="enrolment-id-label">face_id</div>
                        <div className="enrolment-id-value">{result.face_id}</div>
                      </div>
                      <div className="enrolment-id-row">
                        <div className="enrolment-id-label">short_id</div>
                        <div className="enrolment-id-value">{result.short_id}</div>
                      </div>

                      {result.image_path ? (
                        <div className="enrolment-face-thumb">
                          <img
                            src={result.image_path}
                            alt="Registered face"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="enrolment-actions">
                    <button
                      type="button"
                      className="btn-outline-blue"
                      onClick={() => window.print()}
                    >
                      Imprimer QR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {result?.status === 'success' && (
        <div className="enrolment-print" aria-hidden="true">
          <div className="enrolment-badge">
            <div className="enrolment-badge-top">
              <div className="enrolment-badge-brand">
                <img className="enrolment-badge-logo" src="/logo.jpg" alt="Gulf Model School logo" />
                <div className="enrolment-badge-brand-text">
                  <div className="enrolment-badge-pretitle">DIGITAL DISCOVERY</div>
                  <div className="enrolment-badge-title">GULF MODEL SCHOOL</div>
                </div>
              </div>

              <div className="enrolment-badge-subtitle">ONLINE REGISTRATION</div>
            </div>

            <div className="enrolment-badge-qr-area">
              {result.qr_code_path ? (
                <img className="enrolment-badge-qr" src={result.qr_code_path} alt="QR code" />
              ) : null}

              <div className="enrolment-badge-shortid">
                <div className="enrolment-badge-shortid-label">Short ID</div>
                <div className="enrolment-badge-shortid-code">
                  {result.short_id ? result.short_id : ''}
                </div>
              </div>
            </div>

            <div className="enrolment-badge-bottom">
              <div className="enrolment-badge-confidential">CONFIDENTIAL — DO NOT SHARE THIS DOCUMENT</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
