'use client'
import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore'

const CATEGORIES = ['All', 'Q&A', 'Failure Log', 'Local Tips', 'Lab Notes', 'Showcase']
const TOPICS     = ['IoT', 'Robotics', 'Renewable Energy', 'PCB Design', 'Arduino', 'Raspberry Pi', 'Sensors', '3D Printing', 'General']

const tagStyle = {
  'Q&A':         { bg: 'rgba(74,158,255,.1)',   color: '#4a9eff' },
  'Failure Log': { bg: 'rgba(45,212,160,.1)',   color: '#2dd4a0' },
  'Local Tips':  { bg: 'rgba(240,165,0,.1)',    color: '#f0a500' },
  'Lab Notes':   { bg: 'rgba(167,139,250,.1)',  color: '#a78bfa' },
  'Showcase':    { bg: 'rgba(255,100,100,.1)',  color: '#ff7070' },
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now() - d) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'
}

const avatarColors = ['#4a9eff','#2dd4a0','#f0a500','#a78bfa','#ff7070','#00b4ff']
function avatarColor(name) {
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

export default function ForumPage() {
  const [threads, setThreads]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [category, setCategory]       = useState('All')
  const [search, setSearch]           = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)

  // Identity (stored in localStorage)
  const [identity, setIdentity]       = useState({ name: '', town: '' })
  const [showIdentity, setShowIdentity] = useState(false)
  const [identitySet, setIdentitySet] = useState(false)

  // New thread form
  const [form, setForm] = useState({ title: '', type: 'Q&A', topic: 'General', content: '' })
  const [posting, setPosting]         = useState(false)
  const [formError, setFormError]     = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('ai_identity')
    if (saved) { setIdentity(JSON.parse(saved)); setIdentitySet(true) }
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const saveIdentity = () => {
    if (!identity.name.trim() || !identity.town.trim()) return
    localStorage.setItem('ai_identity', JSON.stringify(identity))
    setIdentitySet(true)
    setShowIdentity(false)
    setShowComposer(true)
  }

  const handleNewThread = () => {
    if (!identitySet) { setShowIdentity(true) }
    else { setShowComposer(true) }
  }

  const submitThread = async () => {
    setFormError('')
    if (!form.title.trim())   { setFormError('Please add a title.'); return }
    if (!form.content.trim()) { setFormError('Please write something in your post.'); return }
    setPosting(true)
    try {
      await addDoc(collection(db, 'threads'), {
        title:       form.title.trim(),
        type:        form.type,
        topic:       form.topic,
        content:     form.content.trim(),
        authorName:  identity.name,
        authorTown:  identity.town,
        replyCount:  0,
        likes:       0,
        createdAt:   serverTimestamp(),
      })
      setForm({ title: '', type: 'Q&A', topic: 'General', content: '' })
      setShowComposer(false)
      fetchThreads()
    } catch(e) { setFormError('Something went wrong. Please try again.') }
    setPosting(false)
  }

  const likeThread = async (id, e) => {
    e.stopPropagation()
    await updateDoc(doc(db, 'threads', id), { likes: increment(1) })
    setThreads(prev => prev.map(t => t.id === id ? { ...t, likes: (t.likes||0)+1 } : t))
  }

  const filtered = threads.filter(t => {
    const matchCat    = category === 'All' || t.type === category
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) ||
                        t.authorName?.toLowerCase().includes(search.toLowerCase()) ||
                        t.authorTown?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const S = {
    page:    { backgroundColor: '#13151f', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', color: '#dde1f0', overflowX: 'hidden' },
    nav:     { backgroundColor: '#1a1d2e', borderBottom: '1px solid #2a2f4a', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 },
    navIn:   { height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto' },
    logo:    { fontWeight: 700, fontSize: '15px', color: '#dde1f0', textDecoration: 'none' },
    input:   { width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
    select:  { width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
    textarea:{ width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '100px' },
    btnP:    { backgroundColor: '#4a9eff', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    btnS:    { backgroundColor: 'transparent', color: '#7a82a0', padding: '10px 20px', borderRadius: '6px', border: '1px solid #2a2f4a', cursor: 'pointer', fontSize: '13px' },
    error:   { backgroundColor: 'rgba(255,100,100,.08)', border: '1px solid rgba(255,100,100,.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#ff8080', marginBottom: '12px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200, padding: '0' },
    modal:   { backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '14px 14px 0 0', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '20px' },
  }

  return (
    <div style={S.page}>
      <style>{`
        input:focus,select:focus,textarea:focus{border-color:#4a9eff!important}
        input::placeholder,textarea::placeholder{color:#4a5070}
        @media(max-width:639px){.desk-nav{display:none!important}.ham-btn{display:flex!important}.filter-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}}
        @media(min-width:640px){.ham-btn{display:none!important}}
        .thread-row:hover{background:rgba(255,255,255,.02)!important;cursor:pointer}
        .like-btn:hover{color:#4a9eff!important}
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={S.logo}><span style={{color:'#4a9eff'}}>Assam</span> Innovates</a>
          <div className="desk-nav" style={{display:'flex',gap:'24px',fontSize:'13px',color:'#7a82a0'}}>
            <a href="/"         style={{color:'#7a82a0',textDecoration:'none'}}>Home</a>
            <a href="/projects" style={{color:'#7a82a0',textDecoration:'none'}}>Projects</a>
            <a href="/forum"    style={{color:'#4a9eff',textDecoration:'none',fontWeight:600}}>Forum</a>
            <a href="/register" style={{color:'#7a82a0',textDecoration:'none'}}>Join</a>
          </div>
          <button className="ham-btn" onClick={()=>setMenuOpen(!menuOpen)}
            style={{display:'none',background:'none',border:'1px solid #2a2f4a',borderRadius:'5px',padding:'6px 10px',cursor:'pointer',color:'#dde1f0',fontSize:'16px',alignItems:'center'}}>
            {menuOpen?'✕':'☰'}
          </button>
        </div>
        {menuOpen&&(
          <div style={{borderTop:'1px solid #2a2f4a',padding:'12px 20px',display:'flex',flexDirection:'column',gap:'10px',maxWidth:'1100px',margin:'0 auto'}}>
            {[['/','Home'],['/projects','Projects'],['/forum','Forum'],['/register','Join']].map(([href,label])=>(
              <a key={label} href={href} style={{color:label==='Forum'?'#4a9eff':'#7a82a0',textDecoration:'none',fontSize:'14px',fontWeight:label==='Forum'?600:400}}>{label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* PAGE HEADER */}
      <div style={{padding:'clamp(28px,6vw,48px) 20px 24px',borderBottom:'1px solid #2a2f4a',maxWidth:'1100px',margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'1.5px',color:'#4a9eff',textTransform:'uppercase',marginBottom:'8px'}}>Community Forum</div>
            <h1 style={{fontSize:'clamp(22px,5vw,36px)',fontWeight:800,letterSpacing:'-.5px',marginBottom:'8px'}}>Where Failures Become Features</h1>
            <p style={{color:'#7a82a0',fontSize:'14px',lineHeight:1.6}}>Ask questions · Share experiments · Help others debug · Celebrate what went wrong</p>
          </div>
          <button onClick={handleNewThread} style={{...S.btnP,whiteSpace:'nowrap',flexShrink:0}}>+ New Thread</button>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{borderBottom:'1px solid #2a2f4a',maxWidth:'1100px',margin:'0 auto',padding:'12px 20px'}}>
        <input placeholder="Search threads, authors, towns..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{...S.input,marginBottom:'10px'}}/>
        <div className="filter-scroll" style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCategory(c)} style={{
              backgroundColor:category===c?'rgba(74,158,255,.1)':'transparent',
              color:category===c?'#4a9eff':'#7a82a0',
              border:`1px solid ${category===c?'#4a9eff':'#2a2f4a'}`,
              borderRadius:'5px',padding:'6px 12px',fontSize:'12px',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'
            }}>{c}</button>
          ))}
          <span style={{marginLeft:'auto',fontSize:'12px',color:'#7a82a0',alignSelf:'center'}}>{filtered.length} thread{filtered.length!==1?'s':''}</span>
        </div>
      </div>

      {/* THREAD LIST */}
      <div style={{maxWidth:'1100px',margin:'0 auto'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'60px 20px',color:'#7a82a0'}}>
            <div style={{fontSize:'24px',marginBottom:'12px'}}>⚡</div>
            <div>Loading threads...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',color:'#7a82a0'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>💬</div>
            <div style={{fontSize:'15px',fontWeight:600,marginBottom:'6px',color:'#dde1f0'}}>No threads yet</div>
            <div style={{fontSize:'13px',marginBottom:'20px'}}>Be the first to start a discussion!</div>
            <button onClick={handleNewThread} style={S.btnP}>Start the first thread →</button>
          </div>
        ) : filtered.map(t => (
          <a key={t.id} href={`/forum/${t.id}`} style={{textDecoration:'none'}}>
            <div className="thread-row" style={{padding:'16px 20px',borderBottom:'1px solid #2a2f4a',display:'flex',gap:'12px',background:'transparent',transition:'background .1s'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor(t.authorName)},#13151f)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff',flexShrink:0}}>
                {initials(t.authorName)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:'8px',marginBottom:'5px',flexWrap:'wrap'}}>
                  <div style={{fontSize:'clamp(13px,3.5vw,15px)',fontWeight:600,color:'#dde1f0',lineHeight:1.4,flex:1}}>
                    {t.title}
                  </div>
                  {t.type && (
                    <span style={{fontSize:'9px',fontWeight:700,padding:'2px 8px',borderRadius:'3px',backgroundColor:tagStyle[t.type]?.bg,color:tagStyle[t.type]?.color,flexShrink:0,whiteSpace:'nowrap'}}>
                      {t.type==='Failure Log'?'✓ Failure Log':t.type}
                    </span>
                  )}
                </div>
                <div style={{fontSize:'11px',color:'#7a82a0',display:'flex',gap:'12px',flexWrap:'wrap'}}>
                  <span>{t.authorName} · {t.authorTown}</span>
                  {t.topic&&<span>{t.topic}</span>}
                  <span>{timeAgo(t.createdAt)}</span>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px',flexShrink:0}}>
                <span style={{fontSize:'12px',color:'#7a82a0'}}>💬 {t.replyCount||0}</span>
                <button className="like-btn" onClick={e=>likeThread(t.id,e)}
                  style={{fontSize:'12px',color:'#7a82a0',background:'none',border:'none',cursor:'pointer',padding:0,transition:'color .15s'}}>
                  👍 {t.likes||0}
                </button>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* IDENTITY MODAL */}
      {showIdentity&&(
        <div style={S.overlay} onClick={()=>setShowIdentity(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{width:'36px',height:'4px',background:'#2a2f4a',borderRadius:'2px',margin:'0 auto 16px'}}/>
            <div style={{fontSize:'18px',fontWeight:800,marginBottom:'6px'}}>Who are you?</div>
            <p style={{fontSize:'13px',color:'#7a82a0',marginBottom:'20px',lineHeight:1.6}}>
              You only need to do this once. Your name and town will appear on your posts so the community knows who you are.
            </p>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Your name <span style={{color:'#4a9eff'}}>*</span></label>
              <input style={S.input} placeholder="e.g. Your Name" value={identity.name} onChange={e=>setIdentity(p=>({...p,name:e.target.value}))}/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Your town in Assam <span style={{color:'#4a9eff'}}>*</span></label>
              <input style={S.input} placeholder="e.g. Jorhat" value={identity.town} onChange={e=>setIdentity(p=>({...p,town:e.target.value}))}/>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={saveIdentity} style={{...S.btnP,flex:1}} disabled={!identity.name.trim()||!identity.town.trim()}>
                Continue →
              </button>
              <button onClick={()=>setShowIdentity(false)} style={{...S.btnS,flex:1}}>Cancel</button>
            </div>
            <p style={{fontSize:'11px',color:'#4a5070',marginTop:'12px',textAlign:'center'}}>
              Anyone can read posts. Only your name and town are stored — no password needed.
            </p>
          </div>
        </div>
      )}

      {/* NEW THREAD COMPOSER */}
      {showComposer&&(
        <div style={S.overlay} onClick={()=>setShowComposer(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{width:'36px',height:'4px',background:'#2a2f4a',borderRadius:'2px',margin:'0 auto 16px'}}/>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
              <div style={{fontSize:'18px',fontWeight:800}}>Start a new thread</div>
              <button onClick={()=>setShowComposer(false)} style={{background:'none',border:'1px solid #2a2f4a',borderRadius:'5px',padding:'4px 9px',cursor:'pointer',color:'#7a82a0',fontSize:'14px'}}>✕</button>
            </div>

            {formError&&<div style={S.error}>{formError}</div>}

            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',backgroundColor:'#13151f',borderRadius:'6px',border:'1px solid #2a2f4a',marginBottom:'16px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor(identity.name)},#20243a)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:'#fff',flexShrink:0}}>
                {initials(identity.name)}
              </div>
              <div>
                <div style={{fontSize:'13px',fontWeight:600,color:'#dde1f0'}}>{identity.name}</div>
                <div style={{fontSize:'11px',color:'#7a82a0'}}>{identity.town}, Assam</div>
              </div>
              <button onClick={()=>{setShowComposer(false);setShowIdentity(true)}} style={{marginLeft:'auto',background:'none',border:'none',color:'#4a9eff',fontSize:'11px',cursor:'pointer',textDecoration:'underline'}}>Change</button>
            </div>

            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Thread type</label>
              <select style={S.select} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                <option>Q&A</option>
                <option>Failure Log</option>
                <option>Local Tips</option>
                <option>Lab Notes</option>
                <option>Showcase</option>
              </select>
            </div>

            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Title <span style={{color:'#4a9eff'}}>*</span></label>
              <input style={S.input} placeholder="What's your question or topic?" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/>
            </div>

            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Topic</label>
              <select style={S.select} value={form.topic} onChange={e=>setForm(p=>({...p,topic:e.target.value}))}>
                {TOPICS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Your post <span style={{color:'#4a9eff'}}>*</span></label>
              <textarea style={S.textarea} placeholder="Share the details. The more context you give, the better help you'll get..." value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}/>
            </div>

            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={submitThread} disabled={posting}
                style={{...S.btnP,flex:1,opacity:posting?.6:1,cursor:posting?'not-allowed':'pointer'}}>
                {posting?'Posting...':'Post Thread →'}
              </button>
              <button onClick={()=>setShowComposer(false)} style={{...S.btnS,flex:1}}>Cancel</button>
            </div>
            <div style={{height:'16px'}}/>
          </div>
        </div>
      )}
    </div>
  )
}