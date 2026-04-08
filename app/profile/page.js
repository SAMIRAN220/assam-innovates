'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const assamTowns = [
  'Barpeta','Bongaigaon','Cachar','Darrang','Dhemaji','Dhubri','Dibrugarh',
  'Dima Hasao','Goalpara','Golaghat','Guwahati','Hailakandi','Hojai','Jorhat',
  'Kamrup','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur','Majuli',
  'Morigaon','Nagaon','Nalbari','Sivasagar','Silchar','Sonitpur',
  'South Salmara','Tezpur','Tinsukia','Udalguri','West Karbi Anglong','Other'
]

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const [profile, setProfile]     = useState(null)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editForm, setEditForm]   = useState({ town: '', skillLevel: '' })

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login'
    if (user) fetchOrCreateProfile()
  }, [user, loading])

  const fetchOrCreateProfile = async () => {
    try {
      const ref  = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        const data = snap.data()
        setProfile(data)
        setEditForm({ town: data.town || '', skillLevel: data.skillLevel || '' })
      } else {
        // First time — create the profile document
        const newProfile = {
          name:         user.displayName || '',
          email:        user.email || '',
          photoURL:     user.photoURL || '',
          town:         '',
          skillLevel:   '',
          createdAt:    serverTimestamp(),
          projectCount: 0,
          avgRating:    0,
        }
        await setDoc(ref, newProfile)
        setProfile(newProfile)
        setEditForm({ town: '', skillLevel: '' })
      }
    } catch (e) {
      console.error('Profile fetch error:', e)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      // setDoc with merge:true creates or updates — never fails
      await setDoc(doc(db, 'users', user.uid), {
        town:       editForm.town,
        skillLevel: editForm.skillLevel,
      }, { merge: true })
      setProfile(p => ({ ...p, ...editForm }))
      setEditing(false)
    } catch (e) {
      console.error('Save error:', e)
    }
    setSaving(false)
  }

  const S = {
    page:   { backgroundColor: '#0d0f14', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', color: '#dde1f0' },
    nav:    { backgroundColor: '#1a1d2e', borderBottom: '1px solid #2a2f4a', padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap:   { maxWidth: '700px', margin: '0 auto', padding: '32px 20px' },
    card:   { backgroundColor: '#1a1d2e', border: '1px solid #2a2f4a', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
    input:  { width: '100%', backgroundColor: '#13151f', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
    select: { width: '100%', backgroundColor: '#13151f', border: '1px solid #2a2f4a', borderRadius: '6px', padding: '10px 14px', color: '#dde1f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
    btnP:   { backgroundColor: '#4a9eff', color: '#fff', fontWeight: 700, padding: '10px 22px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '14px' },
    btnS:   { backgroundColor: 'transparent', color: '#7a82a0', padding: '10px 22px', borderRadius: '7px', border: '1px solid #2a2f4a', cursor: 'pointer', fontSize: '14px' },
    btnD:   { backgroundColor: 'rgba(255,100,100,.08)', color: '#ff8080', padding: '10px 22px', borderRadius: '7px', border: '1px solid rgba(255,100,100,.2)', cursor: 'pointer', fontSize: '14px' },
    label:  { display: 'block', fontSize: '13px', fontWeight: 500, color: '#dde1f0', marginBottom: '6px' },
  }

  if (loading || !user) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#7a82a0' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
        <div>Loading your profile...</div>
      </div>
    </div>
  )

  const skillColors = {
    Spark: '#f0a500', Current: '#2dd4a0',
    Power: '#4a9eff', LabNotes: '#a78bfa'
  }

  return (
    <div style={S.page}>
      <style>{`
        select:focus, input:focus { border-color: #4a9eff !important; }
        @media(max-width:639px){ .desk-only { display: none !important; } }
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <a href="/" style={{ fontWeight: 800, fontSize: '15px', color: '#dde1f0', textDecoration: 'none' }}>
          <span style={{ color: '#4a9eff' }}>Assam</span> Innovates
        </a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/projects" className="desk-only" style={{ color: '#7a82a0', fontSize: '13px', textDecoration: 'none' }}>Projects</a>
          <a href="/forum"    className="desk-only" style={{ color: '#7a82a0', fontSize: '13px', textDecoration: 'none' }}>Forum</a>
          <button onClick={logout} style={{ ...S.btnS, padding: '6px 14px', fontSize: '12px' }}>Sign Out</button>
        </div>
      </nav>

      <div style={S.wrap}>

        {/* PROFILE HEADER */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#4a9eff,#2dd4a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover' }}/>
                : initials(user.displayName || profile?.name)
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{user.displayName || profile?.name || 'Maker'}</div>
              <div style={{ fontSize: '13px', color: '#7a82a0' }}>{user.email}</div>
              {profile?.town && <div style={{ fontSize: '13px', color: '#7a82a0', marginTop: '2px' }}>📍 {profile.town}, Assam</div>}
            </div>
            {profile?.skillLevel && (
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '5px 14px', borderRadius: '99px', backgroundColor: `${skillColors[profile.skillLevel] || '#4a9eff'}18`, color: skillColors[profile.skillLevel] || '#4a9eff', flexShrink: 0 }}>
                {profile.skillLevel}
              </span>
            )}
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', backgroundColor: '#2a2f4a', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              ['Projects',    profile?.projectCount || 0],
              ['Avg Rating',  profile?.avgRating ? profile.avgRating.toFixed(1) : '—'],
              ['Joined',      profile?.createdAt ? new Date(profile.createdAt.toDate?.() || Date.now()).getFullYear() : '2026'],
            ].map(([label, val]) => (
              <div key={label} style={{ backgroundColor: '#13151f', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#4a9eff' }}>{val}</div>
                <div style={{ fontSize: '11px', color: '#7a82a0', marginTop: '3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT PROFILE */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>Profile details</div>
            {!editing && <button onClick={() => setEditing(true)} style={S.btnS}>Edit</button>}
          </div>

          {!editing ? (
            <div>
              {[['Town', profile?.town || 'Not set yet'], ['Skill level', profile?.skillLevel || 'Not set yet']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2a2f4a', fontSize: '14px' }}>
                  <span style={{ color: '#7a82a0' }}>{k}</span>
                  <span style={{ color: v.includes('Not') ? '#4a5070' : '#dde1f0' }}>{v}</span>
                </div>
              ))}
              {(!profile?.town || !profile?.skillLevel) && (
                <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'rgba(74,158,255,.06)', border: '1px solid rgba(74,158,255,.15)', borderRadius: '6px', fontSize: '13px', color: '#7a82a0' }}>
                  Complete your profile by adding your town and skill level →
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={S.label}>Your town in Assam</label>
                <select style={S.select} value={editForm.town} onChange={e => setEditForm(p => ({ ...p, town: e.target.value }))}>
                  <option value="">Select town...</option>
                  {assamTowns.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Skill level</label>
                <select style={S.select} value={editForm.skillLevel} onChange={e => setEditForm(p => ({ ...p, skillLevel: e.target.value }))}>
                  <option value="">Select level...</option>
                  <option value="Spark">⚡ Spark — Just starting out</option>
                  <option value="Current">🔬 Current — Student / hobbyist</option>
                  <option value="Power">⚙️ Power — Professional / expert</option>
                  <option value="LabNotes">🧪 Lab Notes — Researcher / academic</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={saveProfile} disabled={saving} style={{ ...S.btnP, opacity: saving ? .6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button onClick={() => setEditing(false)} style={S.btnS}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* QUICK LINKS */}
        <div style={S.card}>
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '14px' }}>Quick links</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href="/projects" style={{ ...S.btnP, textDecoration: 'none', display: 'inline-block' }}>Browse Projects</a>
            <a href="/forum"    style={{ ...S.btnS, textDecoration: 'none', display: 'inline-block' }}>Go to Forum</a>
          </div>
        </div>

        {/* SIGN OUT */}
        <div style={{ ...S.card, border: '1px solid rgba(255,100,100,.15)' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px', color: '#ff8080' }}>Sign out</div>
          <p style={{ fontSize: '13px', color: '#7a82a0', marginBottom: '14px' }}>You can log back in any time with your email and password or Google.</p>
          <button onClick={logout} style={S.btnD}>Sign Out</button>
        </div>

      </div>
    </div>
  )
}