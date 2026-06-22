"use client";

import { useRef, useState } from "react";
import { InView } from "@/components/motion/in-view";

const VIDEO_SRC = "/ai-invention.mp4";

function VolumeOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 5 6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5Z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function VolumeOn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !muted;
    setMuted((m) => !m);
  };

  return (
    <section id="how" className="scroll-mt-24 section-tint border-y border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10 lg:px-16">
        <InView>
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-navy-800 to-navy-900 p-1.5 ring-1 ring-ink/20 shadow-[0_50px_110px_-45px_rgba(13,22,38,0.85)]">
            <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-navy-900">
              {VIDEO_SRC && (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  src={VIDEO_SRC}
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                />
              )}
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-cream/80 ring-1 ring-white/10 backdrop-blur-md transition-colors duration-200 hover:bg-black/60 hover:text-cream"
              >
                {muted ? (
                  <VolumeOff className="h-4 w-4" />
                ) : (
                  <VolumeOn className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </InView>
      </div>
    </section>
  );
}
