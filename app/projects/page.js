'use client'
import { useState } from 'react'

const projects = [
  {
    id: 1,
    emoji: '🌊',
    title: 'Brahmaputra Flood Alert System',
    desc: 'Real-time water level sensor with SMS alerts using GSM module and Arduino. Designed for riverside villages in lower Assam.',
    level: 'Intermediate',
    topic: 'IoT',
    author: 'Rupam Borah',
    town: 'Jorhat',
    stars: 47,
    path: 'Current',
    parts: ['Arduino Uno', 'GSM SIM800L', 'Ultrasonic Sensor', 'Solar Panel'],
  },
  {
    id: 2,
    emoji: '🍃',
    title: 'Tea Garden Automation PCB',
    desc: 'Custom PCB with soil humidity sensors and automated drip irrigation, optimised for Assam\'s tea estates. Reduces water usage by 40%.',
    level: 'Advanced',
    topic: 'Renewable',
    author: 'Priya Das',
    town: 'Dibrugarh',
    stars: 83,
    path: 'Power',
    parts: ['Custom PCB', 'DHT22 Sensor', 'Relay Module', 'ESP32'],
  },
  {
    id: 3,
    emoji: '🤖',
    title: 'Line-Following Robot Kit',
    desc: 'Build a robot that follows a black line using IR sensors. Perfect for school science fairs. All parts under ₹350.',
    level: 'Beginner',
    topic: 'Robotics',
    author: 'Ananya Medhi',
    town: 'Guwahati',
    stars: 120,
    path: 'Spark',
    parts: ['Arduino Nano', 'IR Sensors x2', 'L298N Driver', 'Chassis Kit'],
  },
  {
    id: 4,
    emoji: '☀️',
    title: 'Solar Charge Controller',
    desc: 'PWM-based solar charge controller for 12V lead-acid batteries. Includes overcharge protection and LED status indicators.',
    level: 'Intermediate',
    topic: 'Renewable',
    author: 'Bikash Gogoi',
    town: 'Tezpur',
    stars: 61,
    path: 'Current',
    parts: ['LM317 IC', 'MOSFET IRF540', 'Solar Panel 10W', 'LED Array'],
  },
  {
    id: 5,
    emoji: '📡',
    title: 'LoRa Mesh Sensor Network',
    desc: 'Long-range wireless sensor mesh for monitoring remote tea gardens and forest areas using LoRa 433MHz modules.',
    level: 'Advanced',
    topic: 'IoT',
    author: 'Ranjit Kalita',
    town: 'Guwahati',
    stars: 55,
    path: 'Power',
    parts: ['LoRa SX1278', 'Raspberry Pi Zero', 'LiPo Battery', '3D Printed Case'],
  },
  {
    id: 6,
    emoji: '💡',
    title: 'Lemon Battery Science Kit',
    desc: 'A safe, zero-tools experiment for kids that generates real electricity from citrus fruit. Lights up an LED with science!',
    level: 'Beginner',
    topic: 'Science',
    author: 'Dipika Gogoi',
    town: 'Silchar',
    stars: 98,
    path: 'Spark',
    parts: ['2x Lemons', 'Zinc Strip', 'Copper Strip', '1.5V LED'],
  },
  {
    id: 7,
    emoji: '🌡️',
    title: 'Local Weather Station',
    desc: 'Arduino-based weather station with temperature, humidity, and pressure sensors. Logs data to an SD card every 10 minutes.',
    level: 'Intermediate',
    topic: 'IoT',
    author: 'Manas Phukan',
    town: 'Jorhat',
    stars: 72,
    path: 'Current',
    parts: ['Arduino Mega', 'BME280', 'SD Card Module', 'LCD Display'],
  },
  {
    id: 8,
    emoji: '⚡',
    title: 'Piezoelectric Energy Harvester',
    desc: 'Harvests energy from vibrations on roads and bridges. Charges a small capacitor bank to power a wireless sensor.',
    level: 'Advanced',
    topic: 'Renewable',
    author: 'Sourav Nath',
    town: 'Barpeta',
    stars: 44,
    path: 'Lab Notes',
    parts: ['Piezo Elements x6', 'Bridge Rectifier', 'Supercapacitor', 'nRF24L01'],
  },
  {
    id: 9,
    emoji: '🦾',
    title: '3-DOF Robotic Arm',
    desc: 'A 3D-printed robotic arm controlled by servo motors and a joystick. Great introduction to kinematics and servo control.',
    level: 'Intermediate',
    topic: 'Robotics',
    author: 'Arunima Saikia',
    town: 'Guwahati',
    stars: 89,
    path: 'Current',
    parts: ['SG90 Servos x3', 'Arduino Uno', 'Joystick Module', 'PLA Filament'],
  },
]

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']
const topics = ['All Topics', 'IoT', 'Robotics', 'Renewable', 'Science']

const levelColor = {
  Beginner: { bg: 'rgba(45,212,160,.12)', color: '#2dd4a0' },
  Intermediate: { bg: 'rgba(240,165,0,.12)', color: '#f0a500' },
  Advanced: { bg: 'rgba(255,100,100,.12)', color: '#ff6464' },
}

const pathColor = {
  Spark: '#f0a500',
  Current: '#2dd4a0',
  Power: '#4a9eff',
  'Lab Notes': '#a78bfa',
}

export default function ProjectsPage() {
  const [level, setLevel] = useState('All')
  const [topic, setTopic] = useState('All Topics')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = projects.filter(p => {
    const matchLevel = level === 'All' || p.level === level
    const matchTopic = topic === 'All Topics' || p.topic === topic
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase()) ||
      p.town.toLowerCase().includes(search.toLowerCase())
    return matchLevel && matchTopic && matchSearch
  })

  const s = {
    page: {
      backgroundColor: '#13151f',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#dde1f0',
      overflowX: 'hidden',
    },
    nav: {
      backgroundColor: '#1a1d2e',
      borderBottom: '1px solid #2a2f4a',
      padding: '0 20px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    logo: { fontWeight: 700, fontSize: '15px' },
    logoSpan: { color: '#4a9eff' },
    navLinks: { display: 'flex', gap: '20px', fontSize: '12px', color: '#7a82a0' },
    navCta: {
      backgroundColor: '#4a9eff', color: '#fff',
      fontWeight: 600, padding: '6px 14px',
      borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px',
    },
  }

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={s.nav}>
        <a href="/" style={{ ...s.logo, textDecoration: 'none', color: '#dde1f0' }}>
          <span style={s.logoSpan}>Assam</span> Innovates
        </a>
        <div style={s.navLinks}>
          <a href="/" style={{ color: '#7a82a0', textDecoration: 'none' }}>Home</a>
          <a href="/projects" style={{ color: '#4a9eff', textDecoration: 'none' }}>Projects</a>
          <a href="#" style={{ color: '#7a82a0', textDecoration: 'none' }}>Tutorials</a>
          <a href="#" style={{ color: '#7a82a0', textDecoration: 'none' }}>Connect</a>
        </div>
        <button style={s.navCta}>Join</button>
      </nav>

      {/* HEADER */}
      <div style={{
        padding: '40px 20px 32px',
        borderBottom: '1px solid #2a2f4a',
        maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', color: '#4a9eff', textTransform: 'uppercase', marginBottom: '8px' }}>
          Project Hub
        </div>
        <h1 style={{ fontSize: 'clamp(24px,5vw,40px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '10px' }}>
          What Makers Are Building
        </h1>
        <p style={{ color: '#7a82a0', fontSize: '14px', maxWidth: '500px', lineHeight: 1.6 }}>
          Real projects from real makers across Assam. Every project includes a full parts list and step-by-step guide.
        </p>
      </div>

      {/* FILTERS */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #2a2f4a',
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>

        {/* Search */}
        <input
          type="text"
          placeholder="Search projects, towns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            backgroundColor: '#1a1d2e',
            border: '1px solid #2a2f4a',
            borderRadius: '5px',
            padding: '8px 12px',
            color: '#dde1f0',
            fontSize: '13px',
            outline: 'none',
            width: '200px',
          }}
        />

        {/* Level filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {levels.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              style={{
                backgroundColor: level === l ? '#4a9eff' : '#1a1d2e',
                color: level === l ? '#fff' : '#7a82a0',
                border: `1px solid ${level === l ? '#4a9eff' : '#2a2f4a'}`,
                borderRadius: '5px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >{l}</button>
          ))}
        </div>

        {/* Topic filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              style={{
                backgroundColor: topic === t ? '#20243a' : 'transparent',
                color: topic === t ? '#2dd4a0' : '#7a82a0',
                border: `1px solid ${topic === t ? '#2dd4a0' : '#2a2f4a'}`,
                borderRadius: '5px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >{t}</button>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#7a82a0' }}>
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* PROJECT GRID */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '24px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: '16px',
      }}>
        {filtered.length === 0 ? (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center',
            padding: '60px 20px', color: '#7a82a0',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>No projects found</div>
            <div style={{ fontSize: '13px' }}>Try a different filter or search term</div>
          </div>
        ) : filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            style={{
              backgroundColor: '#1a1d2e',
              border: '1px solid #2a2f4a',
              borderTop: `3px solid ${pathColor[p.path]}`,
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = pathColor[p.path]}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2f4a'}
          >
            {/* Thumb */}
            <div style={{
              height: '90px',
              background: 'linear-gradient(135deg,#1e2235,#20243a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '44px',
              borderBottom: '1px solid #2a2f4a',
            }}>{p.emoji}</div>

            {/* Body */}
            <div style={{ padding: '14px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '3px',
                  backgroundColor: levelColor[p.level].bg,
                  color: levelColor[p.level].color,
                }}>{p.level}</span>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '3px',
                  backgroundColor: 'rgba(74,158,255,.08)',
                  color: '#4a9eff',
                }}>{p.topic}</span>
              </div>

              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', lineHeight: 1.4 }}>
                {p.title}
              </div>
              <div style={{ fontSize: '12px', color: '#7a82a0', lineHeight: 1.5, marginBottom: '12px' }}>
                {p.desc.length > 90 ? p.desc.slice(0, 90) + '...' : p.desc}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '10px', borderTop: '1px solid #2a2f4a',
                fontSize: '12px', color: '#7a82a0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${pathColor[p.path]}, #13151f)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 700, color: '#fff',
                  }}>{p.author.split(' ').map(n => n[0]).join('')}</div>
                  <span>{p.author.split(' ')[0]}, {p.town}</span>
                </div>
                <span>⭐ {p.stars}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PROJECT DETAIL MODAL */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1d2e',
              border: `1px solid ${pathColor[selected.path]}`,
              borderRadius: '10px',
              maxWidth: '540px', width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #2a2f4a',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ fontSize: '40px' }}>{selected.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px', lineHeight: 1.3 }}>{selected.title}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px',
                      backgroundColor: levelColor[selected.level].bg, color: levelColor[selected.level].color,
                    }}>{selected.level}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px',
                      backgroundColor: 'rgba(74,158,255,.08)', color: '#4a9eff',
                    }}>{selected.topic}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '3px',
                      backgroundColor: `${pathColor[selected.path]}18`, color: pathColor[selected.path],
                    }}>{selected.path} path</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none', border: '1px solid #2a2f4a',
                  color: '#7a82a0', borderRadius: '5px',
                  padding: '4px 10px', cursor: 'pointer', fontSize: '16px', flexShrink: 0,
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px' }}>

              {/* Author */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '16px', padding: '10px 12px',
                backgroundColor: '#13151f', borderRadius: '6px',
                border: '1px solid #2a2f4a',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${pathColor[selected.path]}, #20243a)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#fff',
                }}>{selected.author.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selected.author}</div>
                  <div style={{ fontSize: '11px', color: '#7a82a0' }}>{selected.town}, Assam · ⭐ {selected.stars} stars</div>
                </div>
              </div>

              {/* Description */}
              <div style={{ fontSize: '14px', color: '#aab0c8', lineHeight: 1.7, marginBottom: '20px' }}>
                {selected.desc}
              </div>

              {/* Parts list */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
                  textTransform: 'uppercase', color: '#7a82a0', marginBottom: '10px',
                }}>Bill of Materials</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selected.parts.map((part, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', backgroundColor: '#13151f',
                      borderRadius: '5px', border: '1px solid #2a2f4a',
                      fontSize: '13px',
                    }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        backgroundColor: '#2a2f4a', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700, color: '#7a82a0', flexShrink: 0,
                      }}>{i + 1}</div>
                      {part}
                    </div>
                  ))}
                </div>
              </div>

              {/* Circuit diagram placeholder */}
              <div style={{
                backgroundColor: '#13151f', border: '1px dashed #2a2f4a',
                borderRadius: '6px', padding: '24px', textAlign: 'center',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔌</div>
                <div style={{ fontSize: '13px', color: '#7a82a0' }}>Circuit diagram coming soon</div>
                <div style={{ fontSize: '11px', color: '#4a5070', marginTop: '4px' }}>Full schematic will be uploaded by the author</div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{
                  flex: 1, backgroundColor: '#4a9eff', color: '#fff',
                  fontWeight: 600, padding: '11px', borderRadius: '6px',
                  border: 'none', cursor: 'pointer', fontSize: '13px',
                }}>View Full Tutorial →</button>
                <button style={{
                  flex: 1, backgroundColor: 'transparent', color: '#dde1f0',
                  fontWeight: 500, padding: '11px', borderRadius: '6px',
                  border: '1px solid #2a2f4a', cursor: 'pointer', fontSize: '13px',
                }}>⭐ Save Project</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}