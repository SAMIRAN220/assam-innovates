'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const AuthContext = createContext({ user: null, loading: true, logout: () => {} })
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const logout = async () => {
    await signOut(auth)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}