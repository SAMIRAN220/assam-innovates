'use client'
import { useState } from 'react'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main style={{
      backgroundColor: '#0d0f14',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      color: '#e8eaf2',
      overflowX: 'hidden'
    }}>

      {/* NAV */}
      <nav style={{
        backgroundColor: 'rgba(13,15,20,0.97)',
        borderBottom: '1px solid #252a38',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <a href="/" style={{ fontWeight: 700, fontSize: '16px', textDecoration: 'none', color: '#e8eaf2' }}>
            <span style={{ color: '#00b4ff' }}>Assam</span> Innovates
          </a>

          {/* Desktop links */}
          <div style={{
            display: 'flex',
            gap: '28px',
            fontSize: '13px',
          }}>
            <a href="/projects" style={{ color: '#00b4ff', textDecoration: 'none', fontWeight: 600 }}>Project Hub</a>
            <a href="#" style={{ color: '#8892a8', textDecoration: 'none' }}>Tutorials</a>
            <a href="#" style={{ color: '#8892a8', textDecoration: 'none' }}>Assam Connect</a>
            <a href="/forum" style={{ color: '#8892a8', textDecoration: 'none' }}>Forum</a>
          </div>

          {/* Desktop CTA */}
          <a href="/register" style={{
            backgroundColor: '#00b4ff', color: '#000',
            fontWeight: 700, padding: '8px 16px',
            borderRadius: '6px', fontSize: '13px',
            textDecoration: 'none', display: 'inline-block'
          }}>
          Join the Tinkerspace
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: '1px solid #252a38',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: '#e8eaf2',
              fontSize: '18px',
              lineHeight: 1,
              display: 'none'
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid #252a38',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0'
          }}>
            <a href="/projects" style={{ color: '#00b4ff', textDecoration: 'none', padding: '12px 4px', fontSize: '15px', borderBottom: '1px solid #1a1e2a', fontWeight: 600 }}>Project Hub</a>
            <a href="#" style={{ color: '#8892a8', textDecoration: 'none', padding: '12px 4px', fontSize: '15px', borderBottom: '1px solid #1a1e2a' }}>Tutorials</a>
            <a href="#" style={{ color: '#8892a8', textDecoration: 'none', padding: '12px 4px', fontSize: '15px', borderBottom: '1px solid #1a1e2a' }}>Assam Connect</a>
            <a href="/forum" style={{ color: '#8892a8', textDecoration: 'none', padding: '12px 4px', fontSize: '15px', borderBottom: '1px solid #1a1e2a' }}>Forum</a>
            <a href="/register" style={{
  backgroundColor: '#00b4ff', color: '#000',
  fontWeight: 700, padding: '8px 16px',
  borderRadius: '6px', fontSize: '13px',
  textDecoration: 'none', display: 'inline-block'
}}>
  Join the Tinkerspace
</a>
          </div>
        )}

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 639px) {
            nav > div > div:nth-child(2) { display: none !important; }
            nav > div > button:nth-child(3) { display: none !important; }
            nav > div > button:nth-child(4) { display: flex !important; }
          }
          @media (min-width: 640px) {
            nav > div > button:nth-child(4) { display: none !important; }
          }
        `}</style>
      </nav>

      {/* HERO */}
      <section style={{
        textAlign: 'center',
        padding: 'clamp(48px, 10vw, 100px) 20px clamp(40px, 8vw, 80px)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(0,180,255,0.08)',
          border: '1px solid rgba(0,180,255,0.2)',
          borderRadius: '99px',
          padding: '5px 16px',
          fontSize: '12px',
          color: '#00b4ff',
          marginBottom: '24px'
        }}>
          <span style={{
            width: '6px', height: '6px',
            backgroundColor: '#00e676',
            borderRadius: '50%',
            display: 'inline-block'
          }}></span>
          Built in Assam, for the world
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 8vw, 68px)',
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: '-1px',
          marginBottom: '20px'
        }}>
          Where <span style={{ color: '#00b4ff' }}>Electrons</span> Meet<br />
          <span style={{ color: '#00e676' }}>Assam&apos;s</span> Innovators
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 4vw, 17px)',
          color: '#8892a8',
          maxWidth: '560px',
          margin: '0 auto 32px',
          lineHeight: 1.7,
          padding: '0 8px'
        }}>
          A hands-on electronics community for curious kids, ambitious students,
          and seasoned engineers — rooted in the Brahmaputra Valley, connected to the world.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '0 16px'
        }}>
          {/* Explore Projects — now links to /projects */}
          <a href="/projects" style={{
            backgroundColor: '#00b4ff',
            color: '#000',
            fontWeight: 700,
            padding: '13px 28px',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 4vw, 15px)',
            textDecoration: 'none',
            display: 'inline-block',
            textAlign: 'center',
            width: 'clamp(140px, 40vw, 200px)'
          }}>
            Explore Projects
          </a>

          <button style={{
            backgroundColor: 'transparent',
            color: '#e8eaf2',
            fontWeight: 600,
            padding: '13px 28px',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 4vw, 15px)',
            border: '1px solid #252a38',
            cursor: 'pointer',
            width: 'clamp(140px, 40vw, 200px)'
          }}>
            View the Map
          </button>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1px',
        backgroundColor: '#252a38',
        borderTop: '1px solid #252a38',
        borderBottom: '1px solid #252a38'
      }}>
        {[
          { num: '240+', label: 'Active Makers' },
          { num: '58',   label: 'Towns in Assam' },
          { num: '180+', label: 'Published Projects' },
          { num: '4',    label: 'Learning Paths' },
        ].map((s) => (
          <div key={s.label} style={{
            textAlign: 'center',
            padding: '24px 16px',
            backgroundColor: '#0d0f14'
          }}>
            <div style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: '#00b4ff' }}>{s.num}</div>
            <div style={{ fontSize: '12px', color: '#8892a8', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* LEARNING PATHS */}
      <section style={{ padding: 'clamp(40px, 8vw, 72px) 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#00b4ff', textTransform: 'uppercase', marginBottom: '10px' }}>
          Learning Paths
        </div>
        <h2 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '10px' }}>
          The Path of the Maker
        </h2>
        <p style={{ color: '#8892a8', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
          Every innovator starts somewhere. Pick your path — or explore them all.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '14px'
        }}>
          {[
            { name: 'Spark',     tag: 'Kids',        icon: '⚡', color: '#ffd84d', desc: 'Fun, safe, and visual. No jargon, just discovery.', example: 'Try: Lemon battery · LED circuits' },
            { name: 'Current',   tag: 'Students',    icon: '🔬', color: '#00e676', desc: 'Academic application + DIY builds.',                 example: 'Try: Arduino weather station' },
            { name: 'Power',     tag: 'Pros',        icon: '⚙️', color: '#ff7070', desc: 'Complex systems and custom hardware design.',        example: 'Try: PCB for tea garden automation' },
            { name: 'Lab Notes', tag: 'Science Blog',icon: '🧪', color: '#c4a0ff', desc: 'Deep dives into the physics behind projects.',       example: 'Read: Electron Flow explained' },
          ].map((path) => (
            <a key={path.name} href="/projects" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#161b27',
                border: '1px solid #252a38',
                borderTop: `3px solid ${path.color}`,
                borderRadius: '14px',
                padding: '20px',
                cursor: 'pointer',
                height: '100%'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{path.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px', color: '#e8eaf2' }}>{path.name}</div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '99px',
                  backgroundColor: `${path.color}18`, color: path.color
                }}>{path.tag}</span>
                <p style={{ fontSize: '13px', color: '#8892a8', margin: '10px 0 8px', lineHeight: 1.6 }}>{path.desc}</p>
                <div style={{ fontSize: '12px', color: '#00b4ff', backgroundColor: 'rgba(0,180,255,0.06)', borderRadius: '6px', padding: '6px 10px' }}>
                  {path.example}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS STRIP */}
      <section style={{
        padding: 'clamp(40px, 8vw, 72px) 20px',
        backgroundColor: '#0f1219',
        borderTop: '1px solid #252a38'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#00b4ff', textTransform: 'uppercase', marginBottom: '10px' }}>
            Project Hub
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800 }}>What Makers Are Building</h2>
            <a href="/projects" style={{ fontSize: '13px', color: '#00b4ff', textDecoration: 'none', fontWeight: 600 }}>View all 180+ →</a>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '16px'
          }}>
            {[
              { emoji: '🌊', title: 'Brahmaputra Flood Alert System', level: 'Intermediate', topic: 'IoT',      author: 'Rupam B',   town: 'Jorhat',    stars: 47  },
              { emoji: '🍃', title: 'Tea Garden Automation PCB',      level: 'Advanced',     topic: 'Renewable', author: 'Priya D',   town: 'Dibrugarh', stars: 83  },
              { emoji: '🤖', title: 'Line-Following Robot Kit',       level: 'Beginner',     topic: 'Robotics',  author: 'Ananya M',  town: 'Guwahati',  stars: 120 },
            ].map((p) => (
              <a key={p.title} href="/projects" style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#161b27',
                  border: '1px solid #252a38',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color .15s'
                }}>
                  <div style={{
                    height: '90px',
                    background: 'linear-gradient(135deg,#0d1a2a,#0d2514)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '40px'
                  }}>{p.emoji}</div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                        backgroundColor: p.level === 'Beginner' ? 'rgba(0,230,118,.1)' : p.level === 'Intermediate' ? 'rgba(255,180,0,.1)' : 'rgba(255,100,100,.1)',
                        color: p.level === 'Beginner' ? '#00e676' : p.level === 'Intermediate' ? '#ffb800' : '#ff7070'
                      }}>{p.level}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', backgroundColor: 'rgba(0,180,255,.08)', color: '#00b4ff' }}>{p.topic}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', lineHeight: 1.4, color: '#e8eaf2' }}>{p.title}</div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '12px', color: '#8892a8',
                      paddingTop: '10px', borderTop: '1px solid #252a38'
                    }}>
                      <span>{p.author}, {p.town}</span>
                      <span>⭐ {p.stars}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a href="/projects" style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: '#e8eaf2', fontWeight: 600,
              padding: '12px 28px', borderRadius: '8px',
              fontSize: '14px', border: '1px solid #252a38',
              textDecoration: 'none', width: '100%', maxWidth: '300px',
              textAlign: 'center'
            }}>View all 180+ Projects →</a>
          </div>
        </div>
      </section>

      {/* COMMUNITY STRIP */}
      <section style={{ padding: 'clamp(32px, 6vw, 56px) 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg,rgba(0,180,255,.07),rgba(0,230,118,.05))',
          border: '1px solid rgba(0,180,255,.15)',
          borderRadius: '14px',
          padding: 'clamp(20px, 5vw, 32px)'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔩 Local Component Exchange</div>
          <p style={{ color: '#8892a8', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            Getting parts in remote Assam can take weeks. Trade sensors and microcontrollers with nearby makers.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {['Arduino Uno ×3 — Tezpur', 'DHT22 sensor — Guwahati', 'ESP32 — Dibrugarh'].map(item => (
              <span key={item} style={{
                backgroundColor: '#1c2235', border: '1px solid #252a38',
                borderRadius: '99px', padding: '4px 12px', fontSize: '12px', color: '#e8eaf2'
              }}>{item}</span>
            ))}
          </div>
          <button style={{
            backgroundColor: 'transparent', color: '#00b4ff', fontWeight: 600,
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
            border: '1px solid rgba(0,180,255,.3)', cursor: 'pointer', width: '100%'
          }}>Browse Exchange Board →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #252a38',
        padding: '32px 20px',
        textAlign: 'center',
        color: '#8892a8',
        fontSize: '13px'
      }}>
        <div style={{ letterSpacing: '8px', opacity: 0.3, marginBottom: '10px', fontSize: '18px' }}>—⊥—○—⊥—</div>
        <div style={{ marginBottom: '12px' }}>Assam Innovates: The Electronic Tinkerspace</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {['About', 'Contribute', 'GitHub', 'Contact'].map(link => (
            <a key={link} href="#" style={{ color: '#8892a8', textDecoration: 'none', fontSize: '12px' }}>{link}</a>
          ))}
        </div>
      </footer>

    </main>
  )
}