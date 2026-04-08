'use client'
import { useState } from 'react'
import { auth, db, googleProvider } from '../../lib/firebase'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

const assamTowns = [
  'Barpeta','Bongaigaon','Cachar','Darrang','Dhemaji','Dhubri','Dibrugarh',
  'Dima Hasao','Goalpara','Golaghat','Guwahati','Hailakandi','Hojai','Jorhat',
  'Kamrup','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur','Majuli',
  'Morigaon','Nagaon','Nalbari','Sivasagar','Silchar','Sonitpur',
  'South Salmara','Tezpur','Tinsukia','Udalguri','West Karbi Anglong','Other'
]

const skillLevels = [
  { id:'Spark',    label:'Spark',     sub:'Just starting out',     icon:'⚡' },
  { id:'Current',  label:'Current',   sub:'Student / hobbyist',    icon:'🔬' },
  { id:'Power',    label:'Power',     sub:'Professional / expert', icon:'⚙️' },
  { id:'LabNotes', label:'Lab Notes', sub:'Researcher / academic', icon:'🧪' },
]

export default function SignupPage() {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({
    name: '', email: '', password: '', town: '', skillLevel: ''
  })

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const nextStep = () => {
    setError('')
    if (step === 1) {
      if (!form.name.trim())      { setError('Please enter your full name.'); return }
      if (!form.email.trim() || !form.email.includes('@')) { setError('Please enter a valid email.'); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    }
    if (step === 2 && !form.town)       { setError('Please select your town.'); return }
    if (step === 3 && !form.skillLevel) { setError('Please select your skill level.'); return }
    setStep(s => s + 1)
  }

  const saveUserToFirestore = async (uid, data) => {
    await setDoc(doc(db, 'users', uid), {
      name:       data.name,
      email:      data.email,
      town:       data.town || '',
      skillLevel: data.skillLevel || '',
      photoURL:   data.photoURL || '',
      createdAt:  serverTimestamp(),
      projectCount: 0,
      avgRating:    0,
    })
  }

  const handleEmailSignup = async () => {
    setError(''); setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.name })
      await saveUserToFirestore(cred.user.uid, { name: form.name, email: form.email, town: form.town, skillLevel: form.skillLevel })
      window.location.href = '/'
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered. Try logging in.')
      else setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setError(''); setLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await saveUserToFirestore(cred.user.uid, {
        name:     cred.user.displayName,
        email:    cred.user.email,
        photoURL: cred.user.photoURL,
        town: '', skillLevel: ''
      })
      window.location.href = '/'
    } catch (err) { setError('Google sign-in failed. Please try again.') }
    setLoading(false)
  }

  const S = {
    page:    { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', display:'flex', flexDirection:'column' },
    nav:     { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between' },
    card:    { maxWidth:'480px', width:'100%', margin:'0 auto', padding:'clamp(24px,5vw,48px) 20px', flex:1 },
    input:   { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', marginBottom:'14px' },
    select:  { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', cursor:'pointer', marginBottom:'14px' },
    btnP:    { width:'100%', backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'13px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'15px' },
    btnG:    { width:'100%', backgroundColor:'#1a1d2e', color:'#dde1f0', fontWeight:600, padding:'13px', borderRadius:'7px', border:'1px solid #2a2f4a', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' },
    btnBack: { background:'none', border:'none', color:'#7a82a0', fontSize:'13px', cursor:'pointer', padding:'8px 0', textDecoration:'underline' },
    error:   { backgroundColor:'rgba(255,100,100,.08)', border:'1px solid rgba(255,100,100,.2)', borderRadius:'6px', padding:'10px 14px', fontSize:'13px', color:'#ff8080', marginBottom:'16px' },
    label:   { display:'block', fontSize:'13px', fontWeight:500, color:'#dde1f0', marginBottom:'6px' },
    divider: { display:'flex', alignItems:'center', gap:'12px', margin:'16px 0', color:'#7a82a0', fontSize:'12px' },
    divLine: { flex:1, height:'1px', backgroundColor:'#2a2f4a' },
  }

  const steps = ['Account', 'Location', 'Skills']
  const StepBar = () => (
    <div style={{ display:'flex', alignItems:'center', marginBottom:'28px', position:'relative' }}>
      <div style={{ position:'absolute', top:'14px', left:'14px', right:'14px', height:'1px', backgroundColor:'#2a2f4a', zIndex:0 }}/>
      {steps.map((s,i) => {
        const n=i+1; const done=step>n; const active=step===n
        return (
          <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', position:'relative', zIndex:1 }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, backgroundColor:done?'#2dd4a0':active?'#4a9eff':'#1a1d2e', border:`1.5px solid ${done?'#2dd4a0':active?'#4a9eff':'#2a2f4a'}`, color:(done||active)?'#fff':'#7a82a0' }}>{done?'✓':n}</div>
            <div style={{ fontSize:'10px', color:active?'#4a9eff':'#7a82a0', fontWeight:active?600:400 }}>{s}</div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`input:focus,select:focus{border-color:#4a9eff!important;box-shadow:0 0 0 3px rgba(74,158,255,.15)} input::placeholder{color:#4a5070}`}</style>

      <nav style={S.nav}>
        <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', textDecoration:'none' }}>
          <span style={{ color:'#4a9eff' }}>Assam</span> Innovates
        </a>
        <a href="/login" style={{ fontSize:'13px', color:'#7a82a0', textDecoration:'none' }}>
          Already have an account? <span style={{ color:'#4a9eff' }}>Log in</span>
        </a>
      </nav>

      <div style={S.card}>
        <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Create account</div>
        <h1 style={{ fontSize:'clamp(22px,5vw,30px)', fontWeight:800, letterSpacing:'-.5px', marginBottom:'6px' }}>Join the Tinkerspace</h1>
        <p style={{ color:'#7a82a0', fontSize:'14px', lineHeight:1.6, marginBottom:'24px' }}>Build your maker profile and connect with innovators across Assam.</p>

        {/* Google signup — only on step 1 */}
        {step === 1 && (
          <>
            <button onClick={handleGoogleSignup} disabled={loading} style={S.btnG}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
              Continue with Google
            </button>
            <div style={S.divider}><div style={S.divLine}/><span>or sign up with email</span><div style={S.divLine}/></div>
          </>
        )}

        <StepBar />
        {error && <div style={S.error}>{error}</div>}

        {/* STEP 1 — Account details */}
        {step === 1 && (
          <div>
            <label style={S.label}>Full name *</label>
            <input style={S.input} placeholder="e.g. Rupam Borah" value={form.name} onChange={e=>update('name',e.target.value)}/>
            <label style={S.label}>Email address *</label>
            <input style={S.input} type="email" placeholder="you@example.com" value={form.email} onChange={e=>update('email',e.target.value)}/>
            <label style={S.label}>Password *</label>
            <input style={S.input} type="password" placeholder="At least 6 characters" value={form.password} onChange={e=>update('password',e.target.value)}/>
            <button style={S.btnP} onClick={nextStep}>Continue →</button>
          </div>
        )}

        {/* STEP 2 — Location */}
        {step === 2 && (
          <div>
            <label style={S.label}>Your town in Assam *</label>
            <select style={S.select} value={form.town} onChange={e=>update('town',e.target.value)}>
              <option value="">Select your town...</option>
              {assamTowns.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {form.town && (
              <div style={{ backgroundColor:'rgba(45,212,160,.06)', border:'1px solid rgba(45,212,160,.2)', borderRadius:'7px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#2dd4a0', flexShrink:0 }}/>
                <span style={{ fontSize:'13px', color:'#7a82a0' }}>Your pin will appear on the Innovation Map at <strong style={{ color:'#dde1f0' }}>{form.town}</strong></span>
              </div>
            )}
            <button style={S.btnP} onClick={nextStep}>Continue →</button>
            <div style={{ textAlign:'center', marginTop:'10px' }}><button style={S.btnBack} onClick={() => setStep(1)}>← Back</button></div>
          </div>
        )}

        {/* STEP 3 — Skill level */}
        {step === 3 && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap:'10px', marginBottom:'20px' }}>
              {skillLevels.map(s => (
                <div key={s.id} onClick={() => update('skillLevel',s.id)} style={{ backgroundColor:form.skillLevel===s.id?'rgba(74,158,255,.1)':'#1a1d2e', border:`1.5px solid ${form.skillLevel===s.id?'#4a9eff':'#2a2f4a'}`, borderRadius:'8px', padding:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ fontSize:'22px' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:600, color:form.skillLevel===s.id?'#4a9eff':'#dde1f0' }}>{s.label}</div>
                    <div style={{ fontSize:'11px', color:'#7a82a0', marginTop:'2px' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleEmailSignup}
              disabled={loading}
              style={{ ...S.btnP, opacity:loading?.6:1, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? '⏳ Creating your account...' : 'Create Account →'}
            </button>
            <div style={{ textAlign:'center', marginTop:'10px' }}><button style={S.btnBack} onClick={() => setStep(2)}>← Back</button></div>
            <p style={{ textAlign:'center', fontSize:'11px', color:'#4a5070', marginTop:'14px' }}>By signing up you agree to our community guidelines. Your data is stored securely.</p>
          </div>
        )}

        <p style={{ textAlign:'center', fontSize:'13px', color:'#7a82a0', marginTop:'24px' }}>
          Already have an account? <a href="/login" style={{ color:'#4a9eff' }}>Log in</a>
        </p>
      </div>
    </div>
  )
}