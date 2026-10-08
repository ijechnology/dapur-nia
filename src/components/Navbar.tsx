import React from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut, LogIn, User } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
  onNavigateToAuth?: () => void
  onLogout?: () => void
}

export const Navbar: React.FC<Props> = ({ onNavigateToAuth, onLogout }) => {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    if (onLogout) {
      onLogout()
    }
  }

  // Label peran yang bersih tanpa emoji norak
  const getRoleLabel = () => {
    if (!user) return ''
    if (user.role === 'pemilik') return 'Pemilik'
    if (user.role === 'staf') return 'Staf Katering'
    return 'Pelanggan'
  }

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-2xs">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand Dapur Nia - Kontras Tajam & Profesional */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            DN
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-foreground leading-none truncate">
              Dapur Nia
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium leading-tight mt-0.5 truncate">
              Katering Harian Rumahan
            </p>
          </div>
        </div>

        {/* User Info / Auth Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Nama Pengguna & Peran Bersih */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs border border-border"
                title={`Masuk sebagai: ${user.displayName || user.email} (${getRoleLabel()})`}
              >
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground truncate max-w-[130px] text-[11px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal border-l border-border pl-1.5 hidden sm:inline">
                  {getRoleLabel()}
                </span>
              </div>

              {/* Tombol Keluar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 font-semibold cursor-pointer rounded-lg"
                title="Keluar dari sesi"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px]">Keluar</span>
              </Button>
            </div>
          ) : (
            <div>
              {onNavigateToAuth && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onNavigateToAuth}
                  className="h-8 px-3 text-xs gap-1.5 font-bold cursor-pointer rounded-lg shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
