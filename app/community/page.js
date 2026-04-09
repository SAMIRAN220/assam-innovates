'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const skillColors = {
  Spark:    { color:'#f0a500', bg:'rgba(240,165,0,.1)'    },
  Current:  { color:'#2dd4a0', bg:'rgba(45,212,160,.1)'   },
  Power:    { color:'#4a9eff', bg:'rgba(74,158,255,.1)'    },
  LabNotes: { color:'#a78bfa', bg:'rgba(167,139,250,.1)'   },
}

const avatarColors = ['#4a9eff','#2dd4a0','#f0a500','#a78bfa','#ff7070','#00b4ff']
function avatarColor(name) {
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [tab, setTab]           = useState('makers')
  const [makers, setMakers]     = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [usersSnap, projSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'))),
        ])
        setMakers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    fetchAll()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('tab')
    if (t) setTab(t)
  }, [])

  // Derive towns from makers
  const townMap = {}
  makers.forEach(m => {
    if (m.town) {
      if (!townMap[m.town]) townMap[m.town] = []
      townMap[m.town].push(m)
    }
  })
  const towns = Object.entries(townMap).sort((a,b) => b[1].length - a[1].length)

  // Derive learning paths from makers
  const pathMap = { Spark:[], Current:[], Power:[], LabNotes:[] }
  makers.forEach(m => { if (m.skillLevel && pathMap[m.skillLevel]) pathMap[m.skillLevel].push(m) })

  const filteredMakers = makers.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.town?.toLowerCase().includes(search.toLowerCase()) ||
    m.skillLevel?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredProjects = projects.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.authorName?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredTowns = towns.filter(([t]) =>
    !search || t.toLowerCase().includes(search.toLowerCase())
  )

  const tabs = [
    { id:'makers',   label:'Active Makers',      count: makers.length    },
    { id:'towns',    label:'Towns in Assam',     count: towns.length     },
    { id:'projects', label:'Published Projects',  count: projects.length  },
    { id:'paths',    label:'Learning Paths',      count: 4                },
  ]

  const S = {
    page:  { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', overflowX:'hidden' },
    nav:   { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', position:'sticky', top:0, zIndex:100 },
    navIn: { height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'1100px', margin:'0 auto', gap:'12px' },
    wrap:  { maxWidth:'1100px', margin:'0 auto', padding:'0 20px 60px' },
    card:  { backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'16px 20px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'14px', transition:'border-color .15s', cursor:'default' },
    input: { width:'100%', backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'10px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none' },
  }

  return (
    <div style={S.page}>
      <style>{`
        * { box-sizing:border-box; }
        a { text-decoration:none; color:inherit; }
        input::placeholder { color:#4a5070; }
        input:focus { border-color:#4a9eff!important; }
        .maker-card:hover { border-color:#4a9eff!important; }
        .proj-card-c:hover { border-color:#4a9eff!important; transform:translateY(-1px); }
        .town-card:hover { border-color:#2dd4a0!important; }
        @media(max-width:639px){ .desk-nav{display:none!important} .mob-ham{display:flex!important} }
        @media(min-width:640px){ .mob-ham{display:none!important} }
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', flexShrink:0 }}>
            <span style={{ color:'#4a9eff' }}>Assam</span> Innovates
          </a>
          <div className="desk-nav" style={{ display:'flex', gap:'24px', fontSize:'13px', color:'#7a82a0', flex:1, justifyContent:'center' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/community','Community']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:label==='Community'?'#4a9eff':'#7a82a0', fontWeight:label==='Community'?600:400 }}>{label}</a>
            ))}
          </div>
          <div className="desk-nav" style={{ display:'flex', gap:'10px', alignItems:'center', flexShrink:0 }}>
            {user
              ? <a href="/profile" style={{ color:'#7a82a0', fontSize:'13px' }}>Profile</a>
              : <a href="/signup"  style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'7px 16px', borderRadius:'6px', fontSize:'13px' }}>Sign Up</a>
            }
          </div>
          <button className="mob-ham" onClick={()=>setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'1px solid #2a2f4a', borderRadius:'5px', padding:'6px 10px', cursor:'pointer', color:'#dde1f0', fontSize:'16px', alignItems:'center' }}>
            {menuOpen?'✕':'☰'}
          </button>
        </div>
        {menuOpen && (
          <div style={{ borderTop:'1px solid #2a2f4a', padding:'12px 0', display:'flex', flexDirection:'column' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/community','Community']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:label==='Community'?'#4a9eff':'#7a82a0', padding:'11px 4px', fontSize:'14px', borderBottom:'1px solid #20243a' }}>{label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* PAGE HEADER */}
      <div style={{ backgroundColor:'#13151f', borderBottom:'1px solid #2a2f4a', padding:'clamp(32px,6vw,56px) 20px 0' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>The community</div>
          <h1 style={{ fontSize:'clamp(24px,5vw,44px)', fontWeight:800, letterSpacing:'-.5px', marginBottom:'8px' }}>Assam Innovates Network</h1>
          <p style={{ color:'#7a82a0', fontSize:'14px', lineHeight:1.6, maxWidth:'520px', marginBottom:'28px' }}>
            Every maker, every town, every project — the full picture of Assam's growing electronics community.
          </p>

          {/* STAT TABS */}
          <div style={{ display:'flex', gap:'0', overflowX:'auto', borderBottom:'none' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setSearch('') }}
                style={{ backgroundColor:'transparent', border:'none', borderBottom:`2px solid ${tab===t.id?'#4a9eff':'transparent'}`, padding:'12px 20px', cursor:'pointer', color:tab===t.id?'#4a9eff':'#7a82a0', fontSize:'13px', fontWeight:tab===t.id?600:400, whiteSpace:'nowrap', fontFamily:'Inter,system-ui,sans-serif', transition:'color .15s' }}>
                <span style={{ fontSize:'18px', fontWeight:800, display:'block', color:tab===t.id?'#4a9eff':'#dde1f0', lineHeight:1.2 }}>{loading?'...':t.count}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={S.wrap}>
        {/* SEARCH */}
        <div style={{ padding:'20px 0 16px' }}>
          <input placeholder={`Search ${tab}...`} value={search} onChange={e=>setSearch(e.target.value)} style={S.input}/>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#7a82a0' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>⚡</div>
            <div>Loading community data...</div>
          </div>
        ) : (
          <>
            {/* ── MAKERS TAB ── */}
            {tab==='makers' && (
              <div>
                {filteredMakers.length===0 ? (
                  <div style={{ textAlign:'center', padding:'48px', color:'#7a82a0' }}>No makers found.</div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap:'10px' }}>
                    {filteredMakers.map(m => (
                      <div key={m.id} className="maker-card" style={{ ...S.card, cursor:'default' }}>
                        <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:`linear-gradient(135deg,${avatarColor(m.name)},#13151f)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0, overflow:'hidden' }}>
                          {m.photoURL ? <img src={m.photoURL} alt="" style={{ width:'44px', height:'44px', objectFit:'cover' }}/> : initials(m.name)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'3px' }}>{m.name || 'Anonymous'}</div>
                          <div style={{ fontSize:'12px', color:'#7a82a0', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                            {m.town && <span>📍 {m.town}</span>}
                            {m.projectCount > 0 && <span>🔨 {m.projectCount} project{m.projectCount!==1?'s':''}</span>}
                          </div>
                        </div>
                        {m.skillLevel && (
                          <span style={{ fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'99px', backgroundColor:skillColors[m.skillLevel]?.bg, color:skillColors[m.skillLevel]?.color, flexShrink:0, whiteSpace:'nowrap' }}>
                            {m.skillLevel}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!user && (
                  <div style={{ textAlign:'center', marginTop:'32px', padding:'24px', backgroundColor:'#1a1d2e', borderRadius:'10px', border:'1px solid #2a2f4a' }}>
                    <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'6px' }}>Want to appear here?</div>
                    <p style={{ fontSize:'13px', color:'#7a82a0', marginBottom:'14px' }}>Create a free account and join the map.</p>
                    <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'10px 22px', borderRadius:'7px', fontSize:'13px' }}>Sign Up Free →</a>
                  </div>
                )}
              </div>
            )}

            {/* ── TOWNS TAB ── */}
            {tab==='towns' && (
              <div>
                {filteredTowns.length===0 ? (
                  <div style={{ textAlign:'center', padding:'48px', color:'#7a82a0' }}>No towns found.</div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap:'10px' }}>
                    {filteredTowns.map(([town, townMakers]) => (
                      <div key={town} className="town-card" style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'18px 20px', transition:'border-color .15s' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
                          <div>
                            <div style={{ fontWeight:700, fontSize:'16px', marginBottom:'3px' }}>📍 {town}</div>
                            <div style={{ fontSize:'12px', color:'#7a82a0' }}>{townMakers.length} maker{townMakers.length!==1?'s':''}</div>
                          </div>
                          <div style={{ backgroundColor:'rgba(45,212,160,.1)', color:'#2dd4a0', fontWeight:700, fontSize:'18px', width:'36px', height:'36px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {townMakers.length}
                          </div>
                        </div>
                        {/* Avatar row */}
                        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                          {townMakers.slice(0,6).map((m,i) => (
                            <div key={i} title={m.name} style={{ width:'28px', height:'28px', borderRadius:'50%', background:`linear-gradient(135deg,${avatarColor(m.name)},#13151f)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700, color:'#fff', overflow:'hidden', border:'1px solid #2a2f4a' }}>
                              {m.photoURL ? <img src={m.photoURL} alt="" style={{ width:'28px', height:'28px', objectFit:'cover' }}/> : initials(m.name)}
                            </div>
                          ))}
                          {townMakers.length > 6 && (
                            <div style={{ width:'28px', height:'28px', borderRadius:'50%', backgroundColor:'#2a2f4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#7a82a0', fontWeight:600 }}>
                              +{townMakers.length-6}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PROJECTS TAB ── */}
            {tab==='projects' && (
              <div>
                {filteredProjects.length===0 ? (
                  <div style={{ textAlign:'center', padding:'48px', color:'#7a82a0' }}>
                    <div style={{ fontSize:'32px', marginBottom:'12px' }}>🔍</div>
                    <div style={{ marginBottom:'16px' }}>No projects found.</div>
                    {user && <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'10px 22px', borderRadius:'7px', fontSize:'14px' }}>Submit a Project →</a>}
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap:'10px' }}>
                    {filteredProjects.map(p => (
                      <a key={p.id} href={`/projects/${p.id}`} className="proj-card-c" style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'16px 20px', display:'block', transition:'all .15s' }}>
                        <div style={{ display:'flex', gap:'6px', marginBottom:'10px', flexWrap:'wrap' }}>
                          {p.level    && <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'4px', backgroundColor:p.level==='Beginner'?'rgba(45,212,160,.1)':p.level==='Intermediate'?'rgba(240,165,0,.1)':'rgba(255,100,100,.1)', color:p.level==='Beginner'?'#2dd4a0':p.level==='Intermediate'?'#f0a500':'#ff6464' }}>{p.level}</span>}
                          {p.category && <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'4px', backgroundColor:'rgba(74,158,255,.1)', color:'#4a9eff' }}>{p.category}</span>}
                        </div>
                        <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'6px', lineHeight:1.4 }}>{p.title}</div>
                        <div style={{ fontSize:'12px', color:'#7a82a0', marginBottom:'12px', lineHeight:1.5 }}>
                          {p.description?.length>80 ? p.description.slice(0,80)+'...' : p.description}
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'10px', borderTop:'1px solid #2a2f4a', fontSize:'12px', color:'#7a82a0' }}>
                          <span>{p.authorName}</span>
                          {p.ratingCount>0 && <span style={{ color:'#f0a500', fontWeight:600 }}>★ {p.rating?.toFixed(1)}</span>}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── LEARNING PATHS TAB ── */}
            {tab==='paths' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap:'16px' }}>
                {[
                  { id:'Spark',    label:'Spark',     tag:'Kids',         icon:'⚡', desc:'Fun, safe, and visual. No jargon, just discovery. Perfect for students aged 8–14.', example:'Lemon battery · LED circuits · Basic sensors' },
                  { id:'Current',  label:'Current',   tag:'Students',     icon:'🔬', desc:'Academic application combined with hands-on DIY builds. Learn the theory in action.', example:'Arduino weather station · Motor drivers · Displays' },
                  { id:'Power',    label:'Power',     tag:'Professionals', icon:'⚙️', desc:'Complex systems, PCB design, and scalable hardware architecture for real-world applications.', example:'Custom PCBs · LoRa networks · Automation systems' },
                  { id:'LabNotes', label:'Lab Notes', tag:'Researchers',   icon:'🧪', desc:'Deep dives into the physics, chemistry, and mathematics behind every project.', example:'Electron flow · Signal processing · Circuit theory' },
                ].map(path => {
                  const pathMakers = pathMap[path.id] || []
                  const sc = skillColors[path.id]
                  return (
                    <div key={path.id} style={{ backgroundColor:'#1a1d2e', border:`1px solid #2a2f4a`, borderTop:`3px solid ${sc?.color}`, borderRadius:'10px', padding:'20px' }}>
                      <div style={{ fontSize:'32px', marginBottom:'12px' }}>{path.icon}</div>
                      <div style={{ fontWeight:800, fontSize:'18px', marginBottom:'4px' }}>{path.label}</div>
                      <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 9px', borderRadius:'99px', backgroundColor:sc?.bg, color:sc?.color, display:'inline-block', marginBottom:'12px' }}>{path.tag}</span>
                      <p style={{ fontSize:'13px', color:'#7a82a0', lineHeight:1.6, marginBottom:'12px' }}>{path.desc}</p>
                      <div style={{ fontSize:'12px', color:'#4a9eff', backgroundColor:'rgba(74,158,255,.06)', borderRadius:'5px', padding:'6px 10px', marginBottom:'16px' }}>
                        Try: {path.example}
                      </div>
                      {/* Makers on this path */}
                      <div style={{ paddingTop:'14px', borderTop:'1px solid #2a2f4a' }}>
                        <div style={{ fontSize:'11px', color:'#7a82a0', marginBottom:'8px', fontWeight:500 }}>
                          {pathMakers.length} maker{pathMakers.length!==1?'s':''} on this path
                        </div>
                        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                          {pathMakers.slice(0,8).map((m,i) => (
                            <div key={i} title={m.name} style={{ width:'28px', height:'28px', borderRadius:'50%', background:`linear-gradient(135deg,${sc?.color},#13151f)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700, color:'#fff', border:'1px solid #2a2f4a', overflow:'hidden' }}>
                              {m.photoURL ? <img src={m.photoURL} alt="" style={{ width:'28px', height:'28px', objectFit:'cover' }}/> : initials(m.name)}
                            </div>
                          ))}
                          {pathMakers.length===0 && (
                            <span style={{ fontSize:'12px', color:'#4a5070' }}>Be the first →</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}