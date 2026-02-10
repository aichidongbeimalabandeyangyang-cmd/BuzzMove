"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp } from "@/components/layout/app-shell";

export function LandingGenerator() {
  const { user, openLogin } = useApp();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (user) {
      // Already logged in — go to homepage with prompt
      const params = prompt.trim() ? `?prompt=${encodeURIComponent(prompt.trim())}` : "";
      window.location.href = `/${params}`;
    } else {
      // Not logged in — open login, redirect to homepage with prompt after
      const params = prompt.trim() ? `?prompt=${encodeURIComponent(prompt.trim())}` : "";
      openLogin(`/${params}`);
    }
  };

  return (
    <div style={{ marginBottom: 64 }}>
      <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 8, color: "#FAFAF9" }}>
        Try It Now
      </h2>
      <p style={{ textAlign: "center", fontSize: 15, color: "#6B6B70", marginBottom: 28 }}>
        Write a prompt and generate your first AI video.
      </p>

      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          borderRadius: 20,
          backgroundColor: "#16161A",
          padding: 20,
        }}
      >
        {/* Demo image preview */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4/3",
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 16,
            backgroundColor: "#0B0B0E",
          }}
        >
          <Image
            src="/examples/showcase-default.png"
            alt="Example photo"
            fill
            style={{ objectFit: "cover" }}
            sizes="520px"
          />
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 500,
              color: "#FFFFFFCC",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            Example photo · You'll upload yours after sign up
          </div>
        </div>

        {/* Prompt input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the motion you want... e.g. &quot;Smile and wave, then blow a kiss&quot;"
          rows={3}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1.5px solid #252530",
            backgroundColor: "transparent",
            padding: "12px 14px",
            fontSize: 15,
            color: "#FAFAF9",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        />

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          style={{
            width: "100%",
            height: 50,
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #F0C060, #E8A838)",
            boxShadow: "0 4px 20px #E8A83840",
            fontSize: 16,
            fontWeight: 700,
            color: "#0B0B0E",
            cursor: "pointer",
          }}
        >
          Generate Video — Free
        </button>
      </div>
    </div>
  );
}
