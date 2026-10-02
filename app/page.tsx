import { Navbar } from "@/components/layout/Navbar";
import { FilmHome } from "@/components/film/FilmHome";
import SignatureIntro from "@/components/ui/SignatureIntro";

export default function Home() {
  return (
    <main>
      <SignatureIntro />
      <Navbar />
      <FilmHome />
    </main>
  );
}
