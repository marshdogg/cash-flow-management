"use client";

import { Component, type ReactNode } from "react";
import { AlertBanner } from "./AlertBanner";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AlertBanner
          type="error"
          message={
            this.props.sectionName
              ? `Unable to load ${this.props.sectionName}`
              : "Something went wrong"
          }
          actionLabel="Retry"
          onAction={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
