export default function Home() {
  return (
    <main style={{
      backgroundColor: '#0d0f14',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      color: '#e8eaf2'
    }}>

      {/* NAV */}
      <nav style={{
        backgroundColor: 'rgba(13,15,20,0.95)',
        borderBottom: '1px solid #252a38',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontWeight: 700, fontSize: '16px' }}>
          <span style={{ color: '#00b4ff' }}>Assam</span> Innovates
        </div>
        <div style={{ display: 'flex', gap: '28px', fontSize: '13px', color: '#8892a8' }}>
          <a href="#" style={{ color: '#8892a8', textDecoration: 'none' }}>Project Hub</a>
          <a href="#" style={{ color: '#8892a8', textDecoration: 'none' }}>Tutorials</a>
          <a href="#" style={{ color: '#8892a8', textDecoration: 'none' }}>Assam Connect</a>
          <a href="#" style={{ color: '#8892a8', textDecoration: 'none' }}>Forum</a>
        </div>
        <button style={{
          backgroundColor: '#00b4ff',
          color: '#000',
          fontWeight: 700,
          padding: '8px 18px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px'
        }}>
          Join the Tinkerspace
        </button>
      </nav>

      {/* HERO */}
      <section style={{
        textAlign: 'center',
        padding: '100px 24px 80px'
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
          marginBottom: '28px'
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
          fontSize: 'clamp(36px, 6vw, 68px)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-1.5px',
          marginBottom: '22px'
        }}>
          Where <span style={{ color: '#00b4ff' }}>Electrons</span> Meet<br />
          <span style={{ color: '#00e676' }}>Assam&apos;s</span> Innovators
        </h1>

        <p style={{
          fontSize: '17px',
          color: '#8892a8',
          maxWidth: '560px',
          margin: '0 auto 38px',
          lineHeight: 1.7
        }}>
          A hands-on electronics community for curious kids, ambitious students,
          and seasoned engineers — rooted in the Brahmaputra Valley, connected to the world.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: '#00b4ff',
            color: '#000',
            fontWeight: 700,
            padding: '13px 28px',
            borderRadius: '8px',
            fontSize: '15px',
            border: 'none',
            cursor: 'pointer'
          }}>
            Explore Projects
          </button>
          <button style={{
            backgroundColor: 'transparent',
            color: '#e8eaf2',
            fontWeight: 600,
            padding: '13px 28px',
            borderRadius: '8px',
            fontSize: '15px',
            border: '1px solid #252a38',
            cursor: 'pointer'
          }}>
            View the Map
          </button>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '48px',
        flexWrap: 'wrap',
        padding: '32px 24px',
        borderTop: '1px solid #252a38',
        borderBottom: '1px solid #252a38'
      }}>
        {[
          { num: '240+', label: 'Active Makers' },
          { num: '58', label: 'Towns in Assam' },
          { num: '180+', label: 'Published Projects' },
          { num: '4', label: 'Learning Paths' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#00b4ff'
            }}>{s.num}</div>
            <div style={{ fontSize: '12px', color: '#8892a8', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* LEARNING PATHS */}
      <section style={{ padding: '72px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#00b4ff', textTransform: 'uppercase', marginBottom: '10px' }}>
          Learning Paths
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px' }}>
          The Path of the Maker
        </h2>
        <p style={{ color: '#8892a8', fontSize: '15px', marginBottom: '44px' }}>
          Every innovator starts somewhere. Pick your path — or explore them all.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {[
            { name: 'Spark', tag: 'Kids', icon: '⚡', color: '#ffd84d', desc: 'Fun, safe, and visual. No jargon, just discovery.', example: 'Try: Lemon battery · LED circuits' },
            { name: 'Current', tag: 'Students', icon: '🔬', color: '#00e676', desc: 'Academic application + DIY builds.', example: 'Try: Arduino weather station' },
            { name: 'Power', tag: 'Pros', icon: '⚙️', color: '#ff7070', desc: 'Complex systems and custom hardware design.', example: 'Try: PCB for tea garden automation' },
            { name: 'Lab Notes', tag: 'Science Blog', icon: '🧪', color: '#c4a0ff', desc: 'Deep dives into the physics behind projects.', example: 'Read: Electron Flow explained' },
          ].map((path) => (
            <div key={path.name} style={{
              backgroundColor: '#161b27',
              border: '1px solid #252a38',
              borderTop: `3px solid ${path.color}`,
              borderRadius: '14px',
              padding: '24px',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{path.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{path.name}</div>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '99px',
                backgroundColor: `${path.color}18`,
                color: path.color
              }}>{path.tag}</span>
              <p style={{ fontSize: '13px', color: '#8892a8', margin: '10px 0 8px', lineHeight: 1.5 }}>{path.desc}</p>
              <div style={{
                fontSize: '12px',
                color: '#00b4ff',
                backgroundColor: 'rgba(0,180,255,0.06)',
                borderRadius: '6px',
                padding: '6px 10px'
              }}>{path.example}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #252a38',
        padding: '32px 24px',
        textAlign: 'center',
        color: '#8892a8',
        fontSize: '13px'
      }}>
        <div style={{ letterSpacing: '8px', opacity: 0.3, marginBottom: '10px', fontSize: '20px' }}>—⊥—○—⊥—</div>
        Assam Innovates: The Electronic Tinkerspace · Built in Brahmaputra Valley
      </footer>

    </main>
  )
}