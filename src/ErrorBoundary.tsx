import { Component, ReactNode } from 'react'

type S = { hasError: boolean }
type P = { children: ReactNode }

export class ErrorBoundary extends Component<P, S> {
  constructor(props: P) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e: any, info: any) { console.error('Runtime error:', e, info) }
  render() {
    if (this.state.hasError) return <div style={{padding:16}}>Something went wrong. Open the browser console for details.</div>
    return this.props.children
  }
}