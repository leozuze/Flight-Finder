import { Component } from "react"

// Defensive backstop for PlacesMap specifically. Leaflet manipulates the
// DOM imperatively outside React's control, so a race during marker
// teardown (e.g. under StrictMode's double-invoke, or a burst of rapid
// re-renders) can throw during React's own commit phase. That kind of
// throw is NOT recoverable by fixing render logic alone — an error
// boundary is the correct tool regardless of whatever the underlying
// root cause turns out to be.
export default class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("[PlacesMap] crashed, showing fallback:", error, info)
  }

  componentDidUpdate(prevProps) {
    // If the places/center data changes after a crash, give the map
    // another chance rather than staying stuck on the fallback forever.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="w-full h-full rounded-2xl flex items-center justify-center text-sm text-center px-6"
          style={{ border: "1px solid var(--nuvex-border)", background: "#F6F5FC", color: "var(--nuvex-slate)" }}
        >
          Map couldn't load right now. Try adjusting your search — the results below still work.
        </div>
      )
    }
    return this.props.children
  }
}
