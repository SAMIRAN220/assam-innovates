'use client'
import { useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID  = 'service_70iv32t'
const EMAILJS_TEMPLATE_ID = 'template_qs118ia'
const EMAILJS_PUBLIC_KEY  = 'e-i8c4IY_esR0mafi'

const assamTowns = [
  'Barpeta', 'Bongaigaon', 'Cachar', 'Darrang', 'Dhemaji',
  'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat',
  'Guwahati', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup',
  'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli',
  'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Silchar',
  'Sonitpur', 'South Salmara', 'Tezpur', 'Tinsukia', 'Udalguri',
  'West Karbi Anglong', 'Other'
]

const skillLevels = [
  { id: 'Spark',     label: 'Spark',     sub: 'Just starting out',     icon: '⚡', color: '#ffd84d' },
  { id: 'Current',  label: 'Current',   sub: 'Student / hobbyist',    icon: '🔬', color: '#2dd4a0' },
  { id: 'Power',    label: 'Power',     sub: 'Professional / expert', icon: '⚙️', color: '#4a9eff' },
  { id: 'LabNotes', label: 'Lab Notes', sub: 'Researcher / academic', icon: '🧪', color: '#a78bfa' },
]

const interestOptions = [
  'IoT', 'Robotics', 'Renewable Energy', 'PCB Design',
  'Arduino', 'Raspberry Pi', 'Sensors', '3D Printing',
  'Solar Energy', 'Wireless Comms', 'Automation', 'AI / ML',
]

export default function RegisterPage() {
  const [step, setStep]           = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [menuOpen, setMenuOpen]   = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', town: '', bio: '', skillLevel: '', interests: [],
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const nextStep = () => {
    setError('')
    if (step === 1) {
      if (!form.name.trim()) { setError('Please enter your full name.'); return }
      if (!form.email.trim() || !form.email.includes('@')) { setError('Please enter a valid email address.'); return }
    }
    if (step === 2) {
      if (!form.town) { setError('Please select your town.'); return }
    }
    if (step === 3) {
      if (!form.skillLevel) { setError('Please select your skill level.'); return }
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setError('')
    if (form.interests.length === 0) { setError('Please select at least one interest.'); return }
    setLoading(true)
    try {
      // Step 1 — Save member to Firebase Firestore
      await addDoc(collection(db, 'members'), {
        name:       form.name.trim(),
        email:      form.email.trim().toLowerCase(),
        town:       form.town,
        bio:        form.bio.trim(),
        skillLevel: form.skillLevel,
        interests:  form.interests,
        joinedAt:   serverTimestamp(),
      })

      // Step 2 — Send welcome email via EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name:     form.name.trim(),
          to_email:    form.email.trim().toLowerCase(),
          town:        form.town,
          skill_level: form.skillLevel,
          interests:   form.interests.join(', '),
        },
        EMAILJS_PUBLIC_KEY
      )

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Something went wrong saving your profile. Please try again.')
    }
    setLoading(false)
  }

  const C = {
    page:       { backgroundColor: '#13151f', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', color: '#dde1f0', overflowX: 'hidden' },
    nav:        { backgroundColor: '#1a1d2e', borderBottom: '1px solid #2a2f4a', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 },
    navInner:   { height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '700px', margin: '0 auto' },
    logo:       { fontWeight: 700, fontSize: '15px', color: '#dde1f0', textDecoration: 'none' },
    card:       { maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) 20px' },
    label:      { fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', color: '#4a9eff', textTransform: 'uppercase', marginBottom: '8px' },
    title:      { fontSize: 'clamp(22px,5vw,32px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' },
    sub:        { fontSize: '14px', color: '#7a82a0', lineHeight: 1.6, marginBottom: '28px' },
    fieldLabel: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#dde1f0', marginBottom: '6px' },
    input:      { width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
    select:     { width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
    textarea:   { width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '80px' },
    btnPrimary: { width: '100%', backgroundColor: '#4a9eff', color: '#fff', fontWeight: 700, padding: '13px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '8px' },
    btnBack:    { background: 'none', border: 'none', color: '#7a82a0', fontSize: '13px', cursor: 'pointer', padding: '8px 0', textDecoration: 'underline' },
    error:      { backgroundColor: 'rgba(255,100,100,.08)', border: '1px solid rgba(255,100,100,.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#ff8080', marginBottom: '16px' },
    field:      { marginBottom: '18px' },
  }

  const steps = ['You', 'Location', 'Skills', 'Interests']

  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', height: '1px', backgroundColor: '#2a2f4a', zIndex: 0 }} />
      {steps.map((s, i) => {
        const n = i + 1
        const done   = step > n
        const active = step === n
        return (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700,
              backgroundColor: done ? '#2dd4a0' : active ? '#4a9eff' : '#1a1d2e',
              border: `1.5px solid ${done ? '#2dd4a0' : active ? '#4a9eff' : '#2a2f4a'}`,
              color: (done || active) ? '#fff' : '#7a82a0',
            }}>{done ? '✓' : n}</div>
            <div style={{ fontSize: '10px', color: active ? '#4a9eff' : '#7a82a0', fontWeight: active ? 600 : 400 }}>{s}</div>
          </div>
        )
      })}
    </div>
  )

  // ── SUCCESS SCREEN ──
  if (submitted) return (
    <div style={C.page}>
      <nav style={C.nav}>
        <div style={C.navInner}>
          <a href="/" style={C.logo}><span style={{ color: '#4a9eff' }}>Assam</span> Innovates</a>
        </div>
      </nav>
      <div style={{ ...C.card, textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>🎉</div>
        <div style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 800, color: '#2dd4a0', marginBottom: '10px' }}>
          Welcome to the Tinkerspace!
        </div>
        <p style={{ fontSize: '15px', color: '#7a82a0', lineHeight: 1.7, marginBottom: '8px' }}>
          You are now on the Innovation Map at <strong style={{ color: '#dde1f0' }}>{form.town}</strong>.
        </p>
        <p style={{ fontSize: '14px', color: '#7a82a0', lineHeight: 1.7, marginBottom: '28px' }}>
          A welcome email has been sent to <strong style={{ color: '#4a9eff' }}>{form.email}</strong>. Check your inbox!
        </p>
        <div style={{ backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '10px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a82a0', marginBottom: '12px' }}>Your profile</div>
          {[['Name', form.name], ['Town', form.town], ['Level', form.skillLevel], ['Interests', form.interests.join(', ')]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #2a2f4a', fontSize: '13px', gap: '12px' }}>
              <span style={{ color: '#7a82a0', flexShrink: 0 }}>{k}</span>
              <span style={{ color: '#dde1f0', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/projects" style={{ flex: 1, backgroundColor: '#4a9eff', color: '#fff', fontWeight: 700, padding: '12px', borderRadius: '7px', textDecoration: 'none', textAlign: 'center', fontSize: '14px' }}>Browse Projects →</a>
          <a href="/" style={{ flex: 1, backgroundColor: 'transparent', color: '#dde1f0', fontWeight: 500, padding: '12px', borderRadius: '7px', textDecoration: 'none', textAlign: 'center', fontSize: '14px', border: '1px solid #2a2f4a' }}>Back to Home</a>
        </div>
      </div>
    </div>
  )

  // ── MAIN FORM ──
  return (
    <div style={C.page}>
      <style>{`
        input:focus, select:focus, textarea:focus { border-color: #4a9eff !important; }
        input::placeholder, textarea::placeholder { color: #4a5070; }
        @media (max-width:639px) { .desk-nav { display:none!important; } .ham-btn { display:flex!important; } }
        @media (min-width:640px) { .ham-btn { display:none!important; } }
      `}</style>

      <nav style={C.nav}>
        <div style={C.navInner}>
          <a href="/" style={C.logo}><span style={{ color: '#4a9eff' }}>Assam</span> Innovates</a>
          <div className="desk-nav" style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
            <a href="/"         style={{ color: '#7a82a0', textDecoration: 'none' }}>Home</a>
            <a href="/projects" style={{ color: '#7a82a0', textDecoration: 'none' }}>Projects</a>
          </div>
          <button className="ham-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: '1px solid #2a2f4a', borderRadius: '5px', padding: '6px 10px', cursor: 'pointer', color: '#dde1f0', fontSize: '16px', alignItems: 'center' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div style={{ borderTop: '1px solid #2a2f4a', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '700px', margin: '0 auto' }}>
            <a href="/"         style={{ color: '#7a82a0', textDecoration: 'none', fontSize: '14px' }}>Home</a>
            <a href="/projects" style={{ color: '#7a82a0', textDecoration: 'none', fontSize: '14px' }}>Projects</a>
          </div>
        )}
      </nav>

      <div style={C.card}>
        <div style={C.label}>Join the community</div>
        <h1 style={C.title}>Create Your Maker Profile</h1>
        <p style={C.sub}>Join 240+ makers across Assam. Your profile appears on the Innovation Map and you'll receive a welcome email instantly.</p>

        <StepBar />
        {error && <div style={C.error}>{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={C.field}>
              <label style={C.fieldLabel}>Full name <span style={{ color: '#4a9eff' }}>*</span></label>
              <input style={C.input} placeholder="e.g. Samiran Das" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div style={C.field}>
              <label style={C.fieldLabel}>Email address <span style={{ color: '#4a9eff' }}>*</span></label>
              <input style={C.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              <div style={{ fontSize: '11px', color: '#4a5070', marginTop: '5px' }}>You'll receive a welcome email at this address.</div>
            </div>
            <div style={C.field}>
              <label style={C.fieldLabel}>Short bio <span style={{ color: '#7a82a0', fontWeight: 400 }}>(optional)</span></label>
              <textarea style={C.textarea} placeholder="Tell the community about yourself and what you're working on..." value={form.bio} onChange={e => update('bio', e.target.value)} />
            </div>
            <button style={C.btnPrimary} onClick={nextStep}>Continue →</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div style={C.field}>
              <label style={C.fieldLabel}>Your town in Assam <span style={{ color: '#4a9eff' }}>*</span></label>
              <select style={C.select} value={form.town} onChange={e => update('town', e.target.value)}>
                <option value="">Select your town...</option>
                {assamTowns.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {form.town && (
              <div style={{ backgroundColor: 'rgba(45,212,160,.06)', border: '1px solid rgba(45,212,160,.2)', borderRadius: '7px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2dd4a0', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#7a82a0' }}>Your pin will appear on the Innovation Map at <strong style={{ color: '#dde1f0' }}>{form.town}</strong></span>
              </div>
            )}
            <button style={C.btnPrimary} onClick={nextStep}>Continue →</button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}><button style={C.btnBack} onClick={() => setStep(1)}>← Back</button></div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,220px),1fr))', gap: '10px', marginBottom: '20px' }}>
              {skillLevels.map(s => (
                <div key={s.id} onClick={() => update('skillLevel', s.id)} style={{
                  backgroundColor: form.skillLevel === s.id ? `${s.color}12` : '#1a1d2e',
                  border: `1.5px solid ${form.skillLevel === s.id ? s.color : '#2a2f4a'}`,
                  borderRadius: '8px', padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{ fontSize: '24px' }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: form.skillLevel === s.id ? s.color : '#dde1f0' }}>{s.label}</div>
                    <div style={{ fontSize: '11px', color: '#7a82a0', marginTop: '2px' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={C.btnPrimary} onClick={nextStep}>Continue →</button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}><button style={C.btnBack} onClick={() => setStep(2)}>← Back</button></div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <p style={{ fontSize: '13px', color: '#7a82a0', marginBottom: '14px' }}>Select all that apply — this helps connect you with relevant projects and makers.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {interestOptions.map(interest => (
                <div key={interest} onClick={() => toggleInterest(interest)} style={{
                  backgroundColor: form.interests.includes(interest) ? 'rgba(45,212,160,.08)' : '#1a1d2e',
                  border: `1px solid ${form.interests.includes(interest) ? '#2dd4a0' : '#2a2f4a'}`,
                  borderRadius: '99px', padding: '7px 14px', fontSize: '13px', fontWeight: 500,
                  color: form.interests.includes(interest) ? '#2dd4a0' : '#7a82a0', cursor: 'pointer',
                }}>{interest}</div>
              ))}
            </div>
            <div style={{ backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a82a0', marginBottom: '10px' }}>Profile summary</div>
              {[['Name', form.name], ['Email', form.email], ['Town', form.town], ['Level', form.skillLevel]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #2a2f4a', fontSize: '13px', gap: '12px' }}>
                  <span style={{ color: '#7a82a0', flexShrink: 0 }}>{k}</span>
                  <span style={{ color: '#dde1f0', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <button
              style={{ ...C.btnPrimary, backgroundColor: loading ? '#2a3a4a' : '#4a9eff', cursor: loading ? 'not-allowed' : 'pointer' }}
              onClick={handleSubmit} disabled={loading}
            >
              {loading ? '⏳ Saving and sending welcome email...' : 'Join the Tinkerspace →'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}><button style={C.btnBack} onClick={() => setStep(3)}>← Back</button></div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#4a5070', marginTop: '14px' }}>
              A welcome email will be sent to {form.email || 'your inbox'} automatically. Your data is stored securely.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}