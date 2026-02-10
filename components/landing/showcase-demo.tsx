import Image from "next/image";

interface ShowcaseDemoProps {
  title?: string;
  subtitle?: string;
}

export function ShowcaseDemo({
  title = "See It in Action",
  subtitle = "One photo. One prompt. A stunning AI video with motion and audio.",
}: ShowcaseDemoProps) {
  return (
    <div style={{ marginBottom: 64 }}>
      <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 8, color: "#FAFAF9" }}>
        {title}
      </h2>
      <p style={{ textAlign: "center", fontSize: 15, color: "#6B6B70", marginBottom: 28 }}>
        {subtitle}
      </p>

      <div className="grid grid-cols-2" style={{ gap: 16, maxWidth: 720, margin: "0 auto" }}>
        {/* Before: static image */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", backgroundColor: "#16161A" }}>
          <div style={{ position: "relative", aspectRatio: "3/4" }}>
            <Image
              src="/examples/showcase-default.png"
              alt="Original photo"
              fill
              style={{ objectFit: "cover" }}
              sizes="360px"
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 600,
              color: "#FAFAF9",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            Photo
          </div>
        </div>

        {/* After: auto-playing video */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", backgroundColor: "#16161A" }}>
          <video
            src="/examples/showcase-default.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 600,
              color: "#0B0B0E",
              background: "linear-gradient(135deg, #F0C060, #E8A838)",
            }}
          >
            AI Video
          </div>
        </div>
      </div>

      {/* Prompt label */}
      <div
        style={{
          maxWidth: 720,
          margin: "16px auto 0 auto",
          borderRadius: 12,
          padding: "12px 16px",
          backgroundColor: "#16161A",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "#6B6B70" }}>Prompt: </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#E8A838" }}>
          &ldquo;Blowing a kiss, flirty expression, charming smile.&rdquo;
        </span>
      </div>
    </div>
  );
}
