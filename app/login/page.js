'use client'
import { useState } from 'react'
import { auth, googleProvider } from '../../lib/firebase'
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async () => {
    setError(''); setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      window.location.href = '/'
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') setError('Incorrect email or password.')
      else if (err.code === 'auth/user-not-found') setError('No account found with this email. Sign up first.')
      else if (err.code === 'auth/too-many-requests') setError('Too many attempts. Please wait a minute and try again.')
      else setError('Login failed. Please try again.')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      window.location.href = '/'
    } catch (err) { setError('Google sign-in failed. Please try again.') }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!email.trim()) { setError('Enter your email above first, then click Forgot password.'); return }
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(true); setError('')
    } catch (err) { setError('Could not send reset email. Check your email address.') }
  }

  const S = {
    page:  { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', display:'flex', flexDirection:'column' },
    nav:   { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between' },
    card:  { maxWidth:'420px', width:'100%', margin:'0 auto', padding:'clamp(32px,6vw,56px) 20px', flex:1 },
    input: { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', marginBottom:'14px' },
    btnP:  { width:'100%', backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'13px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'15px' },
    btnG:  { width:'100%', backgroundColor:'#1a1d2e', color:'#dde1f0', fontWeight:600, padding:'13px', borderRadius:'7px', border:'1px solid #2a2f4a', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'16px' },
    error: { backgroundColor:'rgba(255,100,100,.08)', border:'1px solid rgba(255,100,100,.2)', borderRadius:'6px', padding:'10px 14px', fontSize:'13px', color:'#ff8080', marginBottom:'16px' },
    success: { backgroundColor:'rgba(45,212,160,.06)', border:'1px solid rgba(45,212,160,.2)', borderRadius:'6px', padding:'10px 14px', fontSize:'13px', color:'#2dd4a0', marginBottom:'16px' },
    divider: { display:'flex', alignItems:'center', gap:'12px', margin:'16px 0', color:'#7a82a0', fontSize:'12px' },
    divLine: { flex:1, height:'1px', backgroundColor:'#2a2f4a' },
    label:   { display:'block', fontSize:'13px', fontWeight:500, color:'#dde1f0', marginBottom:'6px' },
  }

  return (
    <div style={S.page}>
      <style>{`input:focus{border-color:#4a9eff!important;box-shadow:0 0 0 3px rgba(74,158,255,.15)} input::placeholder{color:#4a5070}`}</style>

      <nav style={S.nav}>
        <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', textDecoration:'none' }}>
          <span style={{ color:'#4a9eff' }}>Assam</span> Innovates
        </a>
        <a href="/signup" style={{ fontSize:'13px', color:'#7a82a0', textDecoration:'none' }}>
          New here? <span style={{ color:'#4a9eff' }}>Sign up</span>
        </a>
      </nav>

      <div style={S.card}>
        <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Welcome back</div>
        <h1 style={{ fontSize:'clamp(22px,5vw,30px)', fontWeight:800, letterSpacing:'-.5px', marginBottom:'6px' }}>Log in to your account</h1>
        <p style={{ color:'#7a82a0', fontSize:'14px', lineHeight:1.6, marginBottom:'28px' }}>Good to have you back in the Tinkerspace.</p>

        {error && <div style={S.error}>{error}</div>}
        {resetSent && <div style={S.success}>Password reset email sent! Check your inbox.</div>}

        <button onClick={handleGoogle} disabled={loading} style={S.btnG}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div style={S.divider}><div style={S.divLine}/><span>or log in with email</span><div style={S.divLine}/></div>

        <label style={S.label}>Email address</label>
        <input style={S.input} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}
          onKeyDown={e => e.key==='Enter' && handleLogin()}/>

        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)}
          onKeyDown={e => e.key==='Enter' && handleLogin()}/>

        <div style={{ textAlign:'right', marginTop:'-8px', marginBottom:'20px' }}>
          <button onClick={handleReset} style={{ background:'none', border:'none', color:'#7a82a0', fontSize:'12px', cursor:'pointer', textDecoration:'underline' }}>
            Forgot password?
          </button>
        </div>

        <button onClick={handleLogin} disabled={loading} style={{ ...S.btnP, opacity:loading?.6:1, cursor:loading?'not-allowed':'pointer' }}>
          {loading ? '⏳ Logging in...' : 'Log In →'}
        </button>

        <p style={{ textAlign:'center', fontSize:'13px', color:'#7a82a0', marginTop:'24px' }}>
          Don&apos;t have an account? <a href="/signup" style={{ color:'#4a9eff' }}>Sign up free</a>
        </p>
      </div>
    </div>
  )
}