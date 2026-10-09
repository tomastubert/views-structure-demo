import EmptyState from 'app/components/EmptyState/EmptyState'
import { reportToMonitoring } from 'app/utils/reportToMonitoring'
import useStore from 'app/zustand/useStore'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportToMonitoring(error, { componentStack: info.componentStack })
    useStore.getState().addFlash({ type: 'negative', message: 'Something went wrong.' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          title="Something went wrong"
          actionLabel="Reload"
          onAction={() => window.location.reload()}
        />
      )
    }
    return this.props.children
  }
}
