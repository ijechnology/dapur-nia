import { createContext, useContext, useState, ReactNode } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export interface AlertNotification {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface AlertContextType {
  showAlert: (title: string, description?: string, variant?: 'default' | 'destructive') => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([])

  const showAlert = (title: string, description?: string, variant: 'default' | 'destructive' = 'default') => {
    const id = Date.now().toString()
    setAlerts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    }, 4000)
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {/* Container floating alerts */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
        {alerts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
              item.variant === 'destructive'
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : 'bg-card/95 border-border text-card-foreground'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">
                {item.variant === 'destructive' ? (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-sm leading-none tracking-tight">{item.title}</h5>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}
