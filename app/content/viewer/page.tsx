"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { FolderState, FileItem } from "@/types";

const VIEWABLE_TYPES = new Set(["image", "video", "audio"]);

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
      if (e.key === "ArrowRight" && currentIndex < files.length - 1) {
        e.preventDefault();
        setCurrentIndex((i) => i + 1);
        setIsPlaying(false);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex((i) => i - 1);
        setIsPlaying(false);
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
  }, [currentIndex, files.length, currentFile, togglePlayPause]);

  const navigateLeft = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsPlaying(false);
    }
  }, [currentIndex]);

  const navigateRight = useCallback(() => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPlaying(false);
    }
  }, [currentIndex, files.length]);

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
            className="w-full h-full object-contain"
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
              playsInline
              crossOrigin="anonymous"
            />

            {/* NBN watermark for W-folder videos */}
            {folderId?.match(/^\d+W/) && (
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <img
                  src="/markers/nbn/NBN_blacktext_transparentbackground.png"
                  alt=""
                  className="w-20 h-20"
                  draggable={false}
                />
              </div>
            )}

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
      </div>

      {/* Left navigation zone */}
      {folderId !== "7P3-lift" && currentIndex > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[60px] h-[200px] flex items-center justify-center group cursor-pointer"
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
      {folderId !== "7P3-lift" && currentIndex < files.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-[60px] h-[200px] flex items-center justify-center group cursor-pointer"
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

      {/* File counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-mono text-white/20">
        {currentIndex + 1} / {files.length}
      </div>
    </div>
  );
}
