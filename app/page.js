'use client'
import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'

function initials(name) {
  return name ? name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : '?'
}

export default function Home() {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen]   = useState(false)

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

          {/* Auth nav — desktop */}
          <div className="desk-nav" style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            {loading ? null : user ? (
              <>
                <a href="/profile" style={{ display:'flex', alignItems:'center', gap:'8px', color:'#dde1f0', fontSize:'13px' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#4a9eff,#2dd4a0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#fff' }}>
                    {user.photoURL ? <img src={user.photoURL} alt="" style={{ width:'30px', height:'30px', borderRadius:'50%', objectFit:'cover' }}/> : initials(user.displayName)}
                  </div>
                  <span>{user.displayName?.split(' ')[0] || 'Profile'}</span>
                </a>
                <button onClick={logout} style={{ backgroundColor:'transparent', color:'#7a82a0', fontSize:'13px', padding:'7px 14px', borderRadius:'6px', border:'1px solid #2a2f4a', cursor:'pointer' }}>Sign Out</button>
              </>
            ) : (
              <>
                <a href="/login" style={{ color:'#7a82a0', fontSize:'13px', padding:'7px 14px', borderRadius:'6px', border:'1px solid #2a2f4a' }}>Log In</a>
                <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'8px 18px', borderRadius:'7px', fontSize:'13px' }}>Sign Up Free</a>
              </>
            )}
          </div>

          <button className="mob-ham" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'1px solid #2a2f4a', borderRadius:'6px', padding:'6px 10px', cursor:'pointer', color:'#dde1f0', fontSize:'18px', alignItems:'center' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mob-menu" style={{ borderTop:'1px solid #2a2f4a', padding:'12px 0', display:'flex', flexDirection:'column' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:'#7a82a0', padding:'11px 4px', fontSize:'15px', borderBottom:'1px solid #20243a' }}>{label}</a>
            ))}
            {user ? (
              <>
                <a href="/profile" style={{ color:'#4a9eff', padding:'11px 4px', fontSize:'15px', borderBottom:'1px solid #20243a' }}>My Profile</a>
                <button onClick={logout} style={{ backgroundColor:'transparent', color:'#7a82a0', padding:'11px 0', fontSize:'15px', border:'none', textAlign:'left', cursor:'pointer' }}>Sign Out</button>
              </>
            ) : (
              <>
                <a href="/login" style={{ color:'#7a82a0', padding:'11px 4px', fontSize:'15px', borderBottom:'1px solid #20243a' }}>Log In</a>
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
        <h1 style={{ fontSize:'clamp(32px,8vw,60px)', fontWeight:900, lineHeight:1.08, letterSpacing:'-1.5px', marginBottom:'18px', color:'#dde1f0' }}>
          Where <span style={{ color:'#4a9eff' }}>Electrons</span> Meet<br />
          <span style={{ color:'#2dd4a0' }}>Assam&apos;s</span> Innovators
        </h1>
        <p style={{ fontSize:'clamp(14px,4vw,17px)', color:'#7a82a0', maxWidth:'540px', margin:'0 auto 32px', lineHeight:1.7 }}>
          A hands-on electronics community for curious kids, ambitious students, and seasoned engineers — rooted in the Brahmaputra Valley, connected to the world.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/projects" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'13px 28px', borderRadius:'8px', fontSize:'clamp(14px,4vw,15px)', display:'inline-block' }}>
            Explore Projects
          </a>
          {!user && (
            <a href="/signup" style={{ backgroundColor:'transparent', color:'#dde1f0', fontWeight:600, padding:'13px 28px', borderRadius:'8px', fontSize:'clamp(14px,4vw,15px)', border:'1px solid #2a2f4a', display:'inline-block' }}>
              Join the Community
            </a>
          )}
          {user && (
            <a href="/profile" style={{ backgroundColor:'transparent', color:'#2dd4a0', fontWeight:600, padding:'13px 28px', borderRadius:'8px', fontSize:'clamp(14px,4vw,15px)', border:'1px solid rgba(45,212,160,.3)', display:'inline-block' }}>
              My Profile →
            </a>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a' }}>
        {[['240+','Active Makers'],['58','Towns in Assam'],['180+','Published Projects'],['4','Learning Paths']].map(([num,label],i) => (
          <div key={label} style={{ textAlign:'center', padding:'clamp(16px,4vw,24px) 12px', borderRight:i<3?'1px solid #2a2f4a':'none' }}>
            <div style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, color:'#4a9eff' }}>{num}</div>
            <div style={{ fontSize:'12px', color:'#7a82a0', marginTop:'4px' }}>{label}</div>
          </div>
        ))}
      </section>

      {/* LEARNING PATHS */}
      <section style={{ padding:'clamp(40px,8vw,72px) 20px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'2px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Learning Paths</div>
        <h2 style={{ fontSize:'clamp(22px,5vw,32px)', fontWeight:800, letterSpacing:'-.5px', marginBottom:'10px' }}>The Path of the Maker</h2>
        <p style={{ color:'#7a82a0', fontSize:'15px', marginBottom:'32px', lineHeight:1.6 }}>Every innovator starts somewhere. Pick your path.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap:'14px' }}>
          {[
            { name:'Spark',     tag:'Kids',         icon:'⚡', acc:'#f0a500', tagBg:'rgba(240,165,0,.1)'   },
            { name:'Current',   tag:'Students',     icon:'🔬', acc:'#2dd4a0', tagBg:'rgba(45,212,160,.1)'  },
            { name:'Power',     tag:'Pros',         icon:'⚙️', acc:'#4a9eff', tagBg:'rgba(74,158,255,.1)'  },
            { name:'Lab Notes', tag:'Science Blog',  icon:'🧪', acc:'#a78bfa', tagBg:'rgba(167,139,250,.1)' },
          ].map(p => (
            <a key={p.name} href="/projects" className="path-card" style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderTop:`3px solid ${p.acc}`, borderRadius:'10px', padding:'20px', display:'block', transition:'border-color .2s' }}>
              <div style={{ fontSize:'28px', marginBottom:'10px' }}>{p.icon}</div>
              <div style={{ fontWeight:700, fontSize:'16px', marginBottom:'6px' }}>{p.name}</div>
              <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 9px', borderRadius:'4px', backgroundColor:p.tagBg, color:p.acc }}>{p.tag}</span>
            </a>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section style={{ padding:'clamp(40px,8vw,72px) 20px', backgroundColor:'#13151f', borderTop:'1px solid #2a2f4a' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'2px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'8px' }}>Project Hub</div>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:'12px', marginBottom:'24px' }}>
            <h2 style={{ fontSize:'clamp(22px,5vw,32px)', fontWeight:800 }}>What Makers Are Building</h2>
            <a href="/projects" style={{ fontSize:'13px', color:'#4a9eff', fontWeight:600 }}>View all →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:'16px' }}>
            {[
              { emoji:'🌊', title:'Brahmaputra Flood Alert System', level:'Intermediate', topic:'IoT',      author:'Rupam B',  town:'Jorhat',    stars:47  },
              { emoji:'🍃', title:'Tea Garden Automation PCB',      level:'Advanced',     topic:'Renewable', author:'Priya D',  town:'Dibrugarh', stars:83  },
              { emoji:'🤖', title:'Line-Following Robot Kit',       level:'Beginner',     topic:'Robotics',  author:'Ananya M', town:'Guwahati',  stars:120 },
            ].map(p => {
              const lc = p.level==='Beginner'?{bg:'rgba(45,212,160,.1)',c:'#2dd4a0'}:p.level==='Intermediate'?{bg:'rgba(240,165,0,.1)',c:'#f0a500'}:{bg:'rgba(255,100,100,.1)',c:'#ff6464'}
              return (
                <a key={p.title} href="/projects" className="proj-card" style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', overflow:'hidden', display:'block', transition:'all .15s' }}>
                  <div style={{ height:'90px', background:'linear-gradient(135deg,#1e2235,#20243a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', borderBottom:'1px solid #2a2f4a' }}>{p.emoji}</div>
                  <div style={{ padding:'14px' }}>
                    <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
                      <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'4px', backgroundColor:lc.bg, color:lc.c }}>{p.level}</span>
                      <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'4px', backgroundColor:'rgba(74,158,255,.1)', color:'#4a9eff' }}>{p.topic}</span>
                    </div>
                    <div style={{ fontWeight:700, fontSize:'14px', marginBottom:'10px', lineHeight:1.4 }}>{p.title}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#7a82a0', paddingTop:'10px', borderTop:'1px solid #2a2f4a' }}>
                      <span>{p.author}, {p.town}</span><span>⭐ {p.stars}</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
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