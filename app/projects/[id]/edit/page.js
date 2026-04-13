'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../../components/AuthProvider'
import { db } from '../../../../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const CLOUD_NAME    = 'dhxvthksg'
const UPLOAD_PRESET = 'assam-innovates'

const CATEGORIES = ['Electrical','Mechanical','Civil','Coding','Biology','Robotics','IoT','Renewable Energy','Other']
const LEVELS     = ['Beginner','Intermediate','Advanced']

function getYoutubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return m ? m[1] : null
}

export default function EditProjectPage() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const [project, setProject]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title:'', description:'', category:'', level:'',
    coverImage:'', youtubeUrl:'', githubUrl:'', driveUrl:'',
    links:[{ label:'', url:'' }],
    parts:[''],
  })

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login'
    if (user && id) fetchProject()
  }, [user, loading, id])

  const fetchProject = async () => {
    try {
      const snap = await getDoc(doc(db, 'projects', id))
      if (snap.exists()) {
        const data = snap.data()
        // Redirect if not the author
        if (data.authorId !== user.uid) {
          window.location.href = `/projects/${id}`
          return
        }
        setProject(data)
        setForm({
          title:       data.title       || '',
          description: data.description || '',
          category:    data.category    || '',
          level:       data.level       || '',
          coverImage:  data.coverImage  || '',
          youtubeUrl:  data.youtubeUrl  || '',
          githubUrl:   data.githubUrl   || '',
          driveUrl:    data.driveUrl    || '',
          links:       data.links?.length > 0 ? data.links : [{ label:'', url:'' }],
          parts:       data.parts?.length > 0 ? data.parts : [''],
        })
      }
    } catch(e) { console.error(e) }
  }

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }))
  const updatePart = (i, val) => { const a=[...form.parts]; a[i]=val; update('parts',a) }
  const addPart    = () => update('parts', [...form.parts,''])
  const removePart = (i) => update('parts', form.parts.filter((_,j)=>j!==i))
  const updateLink = (i,f,val) => { const a=[...form.links]; a[i]={...a[i],[f]:val}; update('links',a) }
  const addLink    = () => update('links', [...form.links,{label:'',url:''}])
  const removeLink = (i) => update('links', form.links.filter((_,j)=>j!==i))

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }
    setUploadingImage(true); setError('')
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', UPLOAD_PRESET)
    data.append('folder', 'assam-innovates')
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:data })
      const result = await res.json()
      if (result.secure_url) update('coverImage', result.secure_url)
      else setError('Upload failed. Please try again.')
    } catch(e) { setError('Upload failed. Please check your connection.') }
    setUploadingImage(false)
  }

  const handleSave = async () => {
    setError(''); setSaving(true)
    try {
      await updateDoc(doc(db, 'projects', id), {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        level:       form.level,
        coverImage:  form.coverImage,
        youtubeUrl:  form.youtubeUrl.trim(),
        githubUrl:   form.githubUrl.trim(),
        driveUrl:    form.driveUrl.trim(),
        links:       form.links.filter(l => l.url.trim()),
        parts:       form.parts.filter(p => p.trim()),
      })
      setSaved(true)
      setTimeout(() => window.location.href = `/projects/${id}`, 1500)
    } catch(e) { setError('Something went wrong. Please try again.') }
    setSaving(false)
  }

  const S = {
    page:     { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', overflowX:'hidden' },
    nav:      { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', position:'sticky', top:0, zIndex:100 },
    navIn:    { height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'800px', margin:'0 auto' },
    wrap:     { maxWidth:'720px', margin:'0 auto', padding:'24px 20px 60px' },
    input:    { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none' },
    textarea: { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:'140px' },
    select:   { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'11px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', cursor:'pointer' },
    btnP:     { backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'12px 24px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'14px' },
    btnS:     { backgroundColor:'transparent', color:'#7a82a0', padding:'12px 24px', borderRadius:'7px', border:'1px solid #2a2f4a', cursor:'pointer', fontSize:'14px' },
    btnSm:    { backgroundColor:'#1a1d2e', color:'#7a82a0', padding:'6px 12px', borderRadius:'5px', border:'1px solid #2a2f4a', cursor:'pointer', fontSize:'12px' },
    error:    { backgroundColor:'rgba(255,100,100,.08)', border:'1px solid rgba(255,100,100,.2)', borderRadius:'6px', padding:'10px 14px', fontSize:'13px', color:'#ff8080', marginBottom:'16px' },
    success:  { backgroundColor:'rgba(45,212,160,.08)', border:'1px solid rgba(45,212,160,.2)', borderRadius:'6px', padding:'10px 14px', fontSize:'13px', color:'#2dd4a0', marginBottom:'16px' },
    label:    { display:'block', fontSize:'13px', fontWeight:500, color:'#dde1f0', marginBottom:'6px' },
    field:    { marginBottom:'18px' },
    section:  { backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'20px', marginBottom:'16px' },
    secHead:  { fontSize:'14px', fontWeight:600, marginBottom:'14px' },
  }

  const ytId = getYoutubeId(form.youtubeUrl)

  if (loading || !user) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#7a82a0' }}><div style={{ fontSize:'32px', marginBottom:'12px' }}>⚡</div><div>Loading...</div></div>
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`input:focus,select:focus,textarea:focus{border-color:#4a9eff!important} input::placeholder,textarea::placeholder{color:#4a5070} .upload-zone:hover{border-color:#4a9eff!important}`}</style>

      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', textDecoration:'none' }}><span style={{ color:'#4a9eff' }}>Assam</span> Innovates</a>
          <a href={`/projects/${id}`} style={{ fontSize:'13px', color:'#7a82a0', textDecoration:'none' }}>← Back to project</a>
        </div>
      </nav>

      <div style={S.wrap}>
        <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Edit project</div>
        <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, marginBottom:'6px' }}>Update Your Project</h1>
        <p style={{ color:'#7a82a0', fontSize:'14px', lineHeight:1.6, marginBottom:'28px' }}>Make changes to your project — all updates are live immediately.</p>

        {error  && <div style={S.error}>{error}</div>}
        {saved  && <div style={S.success}>✅ Project updated! Redirecting...</div>}

        {/* BASIC DETAILS */}
        <div style={S.section}>
          <div style={S.secHead}>Project details</div>
          <div style={S.field}>
            <label style={S.label}>Project title *</label>
            <input style={S.input} value={form.title} onChange={e=>update('title',e.target.value)} placeholder="Project title"/>
          </div>
          <div style={S.field}>
            <label style={S.label}>Description *</label>
            <textarea style={S.textarea} value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Describe your project..."/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap:'14px' }}>
            <div>
              <label style={S.label}>Category</label>
              <select style={S.select} value={form.category} onChange={e=>update('category',e.target.value)}>
                <option value="">Select...</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Difficulty</label>
              <select style={S.select} value={form.level} onChange={e=>update('level',e.target.value)}>
                <option value="">Select...</option>
                {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* COVER IMAGE */}
        <div style={S.section}>
          <div style={S.secHead}>Cover image</div>
          {form.coverImage ? (
            <div style={{ position:'relative', borderRadius:'10px', overflow:'hidden', border:'1px solid #2a2f4a', marginBottom:'12px' }}>
              <img src={form.coverImage} alt="Cover" style={{ width:'100%', height:'200px', objectFit:'cover', display:'block' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%)' }}/>
              <div style={{ position:'absolute', bottom:'12px', left:'12px', right:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'12px', color:'#fff', fontWeight:600 }}>✅ Cover image set</span>
                <button onClick={() => update('coverImage','')} style={{ backgroundColor:'rgba(255,100,100,.2)', color:'#ff8080', border:'1px solid rgba(255,100,100,.3)', borderRadius:'5px', padding:'4px 10px', cursor:'pointer', fontSize:'11px' }}>Remove</button>
              </div>
            </div>
          ) : null}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} id="img-upload"/>
          <label htmlFor="img-upload" className="upload-zone" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px', border:'2px dashed #2a2f4a', borderRadius:'10px', padding:'24px', cursor:'pointer', backgroundColor:'rgba(74,158,255,.02)', transition:'border-color .2s' }}>
            {uploadingImage ? (
              <><div style={{ fontSize:'24px' }}>⏳</div><div style={{ fontSize:'14px', color:'#dde1f0' }}>Uploading...</div></>
            ) : (
              <><div style={{ fontSize:'28px' }}>📸</div><div style={{ fontSize:'13px', color:'#7a82a0' }}>{form.coverImage ? 'Upload a different image' : 'Click to upload cover image'}</div><div style={{ fontSize:'11px', color:'#4a5070' }}>JPG, PNG up to 10MB</div></>
            )}
          </label>
        </div>

        {/* YOUTUBE */}
        <div style={S.section}>
          <div style={S.secHead}>YouTube video</div>
          <input style={S.input} placeholder="https://youtube.com/watch?v=..." value={form.youtubeUrl} onChange={e=>update('youtubeUrl',e.target.value)}/>
          {ytId && (
            <div style={{ marginTop:'12px', borderRadius:'8px', overflow:'hidden', aspectRatio:'16/9', border:'1px solid #2a2f4a' }}>
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} style={{ border:'none', display:'block' }} allowFullScreen/>
            </div>
          )}
        </div>

        {/* GITHUB + DRIVE */}
        <div style={S.section}>
          <div style={S.secHead}>Links</div>
          <div style={S.field}>
            <label style={S.label}>GitHub repository</label>
            <input style={S.input} placeholder="https://github.com/..." value={form.githubUrl} onChange={e=>update('githubUrl',e.target.value)}/>
          </div>
          <div style={S.field}>
            <label style={S.label}>Google Drive / diagrams</label>
            <input style={S.input} placeholder="https://drive.google.com/..." value={form.driveUrl} onChange={e=>update('driveUrl',e.target.value)}/>
          </div>
          <div style={S.secHead}>Other links</div>
          {form.links.map((link,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto', gap:'8px', marginBottom:'8px', alignItems:'center' }}>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="Label" value={link.label} onChange={e=>updateLink(i,'label',e.target.value)}/>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="https://..." value={link.url} onChange={e=>updateLink(i,'url',e.target.value)}/>
              {form.links.length > 1 && <button onClick={() => removeLink(i)} style={S.btnSm}>✕</button>}
            </div>
          ))}
          <button onClick={addLink} style={S.btnSm}>+ Add link</button>
        </div>

        {/* PARTS */}
        <div style={S.section}>
          <div style={S.secHead}>Bill of materials</div>
          {form.parts.map((part,i) => (
            <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="e.g. Arduino Uno" value={part} onChange={e=>updatePart(i,e.target.value)}/>
              {form.parts.length > 1 && <button onClick={() => removePart(i)} style={{ ...S.btnSm, flexShrink:0 }}>✕</button>}
            </div>
          ))}
          <button onClick={addPart} style={S.btnSm}>+ Add part</button>
        </div>

        {/* SAVE */}
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={handleSave} disabled={saving || saved} style={{ ...S.btnP, flex:1, opacity:(saving||saved)?.6:1, cursor:(saving||saved)?'not-allowed':'pointer' }}>
            {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
          </button>
          <a href={`/projects/${id}`} style={{ ...S.btnS, textDecoration:'none', textAlign:'center' }}>Cancel</a>
        </div>
      </div>
    </div>
  )
}