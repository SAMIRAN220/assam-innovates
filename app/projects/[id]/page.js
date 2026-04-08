'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../components/AuthProvider'
import { db } from '../../../lib/firebase'
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore'

function getYoutubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return m ? m[1] : null
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now()-d)/1000)
  if (diff<3600)  return Math.floor(diff/60)+'m ago'
  if (diff<86400) return Math.floor(diff/3600)+'h ago'
  return Math.floor(diff/86400)+'d ago'
}

const levelStyle = {
  Beginner:     { bg:'rgba(45,212,160,.1)',  color:'#2dd4a0' },
  Intermediate: { bg:'rgba(240,165,0,.1)',   color:'#f0a500' },
  Advanced:     { bg:'rgba(255,100,100,.1)', color:'#ff6464' },
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingDone, setRatingDone]   = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(()=>{ if(id) fetchProject() },[id])

  const fetchProject = async () => {
    setLoading(true)
    try {
      const snap = await getDoc(doc(db,'projects',id))
      if (snap.exists()) {
        const data = { id:snap.id, ...snap.data() }
        setProject(data)
        if (user && data.ratedBy?.includes(user.uid)) setRatingDone(true)
      }
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const submitRating = async (rating) => {
    if (!user)          { window.location.href='/login'; return }
    if (ratingDone || submittingRating) return
    setSubmittingRating(true)
    try {
      const newCount  = (project.ratingCount||0)+1
      const newRating = ((project.rating||0)*(project.ratingCount||0)+rating)/newCount
      await updateDoc(doc(db,'projects',id), {
        rating:      newRating,
        ratingCount: newCount,
        ratedBy:     arrayUnion(user.uid),
      })
      setProject(p=>({ ...p, rating:newRating, ratingCount:newCount }))
      setRatingDone(true)
    } catch(e) { console.error(e) }
    setSubmittingRating(false)
  }

  const S = {
    page:  { backgroundColor:'#0d0f14', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', color:'#dde1f0' },
    nav:   { backgroundColor:'#1a1d2e', borderBottom:'1px solid #2a2f4a', padding:'0 20px', position:'sticky', top:0, zIndex:100 },
    navIn: { height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'900px', margin:'0 auto' },
    wrap:  { maxWidth:'900px', margin:'0 auto', padding:'24px 20px 60px' },
    card:  { backgroundColor:'#1a1d2e', border:'1px solid #2a2f4a', borderRadius:'10px', padding:'20px', marginBottom:'16px' },
    head:  { fontSize:'12px', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', color:'#7a82a0', marginBottom:'12px' },
    link:  { display:'inline-flex', alignItems:'center', gap:'6px', backgroundColor:'#13151f', border:'1px solid #2a2f4a', borderRadius:'6px', padding:'8px 14px', fontSize:'13px', color:'#4a9eff', textDecoration:'none', marginRight:'8px', marginBottom:'8px' },
  }

  if (loading) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'#7a82a0' }}><div style={{ fontSize:'32px', marginBottom:'12px' }}>Loading...</div></div>
    </div>
  )
  if (!project) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ marginBottom:'16px', color:'#7a82a0' }}>Project not found.</div>
        <a href="/projects" style={{ color:'#4a9eff' }}>Back to Projects</a>
      </div>
    </div>
  )

  const ytId = getYoutubeId(project.youtubeUrl)

  return (
    <div style={S.page}>
      <style>{`@media(max-width:639px){.desk-nav{display:none!important}} .star-btn:hover{transform:scale(1.2);transition:transform .1s}`}</style>

      <nav style={S.nav}>
        <div style={S.navIn}>
          <a href="/" style={{ fontWeight:800, fontSize:'15px', color:'#dde1f0', textDecoration:'none' }}><span style={{ color:'#4a9eff' }}>Assam</span> Innovates</a>
          <div className="desk-nav" style={{ display:'flex', gap:'16px', alignItems:'center' }}>
            <a href="/projects" style={{ color:'#4a9eff', fontSize:'13px', textDecoration:'none', fontWeight:600 }}>Projects</a>
            {user && <a href="/submit" style={{ backgroundColor:'#2dd4a0', color:'#0d0f14', fontWeight:700, padding:'6px 14px', borderRadius:'5px', textDecoration:'none', fontSize:'12px' }}>+ Submit</a>}
          </div>
        </div>
      </nav>

      <div style={S.wrap}>
        <a href="/projects" style={{ color:'#4a9eff', fontSize:'13px', textDecoration:'none', display:'inline-block', marginBottom:'20px' }}>← Back to Projects</a>

        {/* HEADER */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
            {project.level    && <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'4px', backgroundColor:levelStyle[project.level]?.bg, color:levelStyle[project.level]?.color }}>{project.level}</span>}
            {project.category && <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'4px', backgroundColor:'rgba(74,158,255,.1)', color:'#4a9eff' }}>{project.category}</span>}
          </div>
          <h1 style={{ fontSize:'clamp(22px,5vw,36px)', fontWeight:800, lineHeight:1.2, marginBottom:'14px', letterSpacing:'-.3px' }}>{project.title}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#4a9eff,#2dd4a0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', flexShrink:0 }}>
              {project.authorName?.split(' ').map(n=>n[0]).join('').slice(0,2)||'?'}
            </div>
            <span style={{ fontSize:'13px', color:'#dde1f0', fontWeight:600 }}>{project.authorName}</span>
            <span style={{ fontSize:'12px', color:'#7a82a0' }}>{timeAgo(project.createdAt)}</span>
            {project.ratingCount>0 && <span style={{ fontSize:'13px', color:'#f0a500', fontWeight:600 }}>★ {project.rating?.toFixed(1)} ({project.ratingCount} rating{project.ratingCount!==1?'s':''})</span>}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div style={S.card}>
          <div style={S.head}>About this project</div>
          <div style={{ fontSize:'15px', color:'#aab0c8', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{project.description}</div>
        </div>

        {/* YOUTUBE */}
        {ytId && (
          <div style={S.card}>
            <div style={S.head}>Project video</div>
            <div style={{ borderRadius:'8px', overflow:'hidden', aspectRatio:'16/9', border:'1px solid #2a2f4a' }}>
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} style={{ border:'none', display:'block' }} allowFullScreen/>
            </div>
          </div>
        )}

        {/* LINKS */}
        {(project.githubUrl || project.driveUrl || project.links?.filter(l=>l.url).length>0) && (
          <div style={S.card}>
            <div style={S.head}>Links & resources</div>
            <div style={{ display:'flex', flexWrap:'wrap' }}>
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" style={S.link}>
                  <span>🐙</span> GitHub Repository
                </a>
              )}
              {project.driveUrl && (
                <a href={project.driveUrl} target="_blank" rel="noreferrer" style={S.link}>
                  <span>📁</span> Google Drive / Diagrams
                </a>
              )}
              {project.links?.filter(l=>l.url).map((l,i)=>(
                <a key={i} href={l.url} target="_blank" rel="noreferrer" style={S.link}>
                  <span>🔗</span> {l.label || l.url}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* BILL OF MATERIALS */}
        {project.parts?.filter(p=>p).length>0 && (
          <div style={S.card}>
            <div style={S.head}>Bill of materials</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {project.parts.filter(p=>p).map((part,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', backgroundColor:'#13151f', borderRadius:'5px', border:'1px solid #2a2f4a', fontSize:'14px' }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'50%', backgroundColor:'#2a2f4a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, color:'#7a82a0', flexShrink:0 }}>{i+1}</div>
                  {part}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RATING */}
        <div style={S.card}>
          <div style={S.head}>Rate this project</div>
          {ratingDone ? (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>⭐</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'#2dd4a0', marginBottom:'4px' }}>Thanks for your rating!</div>
              <div style={{ fontSize:'13px', color:'#7a82a0' }}>
                Current average: <strong style={{ color:'#f0a500' }}>{project.rating?.toFixed(1)}/10</strong> from {project.ratingCount} rating{project.ratingCount!==1?'s':''}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <p style={{ fontSize:'13px', color:'#7a82a0', marginBottom:'16px' }}>
                {user ? 'How would you rate this project out of 10?' : 'Log in to rate this project.'}
              </p>
              {user ? (
                <>
                  <div style={{ display:'flex', gap:'6px', justifyContent:'center', flexWrap:'wrap', marginBottom:'10px' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                      <button key={n} className="star-btn"
                        onClick={()=>submitRating(n)}
                        onMouseEnter={()=>setHoverRating(n)}
                        onMouseLeave={()=>setHoverRating(0)}
                        disabled={submittingRating}
                        style={{ width:'38px', height:'38px', borderRadius:'6px', border:'1px solid', borderColor:n<=(hoverRating||0)?'#f0a500':'#2a2f4a', backgroundColor:n<=(hoverRating||0)?'rgba(240,165,0,.1)':'#13151f', color:n<=(hoverRating||0)?'#f0a500':'#7a82a0', fontWeight:700, fontSize:'13px', cursor:'pointer', transition:'all .1s' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize:'11px', color:'#4a5070' }}>Hover to preview · Click to submit</div>
                </>
              ) : (
                <a href="/login" style={{ display:'inline-block', backgroundColor:'#4a9eff', color:'#fff', fontWeight:700, padding:'10px 24px', borderRadius:'7px', fontSize:'14px', textDecoration:'none' }}>Log In to Rate</a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}