'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore'

const assamTowns = [
  'Barpeta','Bongaigaon','Cachar','Darrang','Dhemaji','Dhubri','Dibrugarh',
  'Dima Hasao','Goalpara','Golaghat','Guwahati','Hailakandi','Hojai','Jorhat',
  'Kamrup','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur','Majuli',
  'Morigaon','Nagaon','Nalbari','Sivasagar','Silchar','Sonitpur',
  'South Salmara','Tezpur','Tinsukia','Udalguri','West Karbi Anglong','Other'
]

const skillLevels = ['Spark','Current','Power','LabNotes']

const skillColors = {
  Spark:    { color:'#f0a500', bg:'rgba(240,165,0,.1)'   },
  Current:  { color:'#2dd4a0', bg:'rgba(45,212,160,.1)'  },
  Power:    { color:'#4a9eff', bg:'rgba(74,158,255,.1)'  },
  LabNotes: { color:'#a78bfa', bg:'rgba(167,139,250,.1)' },
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

function getBadge(rating) {
  if (rating >= 8) return { label:'Gold',   emoji:'🥇', color:'#f0a500', bg:'rgba(240,165,0,.1)',   border:'rgba(240,165,0,.3)'   }
  if (rating >= 6) return { label:'Silver', emoji:'🥈', color:'#9ba8b5', bg:'rgba(155,168,181,.1)', border:'rgba(155,168,181,.3)' }
  if (rating >= 4) return { label:'Bronze', emoji:'🥉', color:'#cd7f32', bg:'rgba(205,127,50,.1)',  border:'rgba(205,127,50,.3)'  }
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

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const [profile, setProfile]         = useState(null)
  const [myProjects, setMyProjects]   = useState([])
  const [ratedProjects, setRatedProjects] = useState([])
  const [tab, setTab]                 = useState('projects')
  const [editing, setEditing]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [editForm, setEditForm]       = useState({
    name: '', bio: '', town: '', skillLevel: ''
  })

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login'
    if (user) fetchAll()
  }, [user, loading])

  const fetchAll = async () => {
    setDataLoading(true)
    try {
      // Fetch profile
      const ref  = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)
      let profileData
      if (snap.exists()) {
        profileData = snap.data()
        setProfile(profileData)
        setEditForm({
          name:       profileData.name       || user.displayName || '',
          bio:        profileData.bio        || '',
          town:       profileData.town       || '',
          skillLevel: profileData.skillLevel || '',
        })
      } else {
        const newProfile = {
          name:         user.displayName || '',
          email:        user.email || '',
          photoURL:     user.photoURL || '',
          bio:          '',
          town:         '',
          skillLevel:   '',
          createdAt:    serverTimestamp(),
          projectCount: 0,
          avgRating:    0,
        }
        await setDoc(ref, newProfile)
        setProfile(newProfile)
        profileData = newProfile
        setEditForm({ name: user.displayName || '', bio:'', town:'', skillLevel:'' })
      }

      // Fetch my projects
      const projSnap = await getDocs(query(collection(db, 'projects'), where('authorId', '==', user.uid)))
      const myProj = projSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setMyProjects(myProj)

      // Fetch projects I've rated
      const allProjSnap = await getDocs(collection(db, 'projects'))
      const rated = allProjSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.ratedBy?.includes(user.uid) && p.authorId !== user.uid)
        .sort((a, b) => b.rating - a.rating)
      setRatedProjects(rated)

    } catch(e) { console.error(e) }
    setDataLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name:       editForm.name.trim(),
        bio:        editForm.bio.trim(),
        town:       editForm.town,
        skillLevel: editForm.skillLevel,
      }, { merge: true })
      setProfile(p => ({ ...p, ...editForm, name: editForm.name.trim(), bio: editForm.bio.trim() }))
      setEditing(false)
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  // Compute stats
  const totalRatings   = myProjects.reduce((s, p) => s + (p.ratingCount || 0), 0)
  const avgRating      = myProjects.filter(p => p.ratingCount > 0).length > 0
    ? myProjects.reduce((s, p) => s + (p.rating || 0) * (p.ratingCount || 0), 0) / totalRatings
    : 0
  const bestProject    = myProjects.filter(p => p.ratingCount > 0).sort((a,b) => b.rating - a.rating)[0]
  const topBadge       = bestProject ? getBadge(bestProject.rating) : null

  // All badges earned across projects
  const earnedBadges = []
  if (myProjects.some(p => p.rating >= 8  && p.ratingCount > 0)) earnedBadges.push({ emoji:'🥇', label:'Gold',   color:'#f0a500', bg:'rgba(240,165,0,.1)',   border:'rgba(240,165,0,.3)',   desc:'Achieved a rating of 8.0 or above'  })
  if (myProjects.some(p => p.rating >= 6  && p.ratingCount > 0)) earnedBadges.push({ emoji:'🥈', label:'Silver', color:'#9ba8b5', bg:'rgba(155,168,181,.1)', border:'rgba(155,168,181,.3)', desc:'Achieved a rating of 6.0 or above'  })
  if (myProjects.some(p => p.rating >= 4  && p.ratingCount > 0)) earnedBadges.push({ emoji:'🥉', label:'Bronze', color:'#cd7f32', bg:'rgba(205,127,50,.1)',  border:'rgba(205,127,50,.3)',  desc:'Achieved a rating of 4.0 or above'  })
  if (myProjects.length >= 1)  earnedBadges.push({ emoji:'🚀', label:'Pioneer',    color:'#4a9eff', bg:'rgba(74,158,255,.1)',  border:'rgba(74,158,255,.3)',  desc:'Submitted your first project'        })
  if (myProjects.length >= 3)  earnedBadges.push({ emoji:'🔨', label:'Builder',    color:'#2dd4a0', bg:'rgba(45,212,160,.1)',  border:'rgba(45,212,160,.3)',  desc:'Submitted 3 or more projects'        })
  if (myProjects.length >= 5)  earnedBadges.push({ emoji:'⚡', label:'Innovator',  color:'#a78bfa', bg:'rgba(167,139,250,.1)', border:'rgba(167,139,250,.3)', desc:'Submitted 5 or more projects'        })
  if (ratedProjects.length >= 5) earnedBadges.push({ emoji:'⭐', label:'Reviewer', color:'#f0a500', bg:'rgba(240,165,0,.08)',  border:'rgba(240,165,0,.2)',   desc:'Rated 5 or more projects'           })

  const S = {
    page:   { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0', overflowX:'hidden' },
    nav:    { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', position:'sticky', top:0, zIndex:100 },
    navIn:  { height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'900px', margin:'0 auto', gap:'12px' },
    wrap:   { maxWidth:'900px', margin:'0 auto', padding:'24px 20px 60px' },
    card:   { backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'12px', padding:'20px 24px', marginBottom:'16px' },
    input:  { width:'100%', backgroundColor:'#13151f', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'10px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none' },
    textarea:{ width:'100%', backgroundColor:'#13151f', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'10px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:'80px' },
    select: { width:'100%', backgroundColor:'#13151f', border:'1px solid #2a2f4a', borderRadius:'7px', padding:'10px 14px', color:'#dde1f0', fontSize:'14px', fontFamily:'inherit', outline:'none', cursor:'pointer' },
    btnP:   { backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'9px 20px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'13px' },
    btnS:   { backgroundColor:'transparent', color:'#7a82a0', padding:'9px 20px', borderRadius:'7px', border:'1px solid #2a2f4a', cursor:'pointer', fontSize:'13px' },
    btnD:   { backgroundColor:'rgba(255,100,100,.08)', color:'#ff8080', padding:'9px 20px', borderRadius:'7px', border:'1px solid rgba(255,100,100,.2)', cursor:'pointer', fontSize:'13px' },
    label:  { display:'block', fontSize:'12px', fontWeight:600, color:'#7a82a0', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.5px' },
    field:  { marginBottom:'16px' },
  }

  if (loading || !user) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#7a82a0' }}><div style={{ fontSize:'32px', marginBottom:'12px' }}>⚡</div><div>Loading...</div></div>
    </div>
  )

  const tabs = [
    { id:'projects', label:'My Projects',    count: myProjects.length    },
    { id:'badges',   label:'Badges',         count: earnedBadges.length  },
    { id:'rated',    label:'Projects I Rated', count: ratedProjects.length },
    { id:'settings', label:'Edit Profile',   count: null                 },
  ]

  return (
    <div style={S.page}>
      <style>{`
        input:focus,select:focus,textarea:focus{border-color:#4a9eff!important;box-shadow:0 0 0 3px rgba(74,158,255,.12)}
        input::placeholder,textarea::placeholder{color:#4a5070}
        .proj-card-p:hover{border-color:#4a9eff!important;transform:translateY(-1px)}
        .tab-btn:hover{color:#dde1f0!important}
        @media(max-width:639px){.desk-nav{display:none!important}.mob-ham{display:flex!important}.stats-row{grid-template-columns:repeat(2,1fr)!important}}
        @media(min-width:640px){.mob-ham{display:none!important}}
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', flexShrink:0 }}>
            <span style={{ color:'#4a9eff' }}>Assam</span> Innovates
          </a>
          <div className="desk-nav" style={{ display:'flex', gap:'20px', fontSize:'13px', flex:1, justifyContent:'center' }}>
            {[['/', 'Home'],['/projects','Projects'],['/forum','Forum'],['/leaderboard','Leaderboard']].map(([href,label]) => (
              <a key={label} href={href} style={{ color:'#7a82a0' }}>{label}</a>
            ))}
          </div>
          <button onClick={logout} style={{ ...S.btnD, padding:'6px 14px', fontSize:'12px', flexShrink:0 }}>Sign Out</button>
          <button className="mob-ham" onClick={()=>setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'1px solid #2a2f4a', borderRadius:'5px', padding:'6px 10px', cursor:'pointer', color:'#dde1f0', fontSize:'16px', alignItems:'center' }}>
            {menuOpen?'✕':'☰'}
          </button>
        </div>
      </nav>

      <div style={S.wrap}>

        {/* ── PROFILE HEADER ── */}
        <div style={{ ...S.card, background:'linear-gradient(135deg,#1a1d2e,#1e2235)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', flexWrap:'wrap' }}>
            {/* Avatar */}
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#4a9eff,#2dd4a0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:700, color:'#fff', flexShrink:0, overflow:'hidden', border:'3px solid #2a2f4a' }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" style={{ width:'72px', height:'72px', objectFit:'cover' }}/>
                : initials(profile?.name || user.displayName)
              }
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
                <div style={{ fontSize:'22px', fontWeight:800 }}>{profile?.name || user.displayName || 'Maker'}</div>
                {topBadge && (
                  <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'99px', backgroundColor:topBadge.bg, color:topBadge.color, border:`1px solid ${topBadge.border}` }}>
                    {topBadge.emoji} {topBadge.label} Maker
                  </span>
                )}
                {profile?.skillLevel && (
                  <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'99px', backgroundColor:skillColors[profile.skillLevel]?.bg, color:skillColors[profile.skillLevel]?.color }}>
                    {profile.skillLevel}
                  </span>
                )}
              </div>
              <div style={{ fontSize:'13px', color:'#7a82a0', marginBottom:'6px' }}>
                {user.email}
                {profile?.town && <span> · 📍 {profile.town}, Assam</span>}
              </div>
              {profile?.bio && (
                <div style={{ fontSize:'13px', color:'#aab0c8', lineHeight:1.6, maxWidth:'500px' }}>{profile.bio}</div>
              )}
              {!profile?.bio && (
                <button onClick={() => setTab('settings')} style={{ fontSize:'12px', color:'#4a9eff', background:'none', border:'none', cursor:'pointer', padding:0, textDecoration:'underline' }}>
                  + Add a bio
                </button>
              )}
            </div>

            <button onClick={() => setTab('settings')} style={{ ...S.btnS, fontSize:'12px', padding:'7px 14px', flexShrink:0 }}>
              Edit Profile
            </button>
          </div>

          {/* STATS ROW */}
          <div className="stats-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', backgroundColor:'#2a2f4a', borderRadius:'8px', overflow:'hidden', marginTop:'20px' }}>
            {[
              ['Projects',    myProjects.length],
              ['Avg Rating',  avgRating > 0 ? avgRating.toFixed(1) : '—'],
              ['Total Votes', totalRatings || '—'],
              ['Joined',      profile?.createdAt ? new Date(profile.createdAt.toDate?.() || Date.now()).getFullYear() : '2026'],
            ].map(([label, val]) => (
              <div key={label} style={{ backgroundColor:'#13151f', padding:'14px 10px', textAlign:'center' }}>
                <div style={{ fontSize:'20px', fontWeight:800, color:'#4a9eff' }}>{val}</div>
                <div style={{ fontSize:'11px', color:'#7a82a0', marginTop:'3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:'0', backgroundColor:'#1a1d2e', borderRadius:'10px', overflow:'hidden', border:'1px solid #2a2f4a', marginBottom:'16px', overflowX:'auto' }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
              style={{ flex:1, backgroundColor:'transparent', border:'none', borderBottom:`2px solid ${tab===t.id?'#4a9eff':'transparent'}`, padding:'13px 12px', cursor:'pointer', color:tab===t.id?'#4a9eff':'#7a82a0', fontSize:'13px', fontWeight:tab===t.id?600:400, fontFamily:'Inter,system-ui,sans-serif', transition:'color .15s', whiteSpace:'nowrap', minWidth:'100px' }}>
              {t.label}
              {t.count !== null && (
                <span style={{ marginLeft:'6px', fontSize:'11px', backgroundColor:tab===t.id?'rgba(74,158,255,.15)':'#2a2f4a', color:tab===t.id?'#4a9eff':'#7a82a0', padding:'1px 7px', borderRadius:'99px' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'#7a82a0' }}>
            <div style={{ fontSize:'28px', marginBottom:'12px' }}>⚡</div>
            <div>Loading your data...</div>
          </div>
        ) : (
          <>
            {/* ── MY PROJECTS ── */}
            {tab==='projects' && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                  <div style={{ fontSize:'14px', fontWeight:600 }}>Your submitted projects</div>
                  <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'8px 16px', borderRadius:'6px', fontSize:'12px' }}>+ Submit New</a>
                </div>
                {myProjects.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px', backgroundColor:'#1a1d2e', borderRadius:'12px', border:'1px solid #2a2f4a' }}>
                    <div style={{ fontSize:'36px', marginBottom:'12px' }}>🚀</div>
                    <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'8px' }}>No projects yet</div>
                    <p style={{ fontSize:'13px', color:'#7a82a0', marginBottom:'20px' }}>Share your first project with the community.</p>
                    <a href="/submit" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'10px 22px', borderRadius:'7px', fontSize:'13px' }}>Submit a Project →</a>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {myProjects.map(p => {
                      const badge = p.ratingCount > 0 ? getBadge(p.rating) : null
                      return (
                        <a key={p.id} href={`/projects/${p.id}`} className="proj-card-p"
                          style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'14px 18px', display:'flex', gap:'14px', alignItems:'center', transition:'all .15s', textDecoration:'none' }}>
                          {/* Thumbnail */}
                          <div style={{ width:'56px', height:'56px', borderRadius:'8px', overflow:'hidden', flexShrink:0, backgroundColor:'#13151f' }}>
                            {p.coverImage ? (
                              <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                            ) : (
                              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', background:'linear-gradient(135deg,#1e2235,#20243a)' }}>
                                {CAT_EMOJI[p.category] || '🔬'}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                              <div style={{ fontWeight:600, fontSize:'14px', color:'#dde1f0' }}>{p.title}</div>
                              {badge && (
                                <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'99px', backgroundColor:badge.bg, color:badge.color, border:`1px solid ${badge.border}` }}>
                                  {badge.emoji} {badge.label}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize:'12px', color:'#7a82a0' }}>
                              {p.level && <span>{p.level} · </span>}
                              {p.category && <span>{p.category} · </span>}
                              <span>{timeAgo(p.createdAt)}</span>
                            </div>
                          </div>

                          {/* Rating */}
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            {p.ratingCount > 0 ? (
                              <>
                                <div style={{ fontSize:'18px', fontWeight:800, color: p.rating>=8?'#f0a500':p.rating>=6?'#9ba8b5':p.rating>=4?'#cd7f32':'#4a9eff' }}>
                                  {p.rating.toFixed(1)}
                                </div>
                                <div style={{ fontSize:'11px', color:'#4a5070' }}>{p.ratingCount} vote{p.ratingCount!==1?'s':''}</div>
                              </>
                            ) : (
                              <div style={{ fontSize:'12px', color:'#4a5070' }}>Not yet<br/>rated</div>
                            )}
                          </div>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── BADGES ── */}
            {tab==='badges' && (
              <div>
                <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'14px' }}>Badges you&apos;ve earned</div>
                {earnedBadges.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px', backgroundColor:'#1a1d2e', borderRadius:'12px', border:'1px solid #2a2f4a' }}>
                    <div style={{ fontSize:'36px', marginBottom:'12px' }}>🏅</div>
                    <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'8px' }}>No badges yet</div>
                    <p style={{ fontSize:'13px', color:'#7a82a0', marginBottom:'20px' }}>Submit projects and get rated to earn badges.</p>
                    <a href="/submit" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'10px 22px', borderRadius:'7px', fontSize:'13px' }}>Submit a Project →</a>
                  </div>
                ) : (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,200px),1fr))', gap:'12px', marginBottom:'24px' }}>
                      {earnedBadges.map((b, i) => (
                        <div key={i} style={{ backgroundColor:'#1a1d2e', border:`1px solid ${b.border}`, borderRadius:'12px', padding:'20px 16px', textAlign:'center' }}>
                          <div style={{ fontSize:'36px', marginBottom:'10px' }}>{b.emoji}</div>
                          <div style={{ fontSize:'15px', fontWeight:700, color:b.color, marginBottom:'6px' }}>{b.label}</div>
                          <div style={{ fontSize:'12px', color:'#7a82a0', lineHeight:1.5 }}>{b.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* Locked badges */}
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#4a5070', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px' }}>Locked</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,200px),1fr))', gap:'12px' }}>
                      {[
                        { emoji:'🥇', label:'Gold',     desc:'Achieve 8.0+ rating',       done: earnedBadges.some(b=>b.label==='Gold')     },
                        { emoji:'🔨', label:'Builder',  desc:'Submit 3+ projects',         done: earnedBadges.some(b=>b.label==='Builder')  },
                        { emoji:'⚡', label:'Innovator', desc:'Submit 5+ projects',         done: earnedBadges.some(b=>b.label==='Innovator') },
                        { emoji:'⭐', label:'Reviewer', desc:'Rate 5+ projects',           done: earnedBadges.some(b=>b.label==='Reviewer') },
                      ].filter(b => !b.done).map((b, i) => (
                        <div key={i} style={{ backgroundColor:'#13151f', border:'1px solid #2a2f4a', borderRadius:'12px', padding:'20px 16px', textAlign:'center', opacity:.5 }}>
                          <div style={{ fontSize:'36px', marginBottom:'10px', filter:'grayscale(1)' }}>{b.emoji}</div>
                          <div style={{ fontSize:'15px', fontWeight:700, color:'#4a5070', marginBottom:'6px' }}>{b.label}</div>
                          <div style={{ fontSize:'12px', color:'#4a5070', lineHeight:1.5 }}>{b.desc}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── PROJECTS I RATED ── */}
            {tab==='rated' && (
              <div>
                <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'14px' }}>Projects you&apos;ve rated</div>
                {ratedProjects.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px', backgroundColor:'#1a1d2e', borderRadius:'12px', border:'1px solid #2a2f4a' }}>
                    <div style={{ fontSize:'36px', marginBottom:'12px' }}>⭐</div>
                    <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'8px' }}>No ratings yet</div>
                    <p style={{ fontSize:'13px', color:'#7a82a0', marginBottom:'20px' }}>Explore projects and rate ones you find interesting.</p>
                    <a href="/projects" style={{ backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'10px 22px', borderRadius:'7px', fontSize:'13px' }}>Explore Projects →</a>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {ratedProjects.map(p => (
                      <a key={p.id} href={`/projects/${p.id}`} className="proj-card-p"
                        style={{ backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'14px 18px', display:'flex', gap:'14px', alignItems:'center', transition:'all .15s', textDecoration:'none' }}>
                        <div style={{ width:'48px', height:'48px', borderRadius:'8px', overflow:'hidden', flexShrink:0, backgroundColor:'#13151f' }}>
                          {p.coverImage ? (
                            <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          ) : (
                            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', background:'linear-gradient(135deg,#1e2235,#20243a)' }}>
                              {CAT_EMOJI[p.category] || '🔬'}
                            </div>
                          )}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:'14px', color:'#dde1f0', marginBottom:'4px' }}>{p.title}</div>
                          <div style={{ fontSize:'12px', color:'#7a82a0' }}>by {p.authorName} · {p.category}</div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontSize:'16px', fontWeight:800, color:'#f0a500' }}>★ {p.rating?.toFixed(1)}</div>
                          <div style={{ fontSize:'11px', color:'#4a5070' }}>community avg</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── EDIT PROFILE ── */}
            {tab==='settings' && (
              <div style={S.card}>
                <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'20px' }}>Edit your profile</div>

                <div style={S.field}>
                  <label style={S.label}>Display name</label>
                  <input style={S.input} placeholder="Your full name" value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}/>
                </div>

                <div style={S.field}>
                  <label style={S.label}>Bio</label>
                  <textarea style={S.textarea} placeholder="Tell the community about yourself — what you build, what you love about electronics..." value={editForm.bio} onChange={e=>setEditForm(p=>({...p,bio:e.target.value}))}/>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap:'14px', marginBottom:'24px' }}>
                  <div>
                    <label style={S.label}>Your town in Assam</label>
                    <select style={S.select} value={editForm.town} onChange={e=>setEditForm(p=>({...p,town:e.target.value}))}>
                      <option value="">Select town...</option>
                      {assamTowns.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Skill level</label>
                    <select style={S.select} value={editForm.skillLevel} onChange={e=>setEditForm(p=>({...p,skillLevel:e.target.value}))}>
                      <option value="">Select level...</option>
                      <option value="Spark">⚡ Spark — Just starting out</option>
                      <option value="Current">🔬 Current — Student / hobbyist</option>
                      <option value="Power">⚙️ Power — Professional</option>
                      <option value="LabNotes">🧪 Lab Notes — Researcher</option>
                    </select>
                  </div>
                </div>

                <div style={{ display:'flex', gap:'10px' }}>
                  <button onClick={saveProfile} disabled={saving} style={{ ...S.btnP, opacity:saving?.6:1, cursor:saving?'not-allowed':'pointer' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setTab('projects')} style={S.btnS}>Cancel</button>
                </div>

                {/* DANGER ZONE */}
                <div style={{ marginTop:'32px', paddingTop:'24px', borderTop:'1px solid #2a2f4a' }}>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#ff8080', marginBottom:'8px' }}>Sign out</div>
                  <p style={{ fontSize:'12px', color:'#7a82a0', marginBottom:'12px' }}>You can log back in any time.</p>
                  <button onClick={logout} style={S.btnD}>Sign Out</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}