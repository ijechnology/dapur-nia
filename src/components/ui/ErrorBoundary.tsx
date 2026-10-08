import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-card rounded-2xl border border-destructive/30 text-center my-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {this.props.fallbackTitle || 'Terjadi Kendala Memuat Data'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            {this.state.error?.message || 'Data tidak dapat ditampilkan dengan benar.'}
          </p>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Coba Muat Ulang
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
