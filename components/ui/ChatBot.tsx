"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE_EMAIL } from "@/lib/site";

type Tone = "friend" | "curious" | null;
interface Msg { role: "user" | "bot"; text: string }

/* ─── Content ──────────────────────────────────────── */
const friendQs = [
  {
    q: "what's ur deal? 👀",
    a: "omg okay so — i'm My, a data science girlie at UF from Vietnam 🇻🇳. i'm super into product, strategy, and building things that actually matter. basically i love figuring out what problems are worth solving and then actually solving them lol. also i won a Deloitte challenge once which was kinda cool ngl",
  },
  {
    q: "what r u actually good at? 💅",
    a: "making sense of chaos honestly. give me a messy problem and i'll come back with a structured breakdown, a data model, and a slide deck 😌. technically: python, figma, sql, react. strategically: market research, product thinking, consulting frameworks. also i make a great deck lol",
  },
  {
    q: "what are u building rn? 🔨",
    a: "okay so — my latest is transPEAKtation, an event-aware routing app my team built at ShellHacks 2026 (we won 2nd for Best Use of AWS + Best Use of Tiger Data 🏆). i did the data pipeline + backend, basically turning messy SF traffic and event data into something the router could use. before that, CartCoach — an AI chrome extension that pops up when you're about to impulse buy and shows you the real cost (like 'this delays your savings goal by 3 weeks' 💀). also doing product strategy work for a startup called Lattéra! oh and i just did a WNBA strategy simulator with monte carlo analysis for fun lol yes i'm that person",
  },
  {
    q: "what do u do for fun? 🎹",
    a: "piano is my thing — i've done solo performances. also tennis, swimming, golf 🏊. i was in a glee club in high school which is very not serious. also i have a tiny sustainable fashion startup called C-Shirt — eco tees made from coffee waste ☕ because apparently i can't just have one thing going on",
  },
  {
    q: "how do i reach u? 📬",
    a: `email me!! ${SITE_EMAIL} — i'm pretty responsive. or find me on LinkedIn at linkedin.com/in/mypham237. if you're a recruiter who wants to talk product or consulting i will literally reply immediately lmao`,
  },
];

const curiousQs = [
  {
    q: "Tell me about your background",
    a: "I'm My Pham — a Data Science student at the University of Florida (Class of 2028, GPA 3.83) originally from Hanoi, Vietnam. I've interned at Deloitte in Risk Advisory, worked in Technology Consulting, and conducted research at UF across two labs. My work sits at the intersection of data, product strategy, and execution.",
  },
  {
    q: "What are you working toward?",
    a: "I'm drawn to roles where I can work across ambiguity — product management, strategy consulting, or analytical roles where the challenge is figuring out what to build or decide, not just how to execute. I'm especially interested in opportunities where technology, data, and business thinking intersect to solve meaningful problems.",
  },
  {
    q: "What projects stand out?",
    a: "A few highlights: transPEAKtation, my most recent, won 2nd Place for Best Use of AWS and Best Use of Tiger Data at ShellHacks 2026 — event-aware routing where I built the data pipeline (17,000+ road incident records) and backend integration. GatorBot won the Deloitte Innovation Challenge — an AI chatbot that cut campus referral time by ~70%. The WNBA Strategy Simulator used Monte Carlo simulation to project $56M–$79M season profit ranges. Kite is a pediatric health platform capturing 1,000+ interaction data points per session. I've also done a TikTok UX redesign and an algorithmic fairness auditing tool called BiasLens.",
  },
  {
    q: "What's your technical stack?",
    a: "Python (pandas, scikit-learn, PyTorch), R, JavaScript/TypeScript, React, Node.js. On the product and analytics side: Figma, Tableau, Amplitude, Mixpanel, Jira, Notion. Databases: PostgreSQL, MongoDB. I'm comfortable spanning the full pipeline from raw data to user-facing product.",
  },
  {
    q: "Are you open to opportunities?",
    a: `Yes — actively looking for summer 2026 internships in product management, consulting, and data/analytics. I'm especially interested in roles where strategy, data, and product decision-making overlap. Feel free to reach out at ${SITE_EMAIL} or on LinkedIn.`,
  },
];

/* ─── Helpers ──────────────────────────────────────── */
function BotAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-display"
      style={{ background: "linear-gradient(135deg, #F4D35E, #92BDDB)" }}
    >
      M
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isBot = msg.role === "bot";
  return (
    <motion.div
      className={`flex gap-2 ${isBot ? "items-start" : "items-start flex-row-reverse"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      {isBot && <BotAvatar />}
      <div
        className={`max-w-[80%] font-body text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl ${
          isBot
            ? "bg-navy text-white/85 rounded-tl-sm"
            : "bg-accent text-white rounded-tr-sm"
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

/* ─── Main ChatBot ─────────────────────────────────── */
export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<Tone>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const questions = tone === "friend" ? friendQs : curiousQs;

  function pickTone(t: Tone) {
    setTone(t);
    setMsgs([
      {
        role: "bot",
        text:
          t === "friend"
            ? "hey!! 👋 what do you wanna know? pick a question or just type something"
            : "Hello! I'm happy to tell you more about My Pham. What would you like to know?",
      },
    ]);
  }

  function askQuestion(q: string, a: string) {
    setMsgs((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "bot", text: a },
    ]);
  }

  function handleInput(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");

    // Simple keyword matching
    const lower = text.toLowerCase();
    const all = tone === "friend" ? friendQs : curiousQs;
    const match = all.find((item) =>
      item.q.toLowerCase().split(" ").some((w) => w.length > 3 && lower.includes(w))
    );

    setMsgs((prev) => [
      ...prev,
      { role: "user", text },
      {
        role: "bot",
        text: match
          ? match.a
          : tone === "friend"
          ? "hmm not sure about that one! try one of the question buttons or email me directly at phamlehamy2307@gmail.com 😊"
          : "I don't have a specific answer for that. You're welcome to reach out directly at phamlehamy2307@gmail.com for more details.",
      },
    ]);
  }

  function reset() {
    setTone(null);
    setMsgs([]);
    setInput("");
  }

  return (
    <>
      {/* Floating button — hidden while the biography journey's story modal is open (see
          journey-story-modal-open in globals.css), so it never overlaps that modal's content */}
      <div className="journey-chatbot-widget fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setOpen((o) => !o)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-accent/30"
          style={{ background: "linear-gradient(135deg, #F4D35E, #92BDDB)" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                ✕
              </motion.span>
            ) : (
              <motion.span key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }} className="text-xl">
                💬
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-accent/30 pointer-events-none" />
        )}
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="journey-chatbot-widget fixed bottom-24 right-6 z-50 w-[340px] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 flex flex-col"
            style={{ background: "#32312C" }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
              style={{ background: "linear-gradient(135deg, #32312C, #32312C)" }}
            >
              <BotAvatar />
              <div className="flex-1">
                <p className="font-body text-sm text-white font-medium">Chat with My</p>
                <p className="font-mono text-[10px] text-white/40">Portfolio Assistant</p>
              </div>
              {tone && (
                <button
                  onClick={reset}
                  className="font-mono text-[10px] text-white/40 hover:text-white/70 transition-colors border border-white/10 px-2 py-1 rounded"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {!tone ? (
                /* Tone selector */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex gap-2 items-start">
                    <BotAvatar />
                    <div className="bg-navy text-white/85 text-sm font-body px-3.5 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed">
                      hey! 👋 i&apos;m My&apos;s portfolio assistant. how do you want to vibe?
                    </div>
                  </div>

                  <button
                    onClick={() => pickTone("friend")}
                    className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-accent/50 hover:bg-accent/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🫂</span>
                      <div>
                        <p className="font-body text-sm text-white font-medium group-hover:text-accent transition-colors">
                          Talk like a friend
                        </p>
                        <p className="font-mono text-[11px] text-white/40 mt-0.5">
                          casual, fun, no cap
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => pickTone("curious")}
                    className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-accent/50 hover:bg-accent/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔍</span>
                      <div>
                        <p className="font-body text-sm text-white font-medium group-hover:text-accent transition-colors">
                          I&apos;m curious about My
                        </p>
                        <p className="font-mono text-[11px] text-white/40 mt-0.5">
                          professional, informative
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ) : (
                /* Conversation */
                <>
                  {msgs.map((m, i) => (
                    <Bubble key={i} msg={m} />
                  ))}

                  {/* Suggested questions */}
                  <div className="space-y-1.5 pt-2">
                    {questions.map((item) => (
                      <button
                        key={item.q}
                        onClick={() => askQuestion(item.q, item.a)}
                        className="w-full text-left font-body text-xs text-white/60 px-3 py-2 rounded-lg border border-white/10 hover:border-accent/40 hover:text-white/85 hover:bg-accent/5 transition-all"
                      >
                        {item.q}
                      </button>
                    ))}
                  </div>
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input */}
            {tone && (
              <form
                onSubmit={handleInput}
                className="flex gap-2 px-3 py-3 border-t border-white/10"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tone === "friend" ? "type anything..." : "Ask something..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 font-body text-sm text-white placeholder-white/30 outline-none focus:border-accent/50 transition-colors"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs hover:bg-accent/80 transition-colors flex-shrink-0"
                >
                  ↑
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
