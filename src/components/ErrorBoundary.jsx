// ─────────────────────────────────────────────────────────────────
// ErrorBoundary — wraps every section
// If any section crashes, THIS shows instead of a blank screen.
// The rest of the app keeps running.
// ─────────────────────────────────────────────────────────────────
import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you could log to a service here
    console.error("Mindoo section error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-inner">
            <div className="error-icon">⚡</div>
            <h3 className="error-title">This section hit a snag</h3>
            <p className="error-desc">
              The rest of Mindoo is still running. Click below to reload this section.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reload section
            </button>
            {import.meta.env.DEV && (
              <pre className="error-detail">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
