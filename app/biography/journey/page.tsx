import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GeographicJourney } from "@/components/biography/journey/GeographicJourney";

export default function BiographyJourneyPage() {
  return (
    <main className="min-h-screen bg-base dark:bg-navy">
      <Navbar />
      <GeographicJourney />
      <Footer />
    </main>
  );
}
