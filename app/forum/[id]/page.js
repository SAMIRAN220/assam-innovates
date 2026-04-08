'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db } from '../../../lib/firebase'
import {
  doc, getDoc, collection, addDoc, getDocs,
  orderBy, query, serverTimestamp, updateDoc, increment
} from 'firebase/firestore'

const tagStyle = {
  'Q&A':         { bg: 'rgba(74,158,255,.1)',  color: '#4a9eff' },
  'Failure Log': { bg: 'rgba(45,212,160,.1)',  color: '#2dd4a0' },
  'Local Tips':  { bg: 'rgba(240,165,0,.1)',   color: '#f0a500' },
  'Lab Notes':   { bg: 'rgba(167,139,250,.1)', color: '#a78bfa' },
  'Showcase':    { bg: 'rgba(255,100,100,.1)', color: '#ff7070' },
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now() - d) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function initials(name) {
  return name ? name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '?'
}

const avatarColors = ['#4a9eff','#2dd4a0','#f0a500','#a78bfa','#ff7070','#00b4ff']
function avatarColor(name) {
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

export default function ThreadPage() {
  const { id }                          = useParams()
  const [thread, setThread]             = useState(null)
  const [replies, setReplies]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [replyText, setReplyText]       = useState('')
  const [posting, setPosting]           = useState(false)
  const [replyError, setReplyError]     = useState('')
  const [menuOpen, setMenuOpen]         = useState(false)
  const [identity, setIdentity]         = useState({ name: '', town: '' })
  const [identitySet, setIdentitySet]   = useState(false)
  const [showIdentity, setShowIdentity] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ai_identity')
    if (saved) { setIdentity(JSON.parse(saved)); setIdentitySet(true) }
    fetchThread()
  }, [id])

  const fetchThread = async () => {
    setLoading(true)
    try {
      const threadDoc = await getDoc(doc(db, 'threads', id))
      if (threadDoc.exists()) setThread({ id: threadDoc.id, ...threadDoc.data() })
      const q = query(collection(db, 'threads', id, 'replies'), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const saveIdentity = () => {
    if (!identity.name.trim() || !identity.town.trim()) return
    localStorage.setItem('ai_identity', JSON.stringify(identity))
    setIdentitySet(true)
    setShowIdentity(false)
  }

  const submitReply = async () => {
    if (!identitySet) { setShowIdentity(true); return }
    setReplyError('')
    if (!replyText.trim()) { setReplyError('Please write something before posting.'); return }
    setPosting(true)
    try {
      const replyRef = await addDoc(collection(db, 'threads', id, 'replies'), {
        content:    replyText.trim(),
        authorName: identity.name,
        authorTown: identity.town,
        likes:      0,
        createdAt:  serverTimestamp(),
      })
      await updateDoc(doc(db, 'threads', id), { replyCount: increment(1) })
      setReplies(prev => [...prev, {
        id: replyRef.id, content: replyText.trim(),
        authorName: identity.name, authorTown: identity.town,
        likes: 0, createdAt: null
      }])
      setReplyText('')
      setThread(prev => ({ ...prev, replyCount: (prev.replyCount||0)+1 }))
    } catch(e) { setReplyError('Something went wrong. Please try again.') }
    setPosting(false)
  }

  const likeReply = async (replyId) => {
    await updateDoc(doc(db, 'threads', id, 'replies', replyId), { likes: increment(1) })
    setReplies(prev => prev.map(r => r.id===replyId ? {...r,likes:(r.likes||0)+1} : r))
  }

  const likeThread = async () => {
    await updateDoc(doc(db, 'threads', id), { likes: increment(1) })
    setThread(prev => ({...prev, likes:(prev.likes||0)+1}))
  }

  const S = {
    page:     { backgroundColor: '#13151f', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', color: '#dde1f0', overflowX: 'hidden' },
    nav:      { backgroundColor: '#1a1d2e', borderBottom: '1px solid #2a2f4a', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 },
    navIn:    { height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto' },
    logo:     { fontWeight: 700, fontSize: '15px', color: '#dde1f0', textDecoration: 'none' },
    wrap:     { maxWidth: '800px', margin: '0 auto', padding: '0 20px 40px' },
    textarea: { width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '90px' },
    input:    { width: '100%', backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
    btnP:     { backgroundColor: '#4a9eff', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    btnS:     { backgroundColor: 'transparent', color: '#7a82a0', padding: '10px 20px', borderRadius: '6px', border: '1px solid #2a2f4a', cursor: 'pointer', fontSize: '13px' },
    error:    { backgroundColor: 'rgba(255,100,100,.08)', border: '1px solid rgba(255,100,100,.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#ff8080', marginBottom: '12px' },
    overlay:  { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 },
    modal:    { backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '14px 14px 0 0', width: '100%', maxWidth: '600px', padding: '20px' },
  }

  if (loading) return (
    <div style={{...S.page,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'#7a82a0'}}>
        <div style={{fontSize:'32px',marginBottom:'12px'}}>⚡</div>
        <div>Loading thread...</div>
      </div>
    </div>
  )

  if (!thread) return (
    <div style={{...S.page,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'#7a82a0'}}>
        <div style={{fontSize:'32px',marginBottom:'12px'}}>🔍</div>
        <div style={{marginBottom:'16px'}}>Thread not found.</div>
        <a href="/forum" style={{color:'#4a9eff'}}>← Back to Forum</a>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`
        textarea:focus,input:focus{border-color:#4a9eff!important}
        textarea::placeholder,input::placeholder{color:#4a5070}
        @media(max-width:639px){.desk-nav{display:none!important}.ham-btn{display:flex!important}}
        @media(min-width:640px){.ham-btn{display:none!important}}
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
          <div style={{borderTop:'1px solid #2a2f4a',padding:'12px 20px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {[['/','Home'],['/projects','Projects'],['/forum','Forum'],['/register','Join']].map(([href,label])=>(
              <a key={label} href={href} style={{color:label==='Forum'?'#4a9eff':'#7a82a0',textDecoration:'none',fontSize:'14px'}}>{label}</a>
            ))}
          </div>
        )}
      </nav>

      <div style={S.wrap}>
        {/* BACK LINK */}
        <div style={{padding:'20px 0 0'}}>
          <a href="/forum" style={{color:'#4a9eff',fontSize:'13px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'4px'}}>
            ← Back to Forum
          </a>
        </div>

        {/* THREAD HEADER */}
        <div style={{padding:'20px 0 24px',borderBottom:'1px solid #2a2f4a'}}>
          <div style={{display:'flex',gap:'8px',marginBottom:'12px',flexWrap:'wrap'}}>
            {thread.type&&(
              <span style={{fontSize:'10px',fontWeight:700,padding:'3px 10px',borderRadius:'3px',backgroundColor:tagStyle[thread.type]?.bg,color:tagStyle[thread.type]?.color}}>
                {thread.type==='Failure Log'?'✓ Failure Log':thread.type}
              </span>
            )}
            {thread.topic&&(
              <span style={{fontSize:'10px',fontWeight:600,padding:'3px 10px',borderRadius:'3px',backgroundColor:'rgba(74,158,255,.08)',color:'#4a9eff'}}>
                {thread.topic}
              </span>
            )}
          </div>
          <h1 style={{fontSize:'clamp(18px,5vw,26px)',fontWeight:800,lineHeight:1.3,marginBottom:'12px',letterSpacing:'-.3px'}}>
            {thread.title}
          </h1>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor(thread.authorName)},#13151f)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>
              {initials(thread.authorName)}
            </div>
            <div style={{fontSize:'13px'}}>
              <span style={{color:'#dde1f0',fontWeight:600}}>{thread.authorName}</span>
              <span style={{color:'#7a82a0'}}> · {thread.authorTown} · {timeAgo(thread.createdAt)}</span>
            </div>
            <div style={{marginLeft:'auto',display:'flex',gap:'12px',fontSize:'13px',color:'#7a82a0'}}>
              <span>💬 {thread.replyCount||0}</span>
              <button className="like-btn" onClick={likeThread}
                style={{color:'#7a82a0',background:'none',border:'none',cursor:'pointer',fontSize:'13px',padding:0,transition:'color .15s'}}>
                👍 {thread.likes||0}
              </button>
            </div>
          </div>
        </div>

        {/* ORIGINAL POST */}
        <div style={{padding:'24px 0',borderBottom:'1px solid #2a2f4a'}}>
          <div style={{display:'flex',gap:'12px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor(thread.authorName)},#13151f)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff',flexShrink:0}}>
              {initials(thread.authorName)}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                <span style={{fontSize:'14px',fontWeight:600,color:'#dde1f0'}}>{thread.authorName}</span>
                <span style={{fontSize:'9px',backgroundColor:'rgba(74,158,255,.1)',color:'#4a9eff',padding:'2px 6px',borderRadius:'3px',fontWeight:700}}>OP</span>
                <span style={{fontSize:'11px',color:'#7a82a0'}}>{thread.authorTown}</span>
              </div>
              <div style={{fontSize:'clamp(13px,3.5vw,15px)',color:'#aab0c8',lineHeight:1.8,whiteSpace:'pre-wrap'}}>
                {thread.content}
              </div>
            </div>
          </div>
        </div>

        {/* REPLIES */}
        {replies.length > 0 && (
          <div style={{borderBottom:'1px solid #2a2f4a'}}>
            <div style={{fontSize:'12px',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'#7a82a0',padding:'16px 0 8px'}}>
              {replies.length} {replies.length===1?'Reply':'Replies'}
            </div>
            {replies.map((r,i) => (
              <div key={r.id} style={{padding:'18px 0',borderTop:'1px solid #2a2f4a',display:'flex',gap:'12px'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor(r.authorName)},#13151f)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>
                  {initials(r.authorName)}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'13px',fontWeight:600,color:'#dde1f0'}}>{r.authorName}</span>
                    <span style={{fontSize:'11px',color:'#7a82a0'}}>{r.authorTown} · {timeAgo(r.createdAt)}</span>
                  </div>
                  <div style={{fontSize:'clamp(13px,3.5vw,14px)',color:'#aab0c8',lineHeight:1.7,whiteSpace:'pre-wrap',marginBottom:'10px'}}>
                    {r.content}
                  </div>
                  <button className="like-btn" onClick={()=>likeReply(r.id)}
                    style={{fontSize:'12px',color:'#7a82a0',background:'none',border:'none',cursor:'pointer',padding:0,transition:'color .15s'}}>
                    👍 {r.likes||0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPLY BOX */}
        <div style={{paddingTop:'24px'}}>
          <div style={{fontSize:'15px',fontWeight:700,marginBottom:'16px'}}>
            {identitySet ? `Reply as ${identity.name}` : 'Write a reply'}
          </div>
          {!identitySet && (
            <div style={{backgroundColor:'rgba(74,158,255,.06)',border:'1px solid rgba(74,158,255,.15)',borderRadius:'8px',padding:'12px 16px',marginBottom:'14px',fontSize:'13px',color:'#7a82a0'}}>
              You'll be asked for your name and town before posting — just once.
            </div>
          )}
          {replyError&&<div style={S.error}>{replyError}</div>}
          <textarea
            style={S.textarea}
            placeholder="Share what you know, what you've tried, or ask a follow-up question..."
            value={replyText}
            onChange={e=>setReplyText(e.target.value)}
          />
          <div style={{display:'flex',gap:'10px',marginTop:'10px',flexWrap:'wrap'}}>
            <button onClick={submitReply} disabled={posting}
              style={{...S.btnP,opacity:posting?.6:1,cursor:posting?'not-allowed':'pointer'}}>
              {posting?'Posting...':'Post Reply →'}
            </button>
            <a href="/forum" style={{...S.btnS,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>Cancel</a>
          </div>
        </div>
      </div>

      {/* IDENTITY MODAL */}
      {showIdentity&&(
        <div style={S.overlay} onClick={()=>setShowIdentity(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{width:'36px',height:'4px',background:'#2a2f4a',borderRadius:'2px',margin:'0 auto 16px'}}/>
            <div style={{fontSize:'18px',fontWeight:800,marginBottom:'6px'}}>Who are you?</div>
            <p style={{fontSize:'13px',color:'#7a82a0',marginBottom:'20px',lineHeight:1.6}}>
              Your name and town will appear on your reply. You only need to do this once.
            </p>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>Your name <span style={{color:'#4a9eff'}}>*</span></label>
              <input style={S.input} placeholder="e.g. Samiran Das" value={identity.name} onChange={e=>setIdentity(p=>({...p,name:e.target.value}))}/>
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
            <div style={{height:'16px'}}/>
          </div>
        </div>
      )}
    </div>
  )
}