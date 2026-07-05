"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] items-center justify-center rounded-md border border-red-200 bg-red-50 p-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-red-800">
                Something went wrong
              </p>
              <p className="mt-1 text-xs text-red-600">
                {this.state.error?.message ?? "Unexpected error"}
              </p>
              <button
                className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
                onClick={() => this.setState({ hasError: false, error: null })}
                type="button"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
