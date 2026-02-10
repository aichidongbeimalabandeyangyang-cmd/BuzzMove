"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center"
          style={{ padding: 40, textAlign: "center" }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF9", marginBottom: 8 }}>
            Something went wrong
          </p>
          <p style={{ fontSize: 14, color: "#6B6B70", marginBottom: 24 }}>
            An unexpected error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              height: 44,
              paddingInline: 24,
              borderRadius: 12,
              background: "linear-gradient(135deg, #F0C060, #E8A838)",
              fontSize: 15,
              fontWeight: 600,
              color: "#0B0B0E",
              border: "none",
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
