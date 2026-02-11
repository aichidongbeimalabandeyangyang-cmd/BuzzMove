"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PAGE_SIZE = 30;

export default function CasesPage() {
  const [emailFilter, setEmailFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [lightbox, setLightbox] = useState<{ type: "image" | "video"; url: string } | null>(null);

  const { data, isLoading, error } = trpc.admin.getCases.useQuery({
    email: emailFilter || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const handleSearch = () => {
    setEmailFilter(searchInput);
    setPage(0);
  };

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#EF4444" }}>Access Denied</span>
          <span style={{ fontSize: 14, color: "#6B6B70" }}>{error.message}</span>
        </div>
      </div>
    );
  }

  const cases = data?.cases ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex w-full flex-1 flex-col" style={{ padding: 20, gap: 20, maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: 12 }}>
          <Link href="/admin" className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#6B6B70" }} strokeWidth={1.5} />
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#FAFAF9" }}>Cases</h1>
          <span style={{ fontSize: 13, color: "#6B6B70" }}>{total} total</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex" style={{ gap: 8 }}>
        <div className="flex flex-1 items-center" style={{ height: 40, borderRadius: 10, backgroundColor: "#16161A", border: "1px solid #252530", padding: "0 12px", gap: 8 }}>
          <Search style={{ width: 16, height: 16, color: "#6B6B70", flexShrink: 0 }} strokeWidth={1.5} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Filter by email..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 13, color: "#FAFAF9" }}
          />
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center justify-center transition-all active:scale-[0.97]"
          style={{ height: 40, borderRadius: 10, padding: "0 16px", backgroundColor: "#E8A838" }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0B0B0E" }}>Search</span>
        </button>
        {emailFilter && (
          <button
            onClick={() => { setEmailFilter(""); setSearchInput(""); setPage(0); }}
            className="flex items-center justify-center transition-all active:scale-[0.97]"
            style={{ height: 40, borderRadius: 10, padding: "0 16px", border: "1px solid #252530" }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "#6B6B70" }}>Clear</span>
          </button>
        )}
      </div>

      {/* Cases Grid */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            <div className="relative" style={{ width: 32, height: 32 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #252530" }} />
              <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#E8A838" }} />
            </div>
            <span style={{ fontSize: 13, color: "#6B6B70" }}>Loading...</span>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <span style={{ fontSize: 14, color: "#6B6B70" }}>No cases found</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 12 }}>
            {cases.map((c) => (
              <div key={c.id} className="flex flex-col" style={{ borderRadius: 14, backgroundColor: "#16161A", overflow: "hidden" }}>
                {/* Media: input image + output video side by side */}
                <div className="flex" style={{ height: 180 }}>
                  {c.inputImage ? (
                    <button onClick={() => setLightbox({ type: "image", url: c.inputImage! })} className="flex-1 relative overflow-hidden cursor-pointer" style={{ borderRight: "1px solid #1E1E22" }}>
                      <img src={c.inputImage} alt="Input" className="w-full h-full object-cover" />
                      <div className="absolute" style={{ bottom: 4, left: 4, borderRadius: 4, backgroundColor: "#00000080", padding: "1px 6px" }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: "#FFFFFF" }}>INPUT</span>
                      </div>
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#0B0B0E" }}>
                      <span style={{ fontSize: 11, color: "#4A4A50" }}>No image</span>
                    </div>
                  )}
                  {c.outputVideo ? (
                    <button onClick={() => setLightbox({ type: "video", url: c.outputVideo! })} className="flex-1 relative overflow-hidden cursor-pointer">
                      <video src={c.outputVideo} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      <div className="absolute" style={{ bottom: 4, left: 4, borderRadius: 4, backgroundColor: "#00000080", padding: "1px 6px" }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: "#FFFFFF" }}>OUTPUT</span>
                      </div>
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#0B0B0E" }}>
                      <span style={{ fontSize: 11, color: c.status === "failed" ? "#EF4444" : "#4A4A50" }}>
                        {c.status === "failed" ? "Failed" : c.status === "completed" ? "No video" : "Processing..."}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col" style={{ padding: "10px 12px", gap: 4 }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#FAFAF9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
                      {c.email}
                    </span>
                    <div className="flex items-center" style={{ gap: 6 }}>
                      {c.downloadedAt && (
                        <span className="flex items-center" style={{ gap: 2, fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "1px 6px", color: "#3B82F6", backgroundColor: "#3B82F615" }} title={`Downloaded ${new Date(c.downloadedAt).toLocaleString()}`}>
                          <Download style={{ width: 10, height: 10 }} strokeWidth={2} />
                        </span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "1px 6px",
                        color: c.status === "completed" ? "#22C55E" : c.status === "failed" ? "#EF4444" : "#E8A838",
                        backgroundColor: c.status === "completed" ? "#22C55E15" : c.status === "failed" ? "#EF444415" : "#E8A83815",
                      }}>
                        {c.status}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#6B6B70" }}>
                        {c.mode} · {c.duration}s
                      </span>
                    </div>
                  </div>
                  {c.prompt && (
                    <p style={{ fontSize: 11, color: "#6B6B70", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.prompt}
                    </p>
                  )}
                  <span style={{ fontSize: 10, color: "#4A4A50" }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center" style={{ gap: 12 }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center justify-center disabled:opacity-30"
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}
              >
                <ChevronLeft style={{ width: 16, height: 16, color: "#FAFAF9" }} strokeWidth={1.5} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6B6B70" }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center justify-center disabled:opacity-30"
                style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#16161A" }}
              >
                <ChevronRight style={{ width: 16, height: 16, color: "#FAFAF9" }} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </>
      )}
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "#000000E6" }}
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute flex items-center justify-center"
            style={{ top: 16, right: 16, width: 40, height: 40, borderRadius: 10, backgroundColor: "#16161A" }}
          >
            <X style={{ width: 20, height: 20, color: "#FAFAF9" }} strokeWidth={1.5} />
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh" }}>
            {lightbox.type === "image" ? (
              <img src={lightbox.url} alt="Preview" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12 }} />
            ) : (
              <video src={lightbox.url} controls autoPlay loop playsInline style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
