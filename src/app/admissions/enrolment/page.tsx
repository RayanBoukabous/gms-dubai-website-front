'use client'

export default function EnrolmentPage() {
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Admissions <span>›</span> Registration</div>
        <h1>Online Registration</h1>
        <p>Apply for Academic Year 2026–2027</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="admission-form-wrap" id="admission-form-anchor">
            <div className="form-section-title">👤 Student Information</div>
            <div className="form-grid-3">
              <div className="form-group"><label>First Name <span className="required">*</span></label><input type="text" placeholder="First name" /></div>
              <div className="form-group"><label>Middle Name</label><input type="text" placeholder="Middle name" /></div>
              <div className="form-group"><label>Last Name <span className="required">*</span></label><input type="text" placeholder="Last name" /></div>
            </div>
            <div className="form-grid-3">
              <div className="form-group"><label>Gender <span className="required">*</span></label><select><option value="">Select</option><option>Male</option><option>Female</option></select></div>
              <div className="form-group"><label>Date of Birth <span className="required">*</span></label><input type="date" /></div>
              <div className="form-group"><label>Nationality</label><input type="text" placeholder="Nationality" /></div>
            </div>
            <div className="form-grid-2">
              <div className="form-group"><label>Passport Number</label><input type="text" placeholder="Passport number" /></div>
              <div className="form-group"><label>UAE Visa / Emirates ID</label><input type="text" placeholder="Emirates ID or Visa number" /></div>
            </div>

            <div className="form-section-title">📚 Academic Information</div>
            <div className="form-grid-3">
              <div className="form-group"><label>Curriculum <span className="required">*</span></label><select><option value="">Select</option><option>CBSE (Indian)</option><option>Kerala Board (Indian)</option></select></div>
              <div className="form-group">
                <label>Grade Applying For <span className="required">*</span></label>
                <select>
                  <option value="">Select Grade</option>
                  {['Pre-KG','KG 1','KG 2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11 — Science','Grade 11 — Commerce','Grade 11 — Humanities','Grade 12 — Science','Grade 12 — Commerce','Grade 12 — Humanities'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Academic Year</label><select><option>2026–2027</option></select></div>
            </div>
            <div className="form-grid-2">
              <div className="form-group"><label>Previous School Name</label><input type="text" placeholder="Name of previous school" /></div>
              <div className="form-group"><label>Previous School Country</label><input type="text" placeholder="Country" /></div>
            </div>

            <div className="form-section-title">👨‍👩‍👧 Parent / Guardian Information</div>
            <div className="form-grid-3">
              <div className="form-group"><label>Full Name <span className="required">*</span></label><input type="text" placeholder="Full name" /></div>
              <div className="form-group"><label>Relationship</label><select><option>Father</option><option>Mother</option><option>Legal Guardian</option></select></div>
              <div className="form-group"><label>Occupation</label><input type="text" placeholder="Occupation" /></div>
            </div>
            <div className="form-grid-3">
              <div className="form-group"><label>Mobile Number <span className="required">*</span></label><input type="tel" placeholder="+971 5X XXX XXXX" /></div>
              <div className="form-group"><label>Email Address <span className="required">*</span></label><input type="email" placeholder="email@example.com" /></div>
              <div className="form-group"><label>Emirates ID</label><input type="text" placeholder="784-XXXX-XXXXXXX-X" /></div>
            </div>

            <div className="form-section-title">🏥 Health Information</div>
            <div className="form-grid-2">
              <div className="form-group"><label>Blood Group</label><select><option value="">Select</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown'].map(b => <option key={b}>{b}</option>)}</select></div>
              <div className="form-group"><label>Medical Insurance Provider</label><input type="text" placeholder="Insurance company name" /></div>
            </div>
            <div className="form-group"><label>Known Allergies</label><input type="text" placeholder="List any known allergies or write 'None'" /></div>
            <div className="form-group"><label>Special Educational / Learning Needs</label><textarea placeholder="Describe any learning support needs. Write 'None' if not applicable." /></div>

            <div className="form-section-title">🚌 Transport</div>
            <div className="form-grid-2">
              <div className="form-group"><label>School Transport Required?</label><select><option>No — Own Transport</option><option>Yes — Morning & Afternoon</option><option>Yes — Morning Only</option><option>Yes — Afternoon Only</option></select></div>
              <div className="form-group"><label>Pick-up Area / Zone</label><input type="text" placeholder="Area in Dubai (if transport needed)" /></div>
            </div>

            <div className="form-section-title">✅ Declaration & Submission</div>
            <div style={{ background: 'rgba(13,27,62,0.04)', borderRadius: 8, padding: 20, marginBottom: 20, fontSize: 14, color: 'var(--text-light)', lineHeight: 1.7 }}>
              I hereby confirm that all information provided is accurate and complete. I understand that submission does not guarantee admission and that Gulf Model School reserves the right to verify all information provided.
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontWeight: 'normal', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 'auto', marginTop: 2, accentColor: 'var(--red)' }} />
                <span>I confirm that all information is accurate and I agree to the school&apos;s terms and conditions.</span>
              </label>
            </div>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }}
                onClick={() => alert('✅ Application submitted! We will contact you within 2–3 working days.')}>
                Submit Application →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
