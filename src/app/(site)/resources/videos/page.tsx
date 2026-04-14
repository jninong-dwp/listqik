import type { Metadata } from "next";
import { Container } from "@/components/container";
import { videos } from "@/data/resources";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Watch Texas real estate strategy and compliance videos from ListQik.com.",
  alternates: {
    canonical: "/resources/videos",
  },
};

export default function VideosPage() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              RESOURCES · VIDEOS
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Local insider clips (embed-ready).
            </h1>
            <p className="text-base text-muted">
              Watch short videos on pricing strategy, compliance topics, and listing workflow best practices.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((v) => (
              <div key={v.slug} className="glass-surface overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="chip">{v.topic.toUpperCase()}</span>
                    <span className="text-xs font-mono text-white/50">{v.slug}</span>
                  </div>
                  <div className="mt-3 text-lg font-semibold text-white">{v.title}</div>
                </div>
                <div className="aspect-video w-full bg-black/30">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

