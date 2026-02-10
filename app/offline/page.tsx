"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        className="flex items-center justify-center"
        style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #E8A838, #F0C060)" }}
      >
        <span style={{ fontSize: 32, color: "#0B0B0E" }}>⚡</span>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FAFAF9" }}>You're offline</h1>
      <p style={{ fontSize: 15, color: "#6B6B70", maxWidth: 320 }}>
        BuzzMove needs an internet connection to generate videos. Please check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4"
        style={{
          height: 44, paddingInline: 24, borderRadius: 12,
          background: "linear-gradient(135deg, #F0C060, #E8A838)",
          fontSize: 15, fontWeight: 700, color: "#0B0B0E",
        }}
      >
        Retry
      </button>
    </div>
  );
}
