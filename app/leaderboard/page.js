'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

function getBadge(rating) {
  if (rating >= 8) return { label:'Gold',   emoji:'🥇', color:'#D97706', bg:'#FFFBEB', border:'#FDE68A' }
  if (rating >= 6) return { label:'Silver', emoji:'🥈', color:'#6B7280', bg:'#F9FAFB', border:'#D1D5DB' }
  if (rating >= 4) return { label:'Bronze', emoji:'🥉', color:'#92400E', bg:'#FEF3C7', border:'#FCD34D' }
  return null
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now() - d) / 1000)
  if (diff < 3600)  return Math.floor(diff/60) + 'm ago'
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago'
  return Math.floor(diff/86400) + 'd ago'
}

const CAT_EMOJI = {
  Electrical:'⚡', Mechanical:'⚙️', Civil:'🏗️', Coding:'💻',
  Biology:'🧬', Robotics:'🤖', IoT:'📡', 'Renewable Energy':'☀️', Other:'🔬'
}

const avatarColors = ['#2563EB','#059669','#D97706','#7C3AED','#DC2626','#0891B2']
function avatarColor(name) {
  return name ? avatarColors[name.charCodeAt(0) % avatarColors.length] : avatarColors[0]
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [tab, setTab]           = useState('projects')
  const [projects, setProjects] = useState([])
  const [makers, setMakers]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [projSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'projects'), orderBy('rating', 'desc'))),
          getDocs(collection(db, 'users')),
        ])

        const allProjects = projSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => p.ratingCount > 0)
          .sort((a, b) => b.rating - a.rating)
        setProjects(allProjects)

        // Build maker stats from projects
        const userMap = {}
        usersSnap.docs.forEach(d => { userMap[d.id] = { id: d.id, ...d.data() } })

        const makerStats = {}
        projSnap.docs.forEach(d => {
          const p = d.data()
          if (p.authorId && p.ratingCount > 0) {
            if (!makerStats[p.authorId]) {
              makerStats[p.authorId] = {
                id:           p.authorId,
                name:         p.authorName,
                town:         p.authorTown || userMap[p.authorId]?.town || '',
                photoURL:     userMap[p.authorId]?.photoURL || '',
                skillLevel:   userMap[p.authorId]?.skillLevel || '',
                totalRating:  0,
                ratingCount:  0,
                projectCount: 0,
              }
            }
            makerStats[p.authorId].totalRating  += p.rating * p.ratingCount
            makerStats[p.authorId].ratingCount  += p.ratingCount
            makerStats[p.authorId].projectCount += 1
          }
        })

        const sortedMakers = Object.values(makerStats)
          .map(m => ({ ...m, avgRating: m.ratingCount > 0 ? m.totalRating / m.ratingCount : 0 }))
          .sort((a, b) => b.avgRating - a.avgRating)
        setMakers(sortedMakers)
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    fetchAll()
  }, [])

  const S = {
    page:  { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', overflowX:'hidden' },
    nav:   { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', position:'sticky', top:0, zIndex:100 },
    navIn: { height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'1000px', margin:'0 auto', gap:'12px' },
    wrap:  { maxWidth:'1000px', margin:'0 auto', padding:'0 20px 60px' },
  }

  const RatingBar = ({ rating }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1 }}>
      <div style={{ flex:1, height:'6px', backgroundColor:'#2a2f4a', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${(rating/10)*100}%`, backgroundColor: rating>=8?'#D97706':rating>=6?'#9ba8b5':rating>=4?'#cd7f32':'#4a9eff', borderRadius:'3px', transition:'width .5s ease' }}/>
      </div>
      <span style={{ fontSize:'14px', fontWeight:700, color: rating>=8?'#D97706':rating>=6?'#9ba8b5':rating>=4?'#cd7f32':'#4a9eff', minWidth:'32px', textAlign:'right' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`
        * { box-sizing:border-box; }
        a { text-decoration:none; color:inherit; }
        .proj-row:hover { border-color:#4a9eff!important; background:rgba(74,158,255,.04)!important; }
        .maker-row:hover { border-color:#2dd4a0!important; background:rgba(45,212,160,.04)!important; }
        .tab-btn:hover { color:#dde1f0!important; }
        @media(max-width:639px){ .desk-nav{display:none!important} .mob-ham{display:flex!important} .rank-num{display:none!important} }
        @media(min-width:640px){ .mob-ham{display:none!important} }
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', flexShrink:0 }}>
            <span style={{ color:'#4a9eff' }}>Assam</span> Innovates
          </a>
          <div className="desk-nav" style={{ display:'flex', gap:'24px', fontSize:'13px', flex:1, justifyContent:'center' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/community','Community'],['/leaderboard','Leaderboard']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:label==='Leaderboard'?'#D97706':'#7a82a0', fontWeight:label==='Leaderboard'?600:400 }}>{label}</a>
            ))}
          </div>
          <div className="desk-nav" style={{ display:'flex', gap:'10px', alignItems:'center', flexShrink:0 }}>
            {user
              ? <a href="/profile" style={{ color:'#7a82a0', fontSize:'13px' }}>Profile</a>
              : <a href="/signup" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'7px 16px', borderRadius:'6px', fontSize:'13px' }}>Sign Up</a>
            }
          </div>
          <button className="mob-ham" onClick={()=>setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'1px solid #2a2f4a', borderRadius:'5px', padding:'6px 10px', cursor:'pointer', color:'#dde1f0', fontSize:'16px', alignItems:'center' }}>
            {menuOpen?'✕':'☰'}
          </button>
        </div>
        {menuOpen && (
          <div style={{ borderTop:'1px solid #2a2f4a', padding:'12px 0', display:'flex', flexDirection:'column' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/community','Community'],['/leaderboard','Leaderboard']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:label==='Leaderboard'?'#D97706':'#7a82a0', padding:'11px 4px', fontSize:'14px', borderBottom:'1px solid #20243a' }}>{label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* PAGE HEADER */}
      <div style={{ backgroundColor:'#13151f', borderBottom:'1px solid #2a2f4a', padding:'clamp(32px,6vw,56px) 20px 0' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', color:'#D97706', textTransform:'uppercase', marginBottom:'8px' }}>Hall of Fame</div>
          <h1 style={{ fontSize:'clamp(24px,5vw,44px)', fontWeight:800, letterSpacing:'-.5px', marginBottom:'10px' }}>
            🏆 Leaderboard
          </h1>
          <p style={{ color:'#7a82a0', fontSize:'14px', lineHeight:1.6, maxWidth:'500px', marginBottom:'28px' }}>
            The best projects and makers in Assam Innovates — ranked by community ratings.
          </p>

          {/* BADGE LEGEND */}
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'28px' }}>
            {[
              { emoji:'🥇', label:'Gold',   range:'8.0 – 10',  color:'#D97706', bg:'rgba(217,119,6,.1)',  border:'rgba(217,119,6,.25)'  },
              { emoji:'🥈', label:'Silver', range:'6.0 – 7.9', color:'#9ba8b5', bg:'rgba(155,168,181,.1)',border:'rgba(155,168,181,.25)' },
              { emoji:'🥉', label:'Bronze', range:'4.0 – 5.9', color:'#cd7f32', bg:'rgba(205,127,50,.1)', border:'rgba(205,127,50,.25)'  },
            ].map(b => (
              <div key={b.label} style={{ display:'flex', alignItems:'center', gap:'8px', backgroundColor:b.bg, border:`1px solid ${b.border}`, borderRadius:'99px', padding:'5px 14px' }}>
                <span style={{ fontSize:'14px' }}>{b.emoji}</span>
                <span style={{ fontSize:'12px', fontWeight:600, color:b.color }}>{b.label}</span>
                <span style={{ fontSize:'11px', color:'#4a5070' }}>{b.range}</span>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:'8px', backgroundColor:'rgba(74,158,255,.08)', border:'1px solid rgba(74,158,255,.2)', borderRadius:'99px', padding:'5px 14px' }}>
              <span style={{ fontSize:'12px', fontWeight:600, color:'#4a9eff' }}>Unranked</span>
              <span style={{ fontSize:'11px', color:'#4a5070' }}>Below 4.0</span>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display:'flex', gap:'0', borderBottom:'none' }}>
            {[
              { id:'projects', label:'Top Projects', count: projects.length },
              { id:'makers',   label:'Top Makers',   count: makers.length   },
            ].map(t => (
              <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
                style={{ backgroundColor:'transparent', border:'none', borderBottom:`2px solid ${tab===t.id?'#D97706':'transparent'}`, padding:'10px 20px', cursor:'pointer', color:tab===t.id?'#D97706':'#7a82a0', fontSize:'14px', fontWeight:tab===t.id?700:400, fontFamily:'Inter,system-ui,sans-serif', transition:'color .15s', whiteSpace:'nowrap' }}>
                {t.label}
                <span style={{ marginLeft:'8px', fontSize:'11px', backgroundColor:tab===t.id?'rgba(217,119,6,.15)':'#2a2f4a', color:tab===t.id?'#D97706':'#7a82a0', padding:'2px 8px', borderRadius:'99px', fontWeight:600 }}>
                  {loading ? '...' : t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={S.wrap}>
        <div style={{ paddingTop:'24px' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px', color:'#7a82a0' }}>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>⚡</div>
              <div>Loading leaderboard...</div>
            </div>
          ) : (

            <>
              {/* ── TOP PROJECTS ── */}
              {tab==='projects' && (
                <div>
                  {projects.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px', color:'#7a82a0' }}>
                      <div style={{ fontSize:'40px', marginBottom:'16px' }}>🏆</div>
                      <div style={{ fontSize:'16px', fontWeight:600, marginBottom:'8px', color:'#dde1f0' }}>No rated projects yet</div>
                      <p style={{ fontSize:'14px', marginBottom:'24px' }}>Be the first to submit and get rated by the community!</p>
                      <a href="/submit" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'11px 24px', borderRadius:'7px', fontSize:'14px' }}>Submit a Project →</a>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {/* TOP 3 PODIUM */}
                      {projects.length >= 3 && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'24px' }}>
                          {[projects[1], projects[0], projects[2]].map((p, i) => {
                            const rank = i===0?2:i===1?1:3
                            const badge = getBadge(p.rating)
                            const podiumH = rank===1?'140px':rank===2?'110px':'90px'
                            return (
                              <a key={p.id} href={`/projects/${p.id}`}
                                style={{ backgroundColor:'#1a1d2e', border:`2px solid ${rank===1?'#D97706':rank===2?'#9ba8b5':'#cd7f32'}`, borderRadius:'12px', overflow:'hidden', display:'flex', flexDirection:'column', textDecoration:'none', transition:'transform .2s', position:'relative' }}
                                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                                {/* Rank badge */}
                                <div style={{ position:'absolute', top:'10px', left:'10px', zIndex:2, fontSize:'22px' }}>
                                  {rank===1?'🥇':rank===2?'🥈':'🥉'}
                                </div>
                                {/* Cover */}
                                <div style={{ height:podiumH, overflow:'hidden', position:'relative' }}>
                                  {p.coverImage ? (
                                    <img src={p.coverImage} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                                  ) : (
                                    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', background:'linear-gradient(135deg,#1e2235,#20243a)' }}>
                                      {CAT_EMOJI[p.category] || '🔬'}
                                    </div>
                                  )}
                                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,29,46,.9) 0%, transparent 60%)' }}/>
                                  <div style={{ position:'absolute', bottom:'10px', left:'12px', right:'12px' }}>
                                    <div style={{ fontWeight:700, fontSize:'clamp(11px,2.5vw,13px)', color:'#fff', lineHeight:1.3, marginBottom:'4px' }}>{p.title}</div>
                                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,.7)' }}>{p.authorName}</div>
                                  </div>
                                </div>
                                {/* Rating */}
                                <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
                                  <RatingBar rating={p.rating}/>
                                  <span style={{ fontSize:'11px', color:'#4a5070', whiteSpace:'nowrap' }}>{p.ratingCount} vote{p.ratingCount!==1?'s':''}</span>
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      )}

                      {/* REST OF THE LIST */}
                      {projects.map((p, idx) => {
                        const badge = getBadge(p.rating)
                        const isTop3 = idx < 3
                        return (
                          <a key={p.id} href={`/projects/${p.id}`} className="proj-row"
                            style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px', transition:'all .15s' }}>
                            {/* Rank number */}
                            <div className="rank-num" style={{ width:'32px', height:'32px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:800, flexShrink:0, backgroundColor: isTop3?'transparent':'#13151f', color: idx===0?'#D97706':idx===1?'#9ba8b5':idx===2?'#cd7f32':'#4a5070' }}>
                              {idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`#${idx+1}`}
                            </div>

                            {/* Thumbnail */}
                            <div style={{ width:'52px', height:'52px', borderRadius:'8px', overflow:'hidden', flexShrink:0, backgroundColor:'#13151f' }}>
                              {p.coverImage ? (
                                <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                              ) : (
                                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', background:'linear-gradient(135deg,#1e2235,#20243a)' }}>
                                  {CAT_EMOJI[p.category] || '🔬'}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                                <div style={{ fontWeight:600, fontSize:'14px', color:'#dde1f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</div>
                                {badge && (
                                  <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'99px', backgroundColor:badge.bg, color:badge.color, border:`1px solid ${badge.border}`, flexShrink:0 }}>
                                    {badge.emoji} {badge.label}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize:'12px', color:'#7a82a0' }}>
                                {p.authorName} · {p.category} · {p.level}
                              </div>
                            </div>

                            {/* Rating bar */}
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0, minWidth:'120px' }}>
                              <RatingBar rating={p.rating}/>
                              <div style={{ fontSize:'11px', color:'#4a5070' }}>{p.ratingCount} vote{p.ratingCount!==1?'s':''}</div>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TOP MAKERS ── */}
              {tab==='makers' && (
                <div>
                  {makers.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px', color:'#7a82a0' }}>
                      <div style={{ fontSize:'40px', marginBottom:'16px' }}>👤</div>
                      <div style={{ fontSize:'16px', fontWeight:600, marginBottom:'8px', color:'#dde1f0' }}>No ranked makers yet</div>
                      <p style={{ fontSize:'14px', marginBottom:'24px' }}>Submit projects and get rated to appear here.</p>
                      <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'11px 24px', borderRadius:'7px', fontSize:'14px' }}>Submit a Project →</a>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {makers.map((m, idx) => {
                        const badge = getBadge(m.avgRating)
                        return (
                          <div key={m.id} className="maker-row"
                            style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px', transition:'all .15s' }}>
                            {/* Rank */}
                            <div className="rank-num" style={{ width:'32px', fontSize:'14px', fontWeight:800, textAlign:'center', flexShrink:0, color: idx===0?'#D97706':idx===1?'#9ba8b5':idx===2?'#cd7f32':'#4a5070' }}>
                              {idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`#${idx+1}`}
                            </div>

                            {/* Avatar */}
                            <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:`linear-gradient(135deg,${avatarColor(m.name)},#1a1d2e)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0, overflow:'hidden', border:`2px solid ${idx===0?'#D97706':idx===1?'#9ba8b5':idx===2?'#cd7f32':'#2a2f4a'}` }}>
                              {m.photoURL ? <img src={m.photoURL} alt="" style={{ width:'44px', height:'44px', objectFit:'cover' }}/> : initials(m.name)}
                            </div>

                            {/* Info */}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                                <div style={{ fontWeight:700, fontSize:'14px', color:'#dde1f0' }}>{m.name}</div>
                                {badge && (
                                  <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'99px', backgroundColor:badge.bg, color:badge.color, border:`1px solid ${badge.border}`, flexShrink:0 }}>
                                    {badge.emoji} {badge.label}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize:'12px', color:'#7a82a0' }}>
                                {m.town && `📍 ${m.town} · `}{m.projectCount} rated project{m.projectCount!==1?'s':''}
                              </div>
                            </div>

                            {/* Rating */}
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0, minWidth:'120px' }}>
                              <RatingBar rating={m.avgRating}/>
                              <div style={{ fontSize:'11px', color:'#4a5070' }}>{m.ratingCount} total vote{m.ratingCount!==1?'s':''}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}