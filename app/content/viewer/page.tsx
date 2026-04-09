"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { FolderState, FileItem } from "@/types";

const VIEWABLE_TYPES = new Set(["image", "video", "pdf", "audio"]);

export default function ViewerPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black" />}>
      <ViewerInner />
    </Suspense>
  );
}

function ViewerInner() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder");
  const startIndex = parseInt(searchParams.get("index") || "0", 10);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playIconTimeout = useRef<NodeJS.Timeout | null>(null);

  // PDF state
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const pdfDocRef = useRef<any>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfPathRef = useRef<string>("");
  const pdfjsLibRef = useRef<any>(null);

  // Load pdf.js from CDN (avoids webpack bundling issues)
  useEffect(() => {
    if (pdfjsLibRef.current) return;
    if ((window as any).pdfjsLib) {
      pdfjsLibRef.current = (window as any).pdfjsLib;
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
        pdfjsLibRef.current = lib;
      }
    };
    document.head.appendChild(script);
  }, []);

  // Load folder contents
  useEffect(() => {
    if (!folderId) return;
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data: FolderState) => {
        const folder = data.folders.find((f) => f.id === folderId);
        if (!folder) return;
        const viewable = folder.contents
          .filter((f) => VIEWABLE_TYPES.has(f.type))
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true }),
          );
        setFiles(viewable);
      });
  }, [folderId]);

  const currentFile = files[currentIndex];

  // Load PDF document when current file is a PDF
  useEffect(() => {
    if (currentFile?.type !== "pdf") {
      pdfDocRef.current = null;
      pdfPathRef.current = "";
      setPdfPage(1);
      setPdfTotalPages(0);
      return;
    }

    // Don't reload if same PDF
    if (pdfPathRef.current === currentFile.path && pdfDocRef.current) return;

    let cancelled = false;
    const loadPdf = async () => {
      // Wait for CDN script to load
      while (!pdfjsLibRef.current) {
        await new Promise((r) => setTimeout(r, 100));
        if (cancelled) return;
      }
      try {
        const doc = await pdfjsLibRef.current.getDocument(currentFile.path)
          .promise;
        if (cancelled) return;
        pdfDocRef.current = doc;
        pdfPathRef.current = currentFile.path;
        setPdfTotalPages(doc.numPages);
        setPdfPage(1);
      } catch (err) {
        console.error("PDF load failed:", err);
      }
    };
    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [currentFile]);

  // Render current PDF page to canvas
  useEffect(() => {
    if (!pdfDocRef.current || !pdfCanvasRef.current || pdfPage < 1) return;

    let cancelled = false;
    (async () => {
      const page = await pdfDocRef.current.getPage(pdfPage);
      if (cancelled || !pdfCanvasRef.current) return;
      const canvas = pdfCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const viewport = page.getViewport({ scale: 1 });
      const scale =
        Math.min(
          window.innerWidth / viewport.width,
          window.innerHeight / viewport.height,
        ) * (window.devicePixelRatio || 1);
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.width = `${scaledViewport.width / (window.devicePixelRatio || 1)}px`;
      canvas.style.height = `${scaledViewport.height / (window.devicePixelRatio || 1)}px`;

      await page.render({ canvasContext: ctx, viewport: scaledViewport })
        .promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfPage, pdfTotalPages]);

  const togglePlayPause = useCallback(() => {
    const el = videoRef.current || audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
    setShowPlayIcon(true);
    if (playIconTimeout.current) clearTimeout(playIconTimeout.current);
    playIconTimeout.current = setTimeout(() => setShowPlayIcon(false), 600);
  }, []);

  // Arrow key and spacebar navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentFile?.type === "pdf" && pdfPage < pdfTotalPages) {
          setPdfPage((p) => p + 1);
        } else if (currentIndex < files.length - 1) {
          setCurrentIndex((i) => i + 1);
          setIsPlaying(false);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentFile?.type === "pdf" && pdfPage > 1) {
          setPdfPage((p) => p - 1);
        } else if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
          setIsPlaying(false);
        }
      } else if (
        e.key === " " &&
        (currentFile?.type === "video" || currentFile?.type === "audio")
      ) {
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [
    currentIndex,
    files.length,
    currentFile,
    togglePlayPause,
    pdfPage,
    pdfTotalPages,
  ]);

  const navigateLeft = useCallback(() => {
    if (currentFile?.type === "pdf" && pdfPage > 1) {
      setPdfPage((p) => p - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsPlaying(false);
    }
  }, [currentIndex, currentFile, pdfPage]);

  const navigateRight = useCallback(() => {
    if (currentFile?.type === "pdf" && pdfPage < pdfTotalPages) {
      setPdfPage((p) => p + 1);
    } else if (currentIndex < files.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPlaying(false);
    }
  }, [currentIndex, files.length, currentFile, pdfPage, pdfTotalPages]);

  const canGoLeft =
    currentIndex > 0 || (currentFile?.type === "pdf" && pdfPage > 1);
  const canGoRight =
    currentIndex < files.length - 1 ||
    (currentFile?.type === "pdf" && pdfPage < pdfTotalPages);

  if (!folderId || files.length === 0) {
    return <div className="h-screen w-screen bg-black" />;
  }

  if (!currentFile) {
    return <div className="h-screen w-screen bg-black" />;
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden select-none">
      {/* Media display */}
      <div className="w-full h-full flex items-center justify-center">
        {currentFile.type === "image" && (
          <img
            key={currentFile.id}
            src={encodeURI(currentFile.path)}
            alt={currentFile.name}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        )}

        {currentFile.type === "video" && (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              key={currentFile.id}
              ref={videoRef}
              src={currentFile.path}
              className="max-w-full max-h-full object-contain"
              controls
              loop
              playsInline
              crossOrigin="anonymous"
            />

            {/* Play/pause flash icon */}
            {showPlayIcon && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center animate-fade-out">
                  {isPlaying ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="6,4 20,12 6,20" />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentFile.type === "audio" && (
          <div className="flex items-center justify-center">
            <audio
              key={currentFile.id}
              ref={audioRef}
              src={currentFile.path}
              className="w-full max-w-2xl"
              controls
            />
          </div>
        )}

        {currentFile.type === "pdf" && (
          <canvas
            key={currentFile.id}
            ref={pdfCanvasRef}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Left navigation zone */}
      {canGoLeft && (
        <button
          className="absolute left-0 top-0 w-[15%] h-full flex items-center justify-start pl-6 group cursor-pointer"
          onClick={navigateLeft}
        >
          <svg
            width="20"
            height="32"
            viewBox="0 0 20 32"
            className="text-white/0 group-hover:text-white/30 transition-colors"
          >
            <polyline
              points="16,4 4,16 16,28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      )}

      {/* Right navigation zone */}
      {canGoRight && (
        <button
          className="absolute right-0 top-0 w-[15%] h-full flex items-center justify-end pr-6 group cursor-pointer"
          onClick={navigateRight}
        >
          <svg
            width="20"
            height="32"
            viewBox="0 0 20 32"
            className="text-white/0 group-hover:text-white/30 transition-colors"
          >
            <polyline
              points="4,4 16,16 4,28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      )}

      {/* File/page counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-mono text-white/20">
        {currentFile.type === "pdf"
          ? `${pdfPage} / ${pdfTotalPages}`
          : `${currentIndex + 1} / ${files.length}`}
      </div>
    </div>
  );
}
