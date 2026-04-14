import { Component } from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 32,
          fontFamily: "'Inter', sans-serif",
          background: "#060e20",
          color: "#dee5ff",
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(124,58,237,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            fontSize: 28,
          }}>
            !
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px", textAlign: "center" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#a3aac4", fontSize: 16, margin: "0 0 32px", textAlign: "center", maxWidth: 400 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
