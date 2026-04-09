'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { db } from '../lib/firebase'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const levelStyle = {
  Beginner:     { bg:'rgba(45,212,160,.1)',  color:'#2dd4a0' },
  Intermediate: { bg:'rgba(240,165,0,.1)',   color:'#f0a500' },
  Advanced:     { bg:'rgba(255,100,100,.1)', color:'#ff6464' },
}

const CAT_EMOJI = {
  Electrical:'⚡', Mechanical:'⚙️', Civil:'🏗️', Coding:'💻',
  Biology:'🧬', Robotics:'🤖', IoT:'📡', 'Renewable Energy':'☀️', Other:'🔬'
}

export default function Home() {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [projects, setProjects]   = useState([])
  const [makers, setMakers]   = useState([])
const [towns, setTowns]     = useState(0)
  const [projLoading, setProjLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(3))
        const snap = await getDocs(q)
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch(e) { console.error(e) }
      setProjLoading(false)
    }
    fetchProjects()
  }, [])
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
        const uniqueTowns = new Set(users.map(u => u.town).filter(Boolean))
        setTowns(uniqueTowns.size)
      } catch(e) { console.error(e) }
      setProjLoading(false)
    }
    fetchData()
  }, [])

  return (
    <main style={{ backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', overflowX:'hidden' }}>
      <style>{`
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        @media(max-width:639px){.desk-nav{display:none!important}.mob-ham{display:flex!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(min-width:640px){.mob-ham{display:none!important}.mob-menu{display:none!important}}
        .nav-link:hover{color:#4a9eff!important}
        .proj-card:hover{border-color:#4a9eff!important;transform:translateY(-1px)}
        .path-card:hover{border-color:#4a9eff!important}
      `}</style>

      {/* NAV */}
      <nav style={{ backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'1100px', margin:'0 auto', gap:'16px' }}>
          <a href="/" style={{ fontWeight:800, fontSize:'17px', color:'#dde1f0', flexShrink:0 }}>
            <span style={{ color:'#4a9eff' }}>Assam</span> Innovates
          </a>
          <div className="desk-nav" style={{ display:'flex', gap:'24px', fontSize:'14px', color:'#7a82a0', flex:1, justifyContent:'center' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum']].map(([href,label]) => (
              <a key={label} href={href} className="nav-link" style={{ color:'#7a82a0', transition:'color .15s' }}>{label}</a>
            ))}
          </div>
          <div className="desk-nav" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            {!loading && (user ? (
              <>
                <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'7px 16px', borderRadius:'6px', fontSize:'13px' }}>+ Submit Project</a>
                <a href="/profile" style={{ display:'flex', alignItems:'center', gap:'7px', color:'#dde1f0', fontSize:'13px' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#4a9eff,#2dd4a0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, color:'#fff', overflow:'hidden' }}>
                    {user.photoURL ? <img src={user.photoURL} alt="" style={{ width:'28px', height:'28px', objectFit:'cover' }}/> : initials(user.displayName)}
                  </div>
                  {user.displayName?.split(' ')[0] || 'Profile'}
                </a>
                <button onClick={logout} style={{ backgroundColor:'transparent', color:'#7a82a0', fontSize:'13px', padding:'7px 12px', borderRadius:'6px', border:'1px solid #2a2f4a', cursor:'pointer' }}>Sign Out</button>
              </>
            ) : (
              <>
                <a href="/login"  style={{ color:'#7a82a0', fontSize:'13px', padding:'7px 14px', borderRadius:'6px', border:'1px solid #2a2f4a' }}>Log In</a>
                <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'8px 18px', borderRadius:'7px', fontSize:'13px' }}>Sign Up Free</a>
              </>
            ))}
          </div>
          <button className="mob-ham" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'1px solid #2a2f4a', borderRadius:'6px', padding:'6px 10px', cursor:'pointer', color:'#dde1f0', fontSize:'18px', alignItems:'center' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div className="mob-menu" style={{ borderTop:'1px solid #2a2f4a', padding:'12px 0', display:'flex', flexDirection:'column' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:'#7a82a0', padding:'11px 4px', fontSize:'15px', borderBottom:'1px solid #20243a' }}>{label}</a>
            ))}
            {user ? (
              <>
                <a href="/submit"  style={{ color:'#2dd4a0', padding:'11px 4px', fontSize:'15px', borderBottom:'1px solid #20243a' }}>+ Submit Project</a>
                <a href="/profile" style={{ color:'#4a9eff', padding:'11px 4px', fontSize:'15px', borderBottom:'1px solid #20243a' }}>My Profile</a>
                <button onClick={logout} style={{ backgroundColor:'transparent', color:'#7a82a0', padding:'11px 0', fontSize:'15px', border:'none', textAlign:'left', cursor:'pointer' }}>Sign Out</button>
              </>
            ) : (
              <>
                <a href="/login"  style={{ color:'#7a82a0', padding:'11px 4px', fontSize:'15px', borderBottom:'1px solid #20243a' }}>Log In</a>
                <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'12px', borderRadius:'7px', marginTop:'12px', textAlign:'center', fontSize:'14px' }}>Sign Up Free</a>
              </>
            )}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ textAlign:'center', padding:'clamp(48px,10vw,96px) 20px clamp(40px,8vw,80px)', borderBottom:'1px solid #2a2f4a', backgroundColor:'#13151f' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', backgroundColor:'rgba(0,180,255,.06)', border:'1px solid #2a2f4a', borderRadius:'4px', padding:'4px 14px', fontSize:'11px', color:'#7a82a0', marginBottom:'24px', fontWeight:600, letterSpacing:'.5px', textTransform:'uppercase' }}>
          <span style={{ width:'6px', height:'6px', backgroundColor:'#2dd4a0', borderRadius:'50%', display:'inline-block' }}></span>
          Built in Assam, for the world
        </div>
        <h1 style={{ fontSize:'clamp(32px,8vw,60px)', fontWeight:900, lineHeight:1.08, letterSpacing:'-1.5px', marginBottom:'18px' }}>
          Where <span style={{ color:'#4a9eff' }}>Electrons</span> Meet<br />
          <span style={{ color:'#2dd4a0' }}>Assam&apos;s</span> Innovators
        </h1>
        <p style={{ fontSize:'clamp(14px,4vw,17px)', color:'#7a82a0', maxWidth:'540px', margin:'0 auto 32px', lineHeight:1.7 }}>
          A hands-on electronics community for curious kids, ambitious students, and seasoned engineers — rooted in the Brahmaputra Valley, connected to the world.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/projects" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'13px 28px', borderRadius:'8px', fontSize:'clamp(14px,4vw,15px)' }}>
            Explore Projects
          </a>
          {user ? (
            <a href="/submit" style={{ backgroundColor:'transparent', color:'#2dd4a0', fontWeight:600, padding:'13px 28px', borderRadius:'8px', fontSize:'clamp(14px,4vw,15px)', border:'1px solid rgba(45,212,160,.3)' }}>
              + Submit Your Project
            </a>
          ) : (
            <a href="/signup" style={{ backgroundColor:'transparent', color:'#dde1f0', fontWeight:600, padding:'13px 28px', borderRadius:'8px', fontSize:'clamp(14px,4vw,15px)', border:'1px solid #2a2f4a' }}>
              Join the Community
            </a>
          )}
        </div>
      </section>

      {/* STATS */}
 {/* STATS — live counts from Firebase */}
<section className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a' }}>
  {[
    { num: makers.length   || '...', label:'Active Makers',      tab:'makers'   },
    { num: towns           || '...', label:'Towns in Assam',     tab:'towns'    },
    { num: projects.length || '...', label:'Published Projects', tab:'projects' },
    { num: 4,                        label:'Learning Paths',     tab:'paths'    },
  ].map(({ num, label, tab }, i) => (
    <a key={label} href={`/community?tab=${tab}`}
      style={{ textAlign:'center', padding:'clamp(16px,4vw,24px) 12px', borderRight:i<3?'1px solid #2a2f4a':'none', textDecoration:'none', display:'block', cursor:'pointer' }}
      onMouseEnter={e=>e.currentTarget.style.backgroundColor='#20243a'}
      onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
      <div style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, color:'#4a9eff' }}>{num}</div>
      <div style={{ fontSize:'12px', color:'#7a82a0', marginTop:'4px' }}>{label}</div>
      <div style={{ fontSize:'10px', color:'#4a5070', marginTop:'3px' }}>View all →</div>
    </a>
  ))}
</section>

      {/* LIVE PROJECTS FROM FIREBASE */}
      <section style={{ padding:'clamp(40px,8vw,72px) 20px', backgroundColor:'#13151f', borderTop:'1px solid #2a2f4a' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'2px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Project Hub</div>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:'12px', marginBottom:'24px' }}>
            <h2 style={{ fontSize:'clamp(22px,5vw,32px)', fontWeight:800 }}>What Makers Are Building</h2>
            <a href="/projects" style={{ fontSize:'13px', color:'#4a9eff', fontWeight:600 }}>View all →</a>
          </div>

          {projLoading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#7a82a0' }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 20px', backgroundColor:'#1a1d2e', borderRadius:'12px', border:'1px solid #2a2f4a' }}>
              <div style={{ fontSize:'36px', marginBottom:'12px' }}>🚀</div>
              <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'8px' }}>No projects yet — be the first!</div>
              <p style={{ color:'#7a82a0', fontSize:'14px', marginBottom:'20px' }}>Submit your idea or build and inspire the community.</p>
              <a href={user ? '/submit' : '/signup'} style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'11px 24px', borderRadius:'7px', fontSize:'14px' }}>
                {user ? 'Submit First Project →' : 'Sign Up to Submit →'}
              </a>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:'16px' }}>
                {projects.map(p => (
                  <a key={p.id} href={`/projects/${p.id}`} className="proj-card" style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', overflow:'hidden', display:'block', transition:'all .15s' }}>
                    <div style={{ height:'90px', background:'linear-gradient(135deg,#1e2235,#20243a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'44px', borderBottom:'1px solid #2a2f4a' }}>
                      {CAT_EMOJI[p.category] || '🔬'}
                    </div>
                    <div style={{ padding:'14px' }}>
                      <div style={{ display:'flex', gap:'6px', marginBottom:'8px', flexWrap:'wrap' }}>
                        {p.level    && <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'4px', backgroundColor:levelStyle[p.level]?.bg, color:levelStyle[p.level]?.color }}>{p.level}</span>}
                        {p.category && <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'4px', backgroundColor:'rgba(74,158,255,.1)', color:'#4a9eff' }}>{p.category}</span>}
                      </div>
                      <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'6px', lineHeight:1.4 }}>{p.title}</div>
                      <div style={{ fontSize:'12px', color:'#7a82a0', lineHeight:1.5, marginBottom:'10px' }}>
                        {p.description?.length > 80 ? p.description.slice(0,80)+'...' : p.description}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#7a82a0', paddingTop:'10px', borderTop:'1px solid #2a2f4a' }}>
                        <span>{p.authorName}</span>
                        {p.ratingCount > 0 && <span style={{ color:'#f0a500' }}>★ {p.rating?.toFixed(1)}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <div style={{ textAlign:'center', marginTop:'28px' }}>
                <a href="/projects" style={{ display:'inline-block', backgroundColor:'transparent', color:'#dde1f0', fontWeight:600, padding:'12px 28px', borderRadius:'8px', fontSize:'14px', border:'1px solid #2a2f4a', maxWidth:'300px', width:'100%', textAlign:'center' }}>
                  View all Projects →
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* COMMUNITY STRIP */}
      <section style={{ padding:'clamp(32px,6vw,56px) 20px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ background:'linear-gradient(135deg,rgba(74,158,255,.07),rgba(45,212,160,.05))', border:'1px solid #2a2f4a', borderRadius:'12px', padding:'clamp(20px,5vw,32px)' }}>
          <div style={{ fontSize:'20px', marginBottom:'8px' }}>🔩 Local Component Exchange</div>
          <p style={{ color:'#7a82a0', fontSize:'14px', lineHeight:1.6, marginBottom:'16px' }}>Getting parts in remote Assam can take weeks. Trade sensors and microcontrollers with nearby makers.</p>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
            {['Arduino Uno ×3 — Tezpur','DHT22 sensor — Guwahati','ESP32 — Dibrugarh'].map(item => (
              <span key={item} style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'99px', padding:'4px 12px', fontSize:'12px' }}>{item}</span>
            ))}
          </div>
          <a href={user ? '/forum' : '/signup'} style={{ display:'inline-block', backgroundColor:'#4a9eff', color:'#fff', fontWeight:600, padding:'10px 20px', borderRadius:'7px', fontSize:'14px' }}>
            {user ? 'Go to Forum →' : 'Join to Participate →'}
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid #2a2f4a', padding:'32px 20px', textAlign:'center', color:'#7a82a0', fontSize:'13px', backgroundColor:'#1a1d2e' }}>
        <div style={{ letterSpacing:'8px', opacity:0.2, marginBottom:'10px', fontSize:'18px' }}>—⊥—○—⊥—</div>
        <div style={{ marginBottom:'12px' }}>Assam Innovates: The Electronic Tinkerspace</div>
        <div style={{ display:'flex', justifyContent:'center', gap:'20px', flexWrap:'wrap' }}>
          {['About','Contribute','GitHub','Contact'].map(link => (
            <a key={link} href="#" style={{ color:'#7a82a0', fontSize:'12px' }}>{link}</a>
          ))}
        </div>
      </footer>
    </main>
  )
}