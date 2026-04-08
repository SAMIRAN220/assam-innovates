'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore'

const CATEGORIES = ['Electrical','Mechanical','Civil','Coding','Biology','Robotics','IoT','Renewable Energy','Other']
const LEVELS     = ['Beginner','Intermediate','Advanced']

function getYoutubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return m ? m[1] : null
}

export default function SubmitPage() {
  const { user, loading } = useAuth()
  const [step, setStep]         = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [submittedId, setSubmittedId] = useState(null)
  const [error, setError]           = useState('')
  const [form, setForm] = useState({
    title:'', description:'', category:'', level:'',
    youtubeUrl:'', githubUrl:'', driveUrl:'',
    links:[{ label:'', url:'' }],
    parts:[''],
  })

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login'
  }, [user, loading])

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }))
  const updatePart = (i, val) => { const a=[...form.parts]; a[i]=val; update('parts',a) }
  const addPart    = () => update('parts', [...form.parts,''])
  const removePart = (i) => update('parts', form.parts.filter((_,j)=>j!==i))
  const updateLink = (i,f,val) => { const a=[...form.links]; a[i]={...a[i],[f]:val}; update('links',a) }
  const addLink    = () => update('links', [...form.links,{label:'',url:''}])
  const removeLink = (i) => update('links', form.links.filter((_,j)=>j!==i))

  const nextStep = () => {
    setError('')
    if (step===1) {
      if (!form.title.trim())       { setError('Please enter a project title.'); return }
      if (!form.description.trim()) { setError('Please write a description.'); return }
      if (!form.category)           { setError('Please select a category.'); return }
      if (!form.level)              { setError('Please select a difficulty level.'); return }
    }
    setStep(s=>s+1)
  }

  const handleSubmit = async () => {
    setError(''); setSubmitting(true)
    try {
      const ref = await addDoc(collection(db,'projects'), {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        level:       form.level,
        youtubeUrl:  form.youtubeUrl.trim(),
        githubUrl:   form.githubUrl.trim(),
        driveUrl:    form.driveUrl.trim(),
        links:       form.links.filter(l=>l.url.trim()),
        parts:       form.parts.filter(p=>p.trim()),
        authorId:    user.uid,
        authorName:  user.displayName || 'Anonymous',
        authorEmail: user.email || '',
        createdAt:   serverTimestamp(),
        rating:      0,
        ratingCount: 0,
        ratedBy:     [],
      })
      await setDoc(doc(db,'users',user.uid), { projectCount: increment(1) }, { merge:true })
      setSubmittedId(ref.id)
      setSubmitted(true)
    } catch(e) {
      console.error(e)
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const S = {
    page:    { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', overflowX:'hidden' },
    nav:     { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', position:'sticky', top:0, zIndex:100 },
    navIn:   { height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'800px', margin:'0 auto' },
    card:    { maxWidth:'680px', margin:'0 auto', padding:'clamp(24px,5vw,48px) 20px' },
    input:   { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none' },
    textarea:{ width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:'140px' },
    select:  { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', cursor:'pointer' },
    btnP:    { backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'12px 24px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'14px' },
    btnS:    { backgroundColor:'transparent', color:'#7a82a0', padding:'12px 24px', borderRadius:'7px', border:'1px solid #2a2f4a', cursor:'pointer', fontSize:'14px' },
    btnSm:   { backgroundColor:'#1a1d2e', color:'#7a82a0', padding:'6px 12px', borderRadius:'5px', border:'1px solid #2a2f4a', cursor:'pointer', fontSize:'12px' },
    error:   { backgroundColor:'rgba(255,100,100,.08)', border:'1px solid rgba(255,100,100,.2)', borderRadius:'6px', padding:'10px 14px', fontSize:'13px', color:'#ff8080', marginBottom:'16px' },
    label:   { display:'block', fontSize:'13px', fontWeight:500, color:'#dde1f0', marginBottom:'6px' },
    hint:    { fontSize:'11px', color:'#4a5070', marginTop:'5px' },
    field:   { marginBottom:'18px' },
    section: { backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'20px', marginBottom:'16px' },
    secHead: { fontSize:'14px', fontWeight:600, marginBottom:'14px' },
  }

  const steps = ['Details','Links','Review']
  const StepBar = () => (
    <div style={{ display:'flex', alignItems:'center', marginBottom:'28px', position:'relative' }}>
      <div style={{ position:'absolute', top:'14px', left:'14px', right:'14px', height:'1px', backgroundColor:'#2a2f4a', zIndex:0 }}/>
      {steps.map((s,i) => {
        const n=i+1; const done=step>n; const active=step===n
        return (
          <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', position:'relative', zIndex:1 }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, backgroundColor:done?'#2dd4a0':active?'#4a9eff':'#1a1d2e', border:`1.5px solid ${done?'#2dd4a0':active?'#4a9eff':'#2a2f4a'}`, color:(done||active)?'#fff':'#7a82a0' }}>{done?'check':n}</div>
            <div style={{ fontSize:'10px', color:active?'#4a9eff':'#7a82a0', fontWeight:active?600:400 }}>{s}</div>
          </div>
        )
      })}
    </div>
  )

  if (loading || !user) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#7a82a0' }}><div style={{ fontSize:'32px', marginBottom:'12px' }}>Loading...</div></div>
    </div>
  )

  if (submitted) return (
    <div style={S.page}>
      <nav style={S.nav}><div style={S.navIn}><a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', textDecoration:'none' }}><span style={{ color:'#4a9eff' }}>Assam</span> Innovates</a></div></nav>
      <div style={{ ...S.card, textAlign:'center', paddingTop:'60px' }}>
        <div style={{ fontSize:'56px', marginBottom:'20px' }}>🚀</div>
        <div style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, color:'#2dd4a0', marginBottom:'10px' }}>Project Submitted!</div>
        <p style={{ fontSize:'14px', color:'#7a82a0', lineHeight:1.7, marginBottom:'28px' }}><strong style={{ color:'#dde1f0' }}>{form.title}</strong> is now live.</p>
        <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href={`/projects/${submittedId}`} style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'12px 24px', borderRadius:'7px', textDecoration:'none', fontSize:'14px' }}>View Your Project</a>
          <a href="/projects" style={{ backgroundColor:'transparent', color:'#dde1f0', padding:'12px 24px', borderRadius:'7px', border:'1px solid #2a2f4a', textDecoration:'none', fontSize:'14px' }}>All Projects</a>
        </div>
      </div>
    </div>
  )

  const ytId = getYoutubeId(form.youtubeUrl)

  return (
    <div style={S.page}>
      <style>{`input:focus,select:focus,textarea:focus{border-color:#4a9eff!important} input::placeholder,textarea::placeholder{color:#4a5070}`}</style>
      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', textDecoration:'none' }}><span style={{ color:'#4a9eff' }}>Assam</span> Innovates</a>
          <a href="/projects" style={{ fontSize:'13px', color:'#7a82a0', textDecoration:'none' }}>Back to Projects</a>
        </div>
      </nav>

      <div style={S.card}>
        <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Share your work</div>
        <h1 style={{ fontSize:'clamp(22px,5vw,32px)', fontWeight:800, marginBottom:'6px' }}>Submit a Project</h1>
        <p style={{ color:'#7a82a0', fontSize:'14px', lineHeight:1.6, marginBottom:'24px' }}>Share your idea or build with the maker community across Assam.</p>

        <StepBar />
        {error && <div style={S.error}>{error}</div>}

        {step===1 && (
          <div>
            <div style={S.field}>
              <label style={S.label}>Project title *</label>
              <input style={S.input} placeholder="e.g. Solar-powered flood sensor for Brahmaputra villages" value={form.title} onChange={e=>update('title',e.target.value)}/>
            </div>
            <div style={S.field}>
              <label style={S.label}>Description *</label>
              <textarea style={S.textarea} placeholder="What does it do? How did you build it? What problem does it solve? What did you learn?" value={form.description} onChange={e=>update('description',e.target.value)}/>
              <div style={S.hint}>Explain the science or engineering behind your idea — this is what makes Assam Innovates different.</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap:'14px', marginBottom:'18px' }}>
              <div>
                <label style={S.label}>Category *</label>
                <select style={S.select} value={form.category} onChange={e=>update('category',e.target.value)}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Difficulty *</label>
                <select style={S.select} value={form.level} onChange={e=>update('level',e.target.value)}>
                  <option value="">Select level...</option>
                  {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={S.section}>
              <div style={S.secHead}>Bill of materials <span style={{ fontSize:'12px', color:'#7a82a0', fontWeight:400 }}>(optional)</span></div>
              {form.parts.map((part,i)=>(
                <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                  <input style={{ ...S.input, marginBottom:0 }} placeholder="e.g. Arduino Uno" value={part} onChange={e=>updatePart(i,e.target.value)}/>
                  {form.parts.length>1 && <button onClick={()=>removePart(i)} style={{ ...S.btnSm, flexShrink:0 }}>X</button>}
                </div>
              ))}
              <button onClick={addPart} style={S.btnSm}>+ Add part</button>
            </div>
            <button onClick={nextStep} style={{ ...S.btnP, width:'100%' }}>Continue to Links</button>
          </div>
        )}

        {step===2 && (
          <div>
            <div style={S.section}>
              <div style={S.secHead}>YouTube video <span style={{ fontSize:'12px', color:'#7a82a0', fontWeight:400 }}>(optional)</span></div>
              <input style={S.input} placeholder="https://youtube.com/watch?v=..." value={form.youtubeUrl} onChange={e=>update('youtubeUrl',e.target.value)}/>
              {ytId && (
                <div style={{ marginTop:'12px', borderRadius:'8px', overflow:'hidden', aspectRatio:'16/9', border:'1px solid #2a2f4a' }}>
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} style={{ border:'none', display:'block' }} allowFullScreen/>
                </div>
              )}
              <div style={S.hint}>Your video will embed directly on the project page.</div>
            </div>
            <div style={S.section}>
              <div style={S.secHead}>GitHub repository <span style={{ fontSize:'12px', color:'#7a82a0', fontWeight:400 }}>(optional)</span></div>
              <input style={S.input} placeholder="https://github.com/username/project" value={form.githubUrl} onChange={e=>update('githubUrl',e.target.value)}/>
            </div>
            <div style={S.section}>
              <div style={S.secHead}>Google Drive / diagrams <span style={{ fontSize:'12px', color:'#7a82a0', fontWeight:400 }}>(optional)</span></div>
              <input style={S.input} placeholder="https://drive.google.com/..." value={form.driveUrl} onChange={e=>update('driveUrl',e.target.value)}/>
              <div style={S.hint}>Share circuit diagrams, schematics, PDFs via Google Drive.</div>
            </div>
            <div style={S.section}>
              <div style={S.secHead}>Other links <span style={{ fontSize:'12px', color:'#7a82a0', fontWeight:400 }}>(optional)</span></div>
              {form.links.map((link,i)=>(
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto', gap:'8px', marginBottom:'8px', alignItems:'center' }}>
                  <input style={{ ...S.input, marginBottom:0 }} placeholder="Label" value={link.label} onChange={e=>updateLink(i,'label',e.target.value)}/>
                  <input style={{ ...S.input, marginBottom:0 }} placeholder="https://..." value={link.url} onChange={e=>updateLink(i,'url',e.target.value)}/>
                  {form.links.length>1 && <button onClick={()=>removeLink(i)} style={S.btnSm}>X</button>}
                </div>
              ))}
              <button onClick={addLink} style={S.btnSm}>+ Add link</button>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={nextStep} style={{ ...S.btnP, flex:1 }}>Review</button>
              <button onClick={()=>setStep(1)} style={S.btnS}>Back</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div>
            <div style={S.section}>
              <div style={S.secHead}>Review your submission</div>
              <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'4px', backgroundColor:'rgba(74,158,255,.1)', color:'#4a9eff' }}>{form.category}</span>
                <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'4px', backgroundColor:form.level==='Beginner'?'rgba(45,212,160,.1)':form.level==='Intermediate'?'rgba(240,165,0,.1)':'rgba(255,100,100,.1)', color:form.level==='Beginner'?'#2dd4a0':form.level==='Intermediate'?'#f0a500':'#ff6464' }}>{form.level}</span>
              </div>
              <div style={{ fontSize:'20px', fontWeight:700, marginBottom:'10px' }}>{form.title}</div>
              <div style={{ fontSize:'13px', color:'#7a82a0', lineHeight:1.7, marginBottom:'16px', whiteSpace:'pre-wrap' }}>{form.description}</div>
              {form.parts.filter(p=>p.trim()).length>0 && (
                <div style={{ marginBottom:'14px' }}>
                  <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', color:'#7a82a0', marginBottom:'8px' }}>Parts</div>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                    {form.parts.filter(p=>p.trim()).map((p,i)=>(
                      <span key={i} style={{ backgroundColor:'#13151f', border:'1px solid #2a2f4a', borderRadius:'4px', padding:'3px 8px', fontSize:'12px' }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:'5px', marginBottom:'14px' }}>
                {form.youtubeUrl && <div style={{ fontSize:'13px', color:'#7a82a0' }}>YouTube video attached</div>}
                {form.githubUrl  && <div style={{ fontSize:'13px', color:'#7a82a0' }}>GitHub repo linked</div>}
                {form.driveUrl   && <div style={{ fontSize:'13px', color:'#7a82a0' }}>Google Drive linked</div>}
                {form.links.filter(l=>l.url.trim()).map((l,i)=>(
                  <div key={i} style={{ fontSize:'13px', color:'#7a82a0' }}>{l.label || l.url}</div>
                ))}
              </div>
              <div style={{ paddingTop:'12px', borderTop:'1px solid #2a2f4a', fontSize:'13px', color:'#7a82a0' }}>
                Submitting as <strong style={{ color:'#dde1f0' }}>{user.displayName || user.email}</strong>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleSubmit} disabled={submitting} style={{ ...S.btnP, flex:1, backgroundColor:'#2dd4a0', color:'#0d0f14', opacity:submitting?.6:1, cursor:submitting?'not-allowed':'pointer' }}>
                {submitting ? 'Submitting...' : 'Submit Project'}
              </button>
              <button onClick={()=>setStep(2)} style={S.btnS}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}