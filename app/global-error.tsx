"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: this fires when the root layout itself throws, so it
 * replaces `app/layout.tsx` and must ship its own <html>/<body>.
 *
 * That also means globals.css and the Geist font loaders never ran here —
 * Tailwind classes would render as unstyled markup, so the few styles this
 * page needs are inline. ponytail: keep it that way; the point of this file is
 * that it renders when nothing else does.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#f6f7f9",
          color: "#1a2b4a",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#c8a020",
            }}
          >
            AI Patent Register
          </p>
          <h1 style={{ margin: "1.25rem 0 0", fontSize: "2rem", letterSpacing: "-0.02em" }}>
            Something went badly wrong.
          </h1>
          <p style={{ margin: "0.75rem 0 0", fontSize: "15px", lineHeight: 1.6, color: "#64748b" }}>
            The site failed to load. Nothing you&apos;ve registered has been lost. Please try again
            in a moment.
          </p>
          {error.digest && (
            <p
              style={{
                margin: "1rem 0 0",
                fontSize: "11px",
                fontFamily: "ui-monospace, monospace",
                color: "#64748b",
                overflowWrap: "anywhere",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.7rem 1.4rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#1a2b4a",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
