'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

const LEVELS = ['All','Beginner','Intermediate','Advanced']
const CATS   = ['All Categories','Electrical','Mechanical','Civil','Coding','Biology','Robotics','IoT','Renewable Energy','Other']

const levelStyle = {
  Beginner:     { bg:'rgba(45,212,160,.1)',  color:'#2dd4a0' },
  Intermediate: { bg:'rgba(240,165,0,.1)',   color:'#f0a500' },
  Advanced:     { bg:'rgba(255,100,100,.1)', color:'#ff6464' },
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now()-d)/1000)
  if (diff<3600)  return Math.floor(diff/60)+'m ago'
  if (diff<86400) return Math.floor(diff/3600)+'h ago'
  return Math.floor(diff/86400)+'d ago'
}

const CAT_EMOJI = {
  Electrical:'⚡', Mechanical:'⚙️', Civil:'🏗️', Coding:'💻',
  Biology:'🧬', Robotics:'🤖', IoT:'📡', 'Renewable Energy':'☀️', Other:'🔬'
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [level, setLevel]       = useState('All')
  const [cat, setCat]           = useState('All Categories')
  const [search, setSearch]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const q = query(collection(db,'projects'), orderBy('createdAt','desc'))
      const snap = await getDocs(q)
      setProjects(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const filtered = projects.filter(p => {
    const ml = level==='All' || p.level===level
    const mc = cat==='All Categories' || p.category===cat
    const ms = !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
               p.description?.toLowerCase().includes(search.toLowerCase()) ||
               p.authorName?.toLowerCase().includes(search.toLowerCase())
    return ml && mc && ms
  })

  const S = {
    page:  { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', overflowX:'hidden' },
    nav:   { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 16px', position:'sticky', top:0, zIndex:100 },
    navIn: { height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'1100px', margin:'0 auto', gap:'12px' },
    input: { backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'6px', padding:'9px 12px', color:'#dde1f0', fontSize:'13px', outline:'none', width:'100%', marginBottom:'10px' },
  }

  return (
    <div style={S.page}>
      <style>{`
        * { box-sizing:border-box; }
        a { text-decoration:none; color:inherit; }
        input::placeholder{color:#4a5070}
        input:focus{border-color:#4a9eff!important;outline:none}
        .proj-card:hover{border-color:#4a9eff!important;transform:translateY(-1px)}
        @media(max-width:639px){.desk-nav{display:none!important}.mob-ham{display:flex!important}}
        @media(min-width:640px){.mob-ham{display:none!important}}
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', flexShrink:0 }}>
            <span style={{ color:'#4a9eff' }}>Assam</span> Innovates
          </a>

          {/* Desktop nav */}
          <div className="desk-nav" style={{ display:'flex', gap:'24px', fontSize:'13px', flex:1, justifyContent:'center' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:label==='Projects'?'#4a9eff':'#7a82a0', fontWeight:label==='Projects'?600:400 }}>{label}</a>
            ))}
          </div>

          {/* Desktop right buttons */}
          <div className="desk-nav" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            {user ? (
              <>
                <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'7px 16px', borderRadius:'6px', fontSize:'13px' }}>+ Submit Project</a>
                <a href="/profile" style={{ display:'flex', alignItems:'center', gap:'6px', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', padding:'6px 12px', borderRadius:'6px', fontSize:'13px', color:'#dde1f0' }}>👤 My Profile</a>
              </>
            ) : (
              <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'7px 16px', borderRadius:'6px', fontSize:'13px' }}>Join to Submit</a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="mob-ham" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'1px solid #2a2f4a', borderRadius:'5px', padding:'6px 10px', cursor:'pointer', color:'#dde1f0', fontSize:'16px', alignItems:'center' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown — single clean version */}
        {menuOpen && (
          <div style={{ borderTop:'1px solid #2a2f4a', padding:'12px 0', display:'flex', flexDirection:'column', backgroundColor:'#1a1d2e' }}>
            <a href="/"         style={{ color:'#7a82a0', padding:'11px 4px', fontSize:'14px', borderBottom:'1px solid #20243a' }}>Home</a>
            <a href="/projects" style={{ color:'#4a9eff', padding:'11px 4px', fontSize:'14px', borderBottom:'1px solid #20243a', fontWeight:600 }}>Projects</a>
            <a href="/forum"    style={{ color:'#7a82a0', padding:'11px 4px', fontSize:'14px', borderBottom:'1px solid #20243a' }}>Forum</a>
            {user && (
              <a href="/profile" style={{ color:'#4a9eff', padding:'11px 4px', fontSize:'14px', borderBottom:'1px solid #20243a', fontWeight:600 }}>👤 My Profile</a>
            )}
            {user ? (
              <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'11px', borderRadius:'6px', marginTop:'10px', textAlign:'center', fontSize:'14px' }}>+ Submit Project</a>
            ) : (
              <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'11px', borderRadius:'6px', marginTop:'10px', textAlign:'center', fontSize:'14px' }}>Join to Submit</a>
            )}
          </div>
        )}
      </nav>

      {/* PAGE HEADER */}
      <div style={{ padding:'clamp(28px,6vw,48px) 16px 24px', borderBottom:'1px solid #2a2f4a', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Project Hub</div>
            <h1 style={{ fontSize:'clamp(22px,5vw,40px)', fontWeight:800, marginBottom:'10px', lineHeight:1.1 }}>What Makers Are Building</h1>
            <p style={{ color:'#7a82a0', fontSize:'clamp(13px,3vw,15px)', maxWidth:'480px', lineHeight:1.6 }}>
              Real projects and ideas from makers across Assam. Submit yours and get rated by the community.
            </p>
          </div>
          {user && (
            <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'10px 22px', borderRadius:'7px', fontSize:'14px', flexShrink:0 }}>
              + Submit Your Project
            </a>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ borderBottom:'1px solid #2a2f4a', maxWidth:'1100px', margin:'0 auto', padding:'14px 16px' }}>
        <input type="text" placeholder="Search projects, authors..." value={search} onChange={e=>setSearch(e.target.value)} style={S.input}/>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
          {LEVELS.map(l=>(
            <button key={l} onClick={()=>setLevel(l)} style={{ backgroundColor:level===l?'#4a9eff':'#1a1d2e', color:level===l?'#fff':'#7a82a0', border:`1px solid ${level===l?'#4a9eff':'#2a2f4a'}`, borderRadius:'6px', padding:'6px 14px', fontSize:'12px', fontWeight:500, cursor:'pointer' }}>{l}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center' }}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ backgroundColor:cat===c?'rgba(45,212,160,.1)':'transparent', color:cat===c?'#2dd4a0':'#7a82a0', border:`1px solid ${cat===c?'#2dd4a0':'#2a2f4a'}`, borderRadius:'6px', padding:'5px 10px', fontSize:'11px', fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' }}>{c}</button>
          ))}
          <span style={{ marginLeft:'auto', fontSize:'12px', color:'#7a82a0' }}>{filtered.length} project{filtered.length!==1?'s':''}</span>
        </div>
      </div>

      {/* PROJECT GRID */}
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'20px 16px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:'14px' }}>
        {loading ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 20px', color:'#7a82a0' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>⚡</div>
            <div>Loading projects...</div>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 20px', color:'#7a82a0' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🔍</div>
            <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'6px', color:'#dde1f0' }}>
              {projects.length===0 ? 'No projects yet — be the first!' : 'No projects found'}
            </div>
            {user && projects.length===0 && (
              <a href="/submit" style={{ display:'inline-block', marginTop:'16px', backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'11px 24px', borderRadius:'7px', fontSize:'14px' }}>Submit the First Project</a>
            )}
          </div>
        ) : filtered.map(p => (
          <a key={p.id} href={`/projects/${p.id}`} style={{ textDecoration:'none' }}>
            <div className="proj-card" style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', overflow:'hidden', transition:'all .15s', height:'100%', display:'flex', flexDirection:'column' }}>
              {/* Thumbnail */}
              <div style={{ height:'clamp(80px,15vw,110px)', overflow:'hidden', borderBottom:'1px solid #2a2f4a', flexShrink:0, backgroundColor:'#13151f' }}>
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                ) : (
                  <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1e2235,#20243a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(32px,8vw,44px)' }}>
                    {CAT_EMOJI[p.category] || '🔬'}
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={{ padding:'clamp(10px,3vw,14px)', flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', gap:'5px', marginBottom:'8px', flexWrap:'wrap' }}>
                  {p.level    && <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'4px', backgroundColor:levelStyle[p.level]?.bg, color:levelStyle[p.level]?.color }}>{p.level}</span>}
                  {p.category && <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'4px', backgroundColor:'rgba(74,158,255,.1)', color:'#4a9eff' }}>{p.category}</span>}
                </div>
                <div style={{ fontWeight:700, fontSize:'clamp(13px,3.5vw,15px)', marginBottom:'6px', lineHeight:1.4, color:'#dde1f0' }}>{p.title}</div>
                <div style={{ fontSize:'clamp(11px,3vw,13px)', color:'#7a82a0', lineHeight:1.5, marginBottom:'12px', flex:1 }}>
                  {p.description?.length>90 ? p.description.slice(0,90)+'...' : p.description}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'10px', borderTop:'1px solid #2a2f4a', fontSize:'12px', color:'#7a82a0' }}>
                  <span>{p.authorName}</span>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    {p.ratingCount>0 && <span style={{ color:'#f0a500', fontWeight:600 }}>★ {p.rating?.toFixed(1)}</span>}
                    <span>{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* CTA for non-logged-in users */}
      {!user && !loading && projects.length>0 && (
        <div style={{ maxWidth:'1100px', margin:'0 auto 40px', padding:'0 16px' }}>
          <div style={{ background:'linear-gradient(135deg,rgba(74,158,255,.07),rgba(45,212,160,.05))', border:'1px solid #2a2f4a', borderRadius:'12px', padding:'28px', textAlign:'center' }}>
            <div style={{ fontSize:'18px', fontWeight:700, marginBottom:'8px' }}>Have a project or idea to share?</div>
            <p style={{ color:'#7a82a0', fontSize:'14px', marginBottom:'16px' }}>Create a free account to submit your own projects.</p>
            <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'11px 24px', borderRadius:'7px', fontSize:'14px' }}>Sign Up Free →</a>
          </div>
        </div>
      )}
    </div>
  )
}