import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth } from '../lib/firebase'
import { AuthUser, UserRole } from '../types'
import { getUserProfile, saveUserProfile, getLocalProfileByEmail } from '../services/userService'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isStaffOrOwner: boolean
  isOwner: boolean
  signIn: (email: string, kataSandi: string) => Promise<AuthUser>
  signUp: (namaLengkap: string, email: string, kataSandi: string, noWhatsapp?: string, alamat?: string, peran?: UserRole) => Promise<AuthUser>
  loginAsDemo: (role: UserRole) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_ACTIVE_USER_KEY = 'dapur_nia_active_auth_user'

export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau kata sandi salah. Silakan periksa kembali.'
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan gunakan menu Masuk.'
    case 'auth/invalid-email':
      return 'Format email tidak valid.'
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah (minimal 6 karakter).'
    case 'auth/network-request-failed':
      return 'Koneksi jaringan terputus. Pastikan internet Anda aktif.'
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Mohon tunggu beberapa saat.'
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'Layanan Email/Password belum diaktifkan di Firebase Console. Buka Firebase Console > Authentication > Sign-in method, lalu aktifkan (Enable) Email/Password.'
    default:
      return 'Terjadi kesalahan autentikasi. Silakan coba lagi.'
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const auth = getFirebaseAuth()

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          let profile = await getUserProfile(fbUser.uid, fbUser.email, fbUser.displayName)
          if (!profile && fbUser.email) {
            profile = getLocalProfileByEmail(fbUser.email)
          }

          const assignedRole: UserRole = profile?.peran || (
            fbUser.email?.includes('pemilik') || fbUser.email?.includes('dina') ? 'pemilik' :
            fbUser.email?.includes('staf') || fbUser.email?.includes('rani') ? 'staf' : 'pelanggan'
          )

          const authUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: profile?.nama || (fbUser.displayName && !fbUser.displayName.includes('@') ? fbUser.displayName : null) || fbUser.email?.split('@')[0] || 'Pengguna',
            role: assignedRole,
            noWhatsapp: profile?.no_whatsapp || '',
            nomorWhatsapp: profile?.no_whatsapp || '',
            alamat: profile?.alamat || '',
          }
          setUser(authUser)
          localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(authUser))
        } else {
          try {
            const stored = localStorage.getItem(LOCAL_ACTIVE_USER_KEY)
            if (stored) {
              setUser(JSON.parse(stored))
            } else {
              setUser(null)
            }
          } catch {
            setUser(null)
          }
        }
        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      try {
        const stored = localStorage.getItem(LOCAL_ACTIVE_USER_KEY)
        if (stored) {
          setUser(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Gagal membaca local auth:', e)
      }
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, kataSandi: string): Promise<AuthUser> => {
    const auth = getFirebaseAuth()
    const cleanEmail = email.trim().toLowerCase()

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, kataSandi)
        try {
          await cred.user.reload()
        } catch {}

        let profile = await getUserProfile(cred.user.uid, cred.user.email, cred.user.displayName)
        if (!profile && cleanEmail) {
          profile = getLocalProfileByEmail(cleanEmail)
        }

        const assignedRole: UserRole = profile?.peran || (
          cleanEmail.includes('pemilik') || cleanEmail.includes('dina') ? 'pemilik' :
          cleanEmail.includes('staf') || cleanEmail.includes('rani') ? 'staf' : 'pelanggan'
        )

        const authUser: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: profile?.nama || (cred.user.displayName && !cred.user.displayName.includes('@') ? cred.user.displayName : null) || cleanEmail.split('@')[0],
          role: assignedRole,
          noWhatsapp: profile?.no_whatsapp || '',
          nomorWhatsapp: profile?.no_whatsapp || '',
          alamat: profile?.alamat || '',
        }
        setUser(authUser)
        localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(authUser))
        return authUser
      } catch (err: any) {
        // Jika staf / pemilik masuk namun belum terdaftar di Firebase Auth
        if (
          cleanEmail.includes('pemilik') ||
          cleanEmail.includes('staf') ||
          cleanEmail.includes('dina') ||
          cleanEmail.includes('rani')
        ) {
          if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
            try {
              const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, kataSandi)
              const role: UserRole = (cleanEmail.includes('pemilik') || cleanEmail.includes('dina')) ? 'pemilik' : 'staf'
              const nama = role === 'pemilik' ? 'Dina (Pemilik)' : 'Rani (Staf Dapur)'
              const wa = role === 'pemilik' ? '081234567890' : '082345678901'
              await saveUserProfile(newCred.user.uid, {
                email: cleanEmail,
                nama,
                peran: role,
                no_whatsapp: wa,
              })
              const authUser: AuthUser = {
                uid: newCred.user.uid,
                email: cleanEmail,
                displayName: nama,
                role,
                noWhatsapp: wa,
                nomorWhatsapp: wa,
              }
              setUser(authUser)
              localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(authUser))
              return authUser
            } catch (createErr) {
              // Jika create user juga gagal, gunakan fallback lokal di bawah
            }
          }
        }
        if (err?.code !== 'auth/configuration-not-found' && err?.code !== 'auth/operation-not-allowed') {
          throw err
        }
      }
    }

    // Fallback role detection
    const role: UserRole =
      cleanEmail.includes('pemilik') || cleanEmail.includes('dina') ? 'pemilik' :
      cleanEmail.includes('staf') || cleanEmail.includes('rani') ? 'staf' : 'pelanggan'
    const displayName = role === 'pemilik' ? 'Dina (Pemilik)' : role === 'staf' ? 'Rani (Staf Dapur)' : cleanEmail.split('@')[0]
    const defaultWA = role === 'pemilik' ? '081234567890' : role === 'staf' ? '082345678901' : '081234567890'

    const mockUser: AuthUser = {
      uid: 'user-' + Date.now(),
      email: cleanEmail,
      displayName,
      role,
      noWhatsapp: defaultWA,
      nomorWhatsapp: defaultWA,
    }
    localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
    return mockUser
  }

  const signUp = async (
    namaLengkap: string,
    email: string,
    kataSandi: string,
    noWhatsapp: string = '',
    alamat: string = '',
    peran: UserRole = 'pelanggan'
  ): Promise<AuthUser> => {
    const auth = getFirebaseAuth()
    const cleanEmail = email.trim().toLowerCase()
    const cleanNama = namaLengkap.trim()
    const cleanAlamat = alamat.trim()

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, kataSandi)
        if (cleanNama) {
          try {
            await updateProfile(cred.user, { displayName: cleanNama })
          } catch (e) {
            console.warn(e)
          }
        }

        await saveUserProfile(cred.user.uid, {
          email: cleanEmail,
          nama: cleanNama,
          peran,
          no_whatsapp: noWhatsapp,
          alamat: cleanAlamat,
        })

        const authUser: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cleanNama || cleanEmail.split('@')[0],
          role: peran,
          noWhatsapp,
          nomorWhatsapp: noWhatsapp,
          alamat: cleanAlamat,
        }
        setUser(authUser)
        localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(authUser))
        return authUser
      } catch (err: any) {
        if (err?.code !== 'auth/configuration-not-found' && err?.code !== 'auth/operation-not-allowed') {
          throw err
        }
      }
    }

    // Local fallback signup
    const uid = 'local-' + Date.now()
    await saveUserProfile(uid, {
      email: cleanEmail,
      nama: cleanNama,
      peran,
      no_whatsapp: noWhatsapp,
      alamat: cleanAlamat,
    })

    const mockUser: AuthUser = {
      uid,
      email: cleanEmail,
      displayName: cleanNama || cleanEmail.split('@')[0],
      role: peran,
      noWhatsapp,
      nomorWhatsapp: noWhatsapp,
      alamat: cleanAlamat,
    }
    localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
    return mockUser
  }

  const loginAsDemo = (role: UserRole) => {
    let demoUser: AuthUser
    if (role === 'pemilik') {
      demoUser = {
        uid: 'owner-dina',
        email: 'pemilik@dapurnia.com',
        displayName: 'Dina (Pemilik)',
        role: 'pemilik',
        noWhatsapp: '081234567890',
        nomorWhatsapp: '081234567890',
      }
    } else if (role === 'staf') {
      demoUser = {
        uid: 'staff-rani',
        email: 'staf@dapurnia.com',
        displayName: 'Rani (Staf Dapur)',
        role: 'staf',
        noWhatsapp: '082345678901',
        nomorWhatsapp: '082345678901',
      }
    } else {
      demoUser = {
        uid: 'customer-budi',
        email: 'budi@gmail.com',
        displayName: 'Budi Santoso',
        role: 'pelanggan',
        noWhatsapp: '081234567890',
        nomorWhatsapp: '081234567890',
        alamat: 'Jl. Merdeka No. 10',
      }
    }

    localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
  }

  const signOut = async (): Promise<void> => {
    const auth = getFirebaseAuth()
    if (auth) {
      try {
        await firebaseSignOut(auth)
      } catch (e) {
        console.warn('Firebase signout error:', e)
      }
    }
    localStorage.removeItem(LOCAL_ACTIVE_USER_KEY)
    setUser(null)
  }

  const isStaffOrOwner = user?.role === 'pemilik' || user?.role === 'staf'
  const isOwner = user?.role === 'pemilik'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isStaffOrOwner,
        isOwner,
        signIn,
        signUp,
        loginAsDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return context
}
