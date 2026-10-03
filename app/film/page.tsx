import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHead } from "@/components/film/ui";
import { FilmGallery } from "@/components/film/FilmGallery";

export const metadata: Metadata = {
  title: "Film",
  description: "Photos from my roll: places, people, hackathons and everything in between.",
};

export default function FilmPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />
      <div className="pt-20">
        <PageHead kicker="everything I shot" title="film">
          A few frames to start. There are more where these came from.
        </PageHead>
        <FilmGallery />
      </div>
      <Footer />
    </main>
  );
}
