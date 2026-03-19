'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

type RegisterResult = {
  status: string
  face_id: string
  short_id: string
  image_path: string
  qr_code_path: string
  message?: string
}

const GRADE_OPTIONS = [
  'Pre-KG',
  'KG 1',
  'KG 2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11 — Science',
  'Grade 11 — Commerce',
  'Grade 11 — Humanities',
  'Grade 12 — Science',
  'Grade 12 — Commerce',
  'Grade 12 — Humanities',
]

export default function EnrolmentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RegisterResult | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [profile, setProfile] = useState('Élève')
  const [className, setClassName] = useState(GRADE_OPTIONS[0])
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const recaptchaWidgetIdRef = useRef<number | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null)
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

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
    if (!recaptchaLoaded || !recaptchaSiteKey || !recaptchaContainerRef.current) return
    const grecaptcha = (window as any).grecaptcha
    if (!grecaptcha || typeof grecaptcha.render !== 'function') return
    if (recaptchaWidgetIdRef.current !== null) return

    recaptchaWidgetIdRef.current = grecaptcha.render(recaptchaContainerRef.current, {
      sitekey: recaptchaSiteKey,
      callback: (token: string) => setRecaptchaToken(token),
      'expired-callback': () => setRecaptchaToken(''),
      'error-callback': () => setRecaptchaToken(''),
    })
  }, [recaptchaLoaded, recaptchaSiteKey])

  const onSubmit = async () => {
    setError(null)
    setResult(null)

    if (!file) return setError('Please upload a JPG/PNG face image.')
    if (!firstName.trim()) return setError('First name is required.')
    if (!lastName.trim()) return setError('Last name is required.')
    if (!parentEmail.trim()) return setError('Parent email is required.')
    if (!profile.trim()) return setError('Profile is required.')
    if (!className.trim()) return setError('Class name is required.')
    if (!recaptchaSiteKey) return setError('Captcha is not configured. Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.')
    if (!recaptchaToken) return setError('Please complete the captcha verification.')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('first_name', firstName)
      fd.append('last_name', lastName)
      fd.append('parent_email', parentEmail)
      fd.append('profile', profile)
      fd.append('class_name', className)
      fd.append('recaptcha_token', recaptchaToken)

      const res = await fetch('/api/register', {
        method: 'POST',
        body: fd,
      })

      const data = (await res.json().catch(() => null)) as RegisterResult | null

      if (!res.ok) {
        const msg = data?.message ?? 'Register failed.'
        const detail = (data as any)?.detail ? ` (${String((data as any).detail)})` : ''
        setError(msg + detail)
        return
      }

      setResult(data)
      const grecaptcha = (window as any).grecaptcha
      if (grecaptcha && recaptchaWidgetIdRef.current !== null) {
        grecaptcha.reset(recaptchaWidgetIdRef.current)
      }
      setRecaptchaToken('')
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setRecaptchaLoaded(true)}
      />
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
              <div className="form-section-title">Register (Face + Parent)</div>

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
                  <label>
                    Parent Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Profile <span className="required">*</span>
                  </label>
                  <select value={profile} onChange={(e) => setProfile(e.target.value)}>
                    <option value="Enseignant">Enseignant</option>
                    <option value="Élève">Élève</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Class Name <span className="required">*</span>
                  </label>
                  <select value={className} onChange={(e) => setClassName(e.target.value)}>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: 'rgba(26,21,16,0.65)', fontSize: 13, lineHeight: 1.5 }}>
                    Registration API key is handled automatically on the server (not shown to users).
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

              {error && (
                <div
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
                  className="btn-primary"
                  style={{ fontSize: 16, padding: '16px 40px' }}
                  onClick={onSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : 'Submit Registration →'}
                </button>
              </div>

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
