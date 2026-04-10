'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { db } from '../lib/firebase'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const CAT_EMOJI = {
  Electrical:'⚡', Mechanical:'⚙️', Civil:'🏗️', Coding:'💻',
  Biology:'🧬', Robotics:'🤖', IoT:'📡', 'Renewable Energy':'☀️', Other:'🔬'
}

const levelStyle = {
  Beginner:     { bg:'#ECFDF5', color:'#065F46' },
  Intermediate: { bg:'#FFFBEB', color:'#92400E' },
  Advanced:     { bg:'#FEF2F2', color:'#991B1B' },
}

export default function Home() {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [projects, setProjects]   = useState([])
  const [makers, setMakers]       = useState([])
  const [towns, setTowns]         = useState(0)
  const [projLoading, setProjLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(3))),
          getDocs(collection(db, 'users')),
        ])
        setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        const users = usersSnap.docs.map(d => d.data())
        setMakers(users)
        setTowns(new Set(users.map(u => u.town).filter(Boolean)).size)
      } catch(e) { console.error(e) }
      setProjLoading(false)
    }
    fetchData()
  }, [])

  const avatarColors = ['#2563EB','#059669','#D97706','#7C3AED','#DC2626','#0891B2']
  function avatarColor(name) { return name ? avatarColors[name.charCodeAt(0) % avatarColors.length] : avatarColors[0] }

  // Ecosystem tiles — bold saturated colours matching the reference image
  const ecosystemTiles = [
    {
      icon: '{}',
      iconType: 'code',
      title: 'The Codebase',
      subtitle: 'Software & AI',
      bg: '#2563EB',
      link: '/projects?cat=Coding',
      pattern: 'code',
    },
    {
      icon: '⚙',
      iconType: 'gear',
      title: 'The Infrastructure',
      subtitle: 'Civil & Mechanical',
      bg: '#D97706',
      link: '/projects?cat=Civil',
      pattern: 'gear',
    },
    {
      icon: '⚡',
      iconType: 'bolt',
      title: 'The Energy Lab',
      subtitle: 'Electrical & Physics',
      bg: '#7C3AED',
      link: '/projects?cat=Electrical',
      pattern: 'bolt',
    },
    {
      icon: '🌿',
      iconType: 'leaf',
      title: 'The Bio-Hub',
      subtitle: 'Agri-tech & Life Sciences',
      bg: '#059669',
      link: '/projects?cat=Biology',
      pattern: 'leaf',
    },
  ]

  return (
    <main style={{ backgroundColor:'#F8F9FA', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#111827', overflowX:'hidden' }}>
      <style>{`
        * { box-sizing:border-box; }
        a { text-decoration:none; color:inherit; }
        .btn-p { background:#2563EB; color:#fff; font-weight:700; padding:13px 28px; border-radius:8px; border:none; cursor:pointer; font-size:15px; box-shadow:0 4px 14px rgba(37,99,235,.4); transition:box-shadow .15s,transform .1s; display:inline-block; }
        .btn-p:hover { box-shadow:0 6px 22px rgba(37,99,235,.55); }
        .btn-p:active { transform:translateY(2px); box-shadow:0 2px 6px rgba(37,99,235,.3); }
        .btn-g { background:#059669; color:#fff; font-weight:700; padding:13px 28px; border-radius:8px; border:none; cursor:pointer; font-size:15px; box-shadow:0 4px 14px rgba(5,150,105,.4); transition:box-shadow .15s,transform .1s; display:inline-block; }
        .btn-g:hover { box-shadow:0 6px 22px rgba(5,150,105,.55); }
        .btn-g:active { transform:translateY(2px); box-shadow:0 2px 6px rgba(5,150,105,.3); }
        .btn-o { background:#fff; color:#374151; font-weight:600; padding:12px 28px; border-radius:8px; border:2px solid #E5E7EB; cursor:pointer; font-size:14px; box-shadow:0 2px 8px rgba(0,0,0,.07); transition:all .15s; display:inline-block; }
        .btn-o:hover { border-color:#2563EB; color:#2563EB; box-shadow:0 4px 14px rgba(37,99,235,.15); }
        .btn-o:active { transform:translateY(1px); }
        .nav-link:hover { color:#2563EB !important; }
        .eco-tile { transition:transform .2s, box-shadow .2s, filter .2s; cursor:pointer; }
        .eco-tile:hover { transform:translateY(-6px) scale(1.02); box-shadow:0 20px 40px rgba(0,0,0,.2) !important; filter:brightness(1.05); }
        .eco-tile:active { transform:translateY(-2px); }
        .proj-card:hover { border-color:#2563EB !important; transform:translateY(-3px); box-shadow:0 10px 24px rgba(0,0,0,.12) !important; }
        .stat-box:hover { background:#EFF6FF !important; }
        .forum-card:hover { border-color:#2563EB !important; box-shadow:0 6px 16px rgba(37,99,235,.12) !important; }
        @media(max-width:639px) {
          .desk-nav{display:none!important} .mob-ham{display:flex!important}
          .stats-row{grid-template-columns:repeat(2,1fr)!important}
          .eco-grid{grid-template-columns:repeat(2,1fr)!important}
          .hero-grid{grid-template-columns:1fr!important}
          
        }
        @media(min-width:640px) { .mob-ham{display:none!important} }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ backgroundColor:'#fff', borderBottom:'1px solid #E5E7EB', padding:'0 24px', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ height:'62px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'1200px', margin:'0 auto', gap:'16px' }}>
          <a href="/" style={{ fontWeight:800, fontSize:'19px', color:'#111827', flexShrink:0 }}>
            <span style={{ color:'#2563EB' }}>Assam</span> Innovates
          </a>
          <div className="desk-nav" style={{ display:'flex', gap:'28px', fontSize:'14px', flex:1, justifyContent:'center' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/community','Community'],['/leaderboard','Leaderboard']].map(([href,label]) => (
              <a key={label} href={href} className="nav-link" style={{ color:'#6B7280', fontWeight:500, transition:'color .15s' }}>{label}</a>
            ))}
          </div>
          <div className="desk-nav" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            {!loading && (user ? (
              <>
                <a href="/submit" className="btn-g" style={{ padding:'8px 16px', fontSize:'13px' }}>+ Submit Project</a>
                <a href="/profile" style={{ display:'flex', alignItems:'center', gap:'8px', color:'#374151', fontSize:'13px', fontWeight:500, padding:'6px 10px', borderRadius:'8px', border:'1px solid #E5E7EB' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`linear-gradient(135deg,${avatarColor(user.displayName)},#6366f1)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, color:'#fff', overflow:'hidden', flexShrink:0 }}>
                    {user.photoURL ? <img src={user.photoURL} alt="" style={{ width:'28px', height:'28px', objectFit:'cover' }}/> : initials(user.displayName)}
                  </div>
                  {user.displayName?.split(' ')[0] || 'Profile'}
                </a>
                <button onClick={logout} style={{ background:'none', color:'#6B7280', fontSize:'13px', padding:'7px 12px', borderRadius:'6px', border:'1px solid #E5E7EB', cursor:'pointer' }}>Sign Out</button>
              </>
            ) : (
              <>
                <a href="/login"  style={{ color:'#6B7280', fontSize:'14px', padding:'8px 16px', borderRadius:'7px', border:'1px solid #E5E7EB', fontWeight:500 }}>Log In</a>
                <a href="/signup" className="btn-p" style={{ padding:'8px 18px', fontSize:'14px' }}>Sign Up Free</a>
              </>
            ))}
          </div>
          <button className="mob-ham" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'1px solid #E5E7EB', borderRadius:'6px', padding:'6px 10px', cursor:'pointer', color:'#374151', fontSize:'18px', alignItems:'center' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div style={{ borderTop:'1px solid #E5E7EB', padding:'12px 0', display:'flex', flexDirection:'column', backgroundColor:'#fff' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/community','Community'],['/leaderboard','Leaderboard']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:'#6B7280', padding:'12px 4px', fontSize:'15px', borderBottom:'1px solid #F3F4F6' }}>{label}</a>
            ))}
            {user ? (
              <>
                <a href="/submit"  style={{ color:'#059669', padding:'12px 4px', fontSize:'15px', borderBottom:'1px solid #F3F4F6', fontWeight:600 }}>+ Submit Project</a>
                <a href="/profile" style={{ color:'#2563EB', padding:'12px 4px', fontSize:'15px', borderBottom:'1px solid #F3F4F6' }}>My Profile</a>
                <button onClick={logout} style={{ background:'none', border:'none', color:'#6B7280', padding:'12px 0', fontSize:'15px', textAlign:'left', cursor:'pointer' }}>Sign Out</button>
              </>
            ) : (
              <>
                <a href="/login"  style={{ color:'#6B7280', padding:'12px 4px', fontSize:'15px', borderBottom:'1px solid #F3F4F6' }}>Log In</a>
                <a href="/signup" className="btn-p" style={{ marginTop:'12px', textAlign:'center', padding:'13px' }}>Sign Up Free</a>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ backgroundColor:'#fff', padding:'clamp(48px,8vw,88px) 24px', borderBottom:'1px solid #E5E7EB' }}>
      <div style={{ maxWidth:'720px', margin:'0 auto', textAlign:'center' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', backgroundColor:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'99px', padding:'6px 16px', fontSize:'12px', color:'#1D4ED8', marginBottom:'24px', fontWeight:600 }}>
              <span style={{ width:'7px', height:'7px', backgroundColor:'#10B981', borderRadius:'50%', display:'inline-block' }}></span>
              Community network · live from Assam
            </div>
            <h1 style={{ fontSize:'clamp(28px,5.5vw,54px)', fontWeight:900, lineHeight:1.1, letterSpacing:'-2px', marginBottom:'20px', color:'#111827' }}>
  Where <span style={{ color:'#2563EB' }}>Curiosity</span> Meets <span style={{ color:'#059669' }}>Collaboration</span>
</h1>
<h2 style={{ fontSize:'clamp(18px,3.5vw,28px)', fontWeight:700, color:'#374151', letterSpacing:'-.5px', marginBottom:'20px' }}>
  Assam&apos;s Multi-Disciplinary Tinkerspace
</h2>
<p style={{ fontSize:'clamp(14px,2.5vw,17px)', color:'#6B7280', lineHeight:1.75, marginBottom:'36px', maxWidth:'600px', margin:'0 auto 36px' }}>
              A hub for the makers of the Brahmaputra Valley. Whether you code, build, plant, or calculate — this is your space to innovate.
            </p>
            <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', justifyContent:'center' }}>
              <a href="/projects" className="btn-p">Explore Projects</a>
              <a href={user ? '/submit' : '/signup'} className="btn-g">
                {user ? '+ Submit Your Project' : 'Join the Community'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', backgroundColor:'#fff', borderBottom:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
        {[
          { num: projLoading ? '...' : (makers.length || 0), label:'Active Makers',       tab:'makers'   },
          { num: projLoading ? '...' : (towns || 0),         label:'Towns in Assam',      tab:'towns'    },
          { num: projLoading ? '...' : (projects.length||0), label:'Published Projects',  tab:'projects' },
          { num: 4,                                           label:'Learning Paths',      tab:'paths'    },
        ].map(({ num, label, tab }, i) => (
          <a key={label} href={`/community?tab=${tab}`} className="stat-box"
            style={{ textAlign:'center', padding:'clamp(16px,4vw,28px) 12px', borderRight:i<3?'1px solid #E5E7EB':'none', display:'block', transition:'background .15s' }}>
            <div style={{ fontSize:'clamp(22px,5vw,34px)', fontWeight:900, color:'#2563EB', letterSpacing:'-1px' }}>{num}</div>
            <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'4px', fontWeight:500 }}>{label}</div>
            <div style={{ fontSize:'10px', color:'#9CA3AF', marginTop:'3px' }}>View all →</div>
          </a>
        ))}
      </section>

      {/* ── EXPLORE THE ECOSYSTEM ── */}
      <section style={{ padding:'clamp(48px,8vw,80px) 24px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'2px', color:'#2563EB', textTransform:'uppercase', marginBottom:'8px' }}>Explore the Ecosystem</div>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
            <h2 style={{ fontSize:'clamp(22px,4vw,36px)', fontWeight:800, color:'#111827', letterSpacing:'-.5px' }}>Four Labs. Infinite Ideas.</h2>
            <a href="/projects" style={{ fontSize:'13px', color:'#2563EB', fontWeight:600 }}>Browse all projects →</a>
          </div>
          <div className="eco-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
            {ecosystemTiles.map(tile => (
              <a key={tile.title} href={tile.link} className="eco-tile"
                style={{ backgroundColor:tile.bg, borderRadius:'14px', padding:'clamp(20px,3vw,28px) 22px', display:'block', boxShadow:`0 6px 20px ${tile.bg}55`, minHeight:'160px', position:'relative', overflow:'hidden' }}>
                {/* Background pattern overlay */}
                <div style={{ position:'absolute', bottom:'-10px', right:'-10px', fontSize:'80px', opacity:.12, lineHeight:1 }}>
                  {tile.pattern==='code'?'{}':tile.pattern==='gear'?'⚙':tile.pattern==='bolt'?'⚡':'🌿'}
                </div>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ fontSize:'clamp(14px,2.5vw,17px)', fontWeight:800, color:'#fff', marginBottom:'6px', letterSpacing:'-.2px' }}>{tile.title}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,.75)', fontWeight:500, marginBottom:'20px' }}>{tile.subtitle}</div>
                  {/* Large icon */}
                  <div style={{ fontSize:'clamp(28px,5vw,44px)', opacity:.9 }}>
                    {tile.pattern==='code' ? (
                      <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'clamp(24px,4vw,38px)', color:'rgba(255,255,255,.9)' }}>{'{}'}</span>
                    ) : tile.pattern==='gear' ? (
                      <span style={{ fontSize:'clamp(28px,5vw,44px)' }}>⚙️</span>
                    ) : tile.pattern==='bolt' ? (
                      <span style={{ fontSize:'clamp(28px,5vw,44px)' }}>⚡</span>
                    ) : (
                      <span style={{ fontSize:'clamp(28px,5vw,44px)' }}>🌿</span>
                    )}
                  </div>
                  <div style={{ marginTop:'16px', fontSize:'12px', color:'rgba(255,255,255,.8)', fontWeight:600, display:'flex', alignItems:'center', gap:'4px' }}>
                    Explore {tile.subtitle.split('&')[0].trim()} →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE FROM THE VALLEY ── */}
      <section style={{ backgroundColor:'#fff', borderTop:'1px solid #E5E7EB', borderBottom:'1px solid #E5E7EB', padding:'clamp(40px,7vw,72px) 24px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'2px', color:'#059669', textTransform:'uppercase', marginBottom:'6px' }}>Community Spotlight</div>
              <h2 style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:800, color:'#111827', letterSpacing:'-.3px' }}>Live from the Valley</h2>
            </div>
            <a href={user ? '/forum' : '/signup'} className="btn-g" style={{ padding:'10px 22px', fontSize:'14px' }}>Join the Pulse →</a>
          </div>

          {projLoading ? (
            <div style={{ textAlign:'center', padding:'48px', color:'#9CA3AF', fontSize:'14px' }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'56px', backgroundColor:'#F9FAFB', borderRadius:'14px', border:'1px solid #E5E7EB' }}>
              <div style={{ fontSize:'44px', marginBottom:'14px' }}>🚀</div>
              <div style={{ fontSize:'18px', fontWeight:700, marginBottom:'8px', color:'#111827' }}>Be the first maker!</div>
              <p style={{ color:'#6B7280', fontSize:'14px', marginBottom:'24px' }}>Submit your project and inspire the valley.</p>
              <a href={user ? '/submit' : '/signup'} className="btn-p">
                {user ? 'Submit First Project →' : 'Sign Up to Submit →'}
              </a>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap:'16px' }}>
                {projects.map(p => (
                  <a key={p.id} href={`/projects/${p.id}`} className="proj-card"
                    style={{ backgroundColor:'#fff', border:'1.5px solid #E5E7EB', borderRadius:'14px', overflow:'hidden', display:'block', transition:'all .2s', boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
                    <div style={{ height:'130px', overflow:'hidden', borderBottom:'1px solid #E5E7EB', backgroundColor:'#F9FAFB', position:'relative' }}>
                      {p.coverImage ? (
                        <img src={p.coverImage} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      ) : (
                        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'52px', background:'linear-gradient(135deg,#EFF6FF,#ECFDF5)' }}>
                          {CAT_EMOJI[p.category] || '🔬'}
                        </div>
                      )}
                      <div style={{ position:'absolute', top:'10px', right:'10px', backgroundColor:'#059669', color:'#fff', fontSize:'9px', fontWeight:700, padding:'3px 9px', borderRadius:'99px', display:'flex', alignItems:'center', gap:'4px' }}>
                        <span style={{ width:'5px', height:'5px', borderRadius:'50%', backgroundColor:'#fff', display:'inline-block' }}></span>
                        LIVE
                      </div>
                    </div>
                    <div style={{ padding:'16px' }}>
                      <div style={{ display:'flex', gap:'6px', marginBottom:'8px', flexWrap:'wrap' }}>
                        {p.level    && <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'99px', backgroundColor:levelStyle[p.level]?.bg, color:levelStyle[p.level]?.color }}>{p.level}</span>}
                        {p.category && <span style={{ fontSize:'10px', fontWeight:600, padding:'3px 9px', borderRadius:'99px', backgroundColor:'#EFF6FF', color:'#1D4ED8' }}>{p.category}</span>}
                      </div>
                      <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'6px', lineHeight:1.4, color:'#111827' }}>{p.title}</div>
                      <div style={{ fontSize:'12px', color:'#9CA3AF', marginBottom:'12px', lineHeight:1.5 }}>
                        {p.description?.length > 80 ? p.description.slice(0,80)+'...' : p.description}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6B7280', paddingTop:'10px', borderTop:'1px solid #F3F4F6', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <div style={{ width:'22px', height:'22px', borderRadius:'50%', backgroundColor:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:700, color:'#fff' }}>
                            {initials(p.authorName)}
                          </div>
                          <span style={{ fontWeight:500 }}>{p.authorName}</span>
                        </div>
                        {p.ratingCount > 0 && <span style={{ color:'#D97706', fontWeight:700 }}>★ {p.rating?.toFixed(1)}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <div style={{ textAlign:'center', marginTop:'32px' }}>
                <a href="/projects" className="btn-o">View all Projects →</a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── ENGAGING FORUM PREVIEW ── */}
      <section style={{ padding:'clamp(48px,8vw,80px) 24px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'2px', color:'#D97706', textTransform:'uppercase', marginBottom:'8px' }}>Community Forum</div>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
            <h2 style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:800, color:'#111827', letterSpacing:'-.3px' }}>Engaging Forum</h2>
            <a href="/forum" style={{ fontSize:'13px', color:'#2563EB', fontWeight:600 }}>View all discussions →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,340px),1fr))', gap:'14px' }}>
            {[
              { title:'How to build a bamboo-reinforced structure for low-cost housing?', replies:23, tag:'Infrastructure', tagColor:'#D97706', tagBg:'#FFFBEB', avatars:['AS','MP','RK'], colors:['#2563EB','#059669','#D97706'] },
              { title:'Optimizing Python for low-end hardware in rural Assam', replies:18, tag:'Codebase', tagColor:'#2563EB', tagBg:'#EFF6FF', avatars:['BD','SK','AN'], colors:['#7C3AED','#059669','#2563EB'] },
              { title:'Best soil sensors for tea garden monitoring in the valley', replies:41, tag:'Bio-Hub', tagColor:'#059669', tagBg:'#ECFDF5', avatars:['RK','PD','MG'], colors:['#059669','#2563EB','#D97706'] },
            ].map((t, i) => (
              <a key={i} href="/forum" className="forum-card"
                style={{ backgroundColor:'#fff', border:'1.5px solid #E5E7EB', borderRadius:'14px', padding:'18px 20px', display:'block', transition:'all .2s', boxShadow:'0 2px 6px rgba(0,0,0,.05)' }}>
                <div style={{ display:'flex', gap:'8px', marginBottom:'10px', alignItems:'center' }}>
                  <span style={{ fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'99px', backgroundColor:t.tagBg, color:t.tagColor }}>{t.tag}</span>
                  <span style={{ fontSize:'10px', color:'#9CA3AF', fontWeight:500 }}>Current Discussion</span>
                </div>
                <div style={{ fontWeight:600, fontSize:'14px', color:'#111827', lineHeight:1.55, marginBottom:'16px' }}>{t.title}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ display:'flex' }}>
                      {t.avatars.map((av, j) => (
                        <div key={j} style={{ width:'26px', height:'26px', borderRadius:'50%', backgroundColor:t.colors[j], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700, color:'#fff', border:'2px solid #fff', marginLeft:j===0?0:'-7px', position:'relative', zIndex:3-j }}>
                          {av}
                          {j === 0 && <div style={{ position:'absolute', bottom:'0', right:'0', width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#10B981', border:'1.5px solid #fff' }}/>}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize:'11px', color:'#10B981', fontWeight:700 }}>Online Now</span>
                  </div>
                  <span style={{ fontSize:'12px', color:'#9CA3AF', fontWeight:500 }}>💬 {t.replies}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid #E5E7EB', padding:'48px 24px', backgroundColor:'#fff' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontWeight:900, fontSize:'22px', color:'#111827', marginBottom:'8px', letterSpacing:'-.5px' }}>
            <span style={{ color:'#2563EB' }}>Assam</span> Innovates
          </div>
          <p style={{ color:'#9CA3AF', fontSize:'13px', marginBottom:'24px' }}>The Multi-Disciplinary Tinkerspace of the Brahmaputra Valley</p>
          <div style={{ display:'flex', justifyContent:'center', gap:'28px', flexWrap:'wrap', marginBottom:'24px' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/community','Community'],['/leaderboard','Leaderboard']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:'#6B7280', fontSize:'13px', fontWeight:500 }}>{label}</a>
            ))}
          </div>
          <div style={{ fontSize:'12px', color:'#D1D5DB' }}>© 2026 Assam Innovates · Built with ❤️ in the Brahmaputra Valley</div>
        </div>
      </footer>
    </main>
  )
}