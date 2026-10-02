import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Caveat, Courier_Prime, DM_Serif_Display, Instrument_Serif, Inter, JetBrains_Mono, Roboto } from "next/font/google";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";
import { PageTransitions } from "@/components/layout/PageTransitions";

const ChatBot = dynamic(() => import("@/components/ui/ChatBot").then((m) => m.ChatBot), { ssr: false });

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500"],
});

// film home: editorial serif headings, handwriting for a few words, typewriter for small labels
const instrument = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-instrument" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600"], variable: "--font-caveat" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier" });

export const metadata: Metadata = {
  title: "My Pham",
  description: "Data Science student at UF · Product Strategist · Builder. Formerly Deloitte Risk Advisory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} ${jetbrains.variable} ${roboto.variable} ${instrument.variable} ${caveat.variable} ${courier.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Set theme class before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-base dark:bg-navy text-surface dark:text-white font-body antialiased min-h-screen">
        <ThemeProvider>
          <CustomCursor />
          <PageTransitions />
          {children}
          <ChatBot />
        </ThemeProvider>
      </body>
    </html>
  );
}
