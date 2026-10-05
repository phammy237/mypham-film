"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
    a: "a few things at once lol. Career OS — a personal operating system for internship recruiting so job searching isn't 40 tabs + hoping i remember where i applied (transparent job ranking, tracking, resume workflows, a browser extension). a case-interview learning game where you work through a case and get scored on your reasoning. transPEAKtation, which we're still building after ShellHacks (search history, community events, map + UX polish). this website, which is meant to feel like portfolio but with lore. and i'm the sole PM at an early-stage fashion + personal style stealth startup 👗",
  },
  {
    q: "what do u do for fun? 🎹",
    a: "travelling, taking pictures and making vlogs — my friends always say that about me 📸✈️ also piano (i've done solo performances), tennis, swimming, golf 🏊. i was in a glee club in high school which is very not serious. also i have a tiny sustainable fashion startup called C-Shirt — eco tees made from coffee waste ☕ because apparently i can't just have one thing going on",
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
    a: `Yes — I'm open to opportunities in product management, consulting, and data/analytics, especially roles where strategy, data, and product decision-making overlap. Feel free to reach out at ${SITE_EMAIL} or on LinkedIn.`,
  },
];


/* ─── Free-text answers ────────────────────────────────
   Typed questions are scored against these topics: every keyword that matches a word in the message
   (as a word prefix, or a phrase) adds a point, the best score wins. Facts are the same ones used by the
   question buttons above and the CV page. */
interface Topic { keys: string[]; friend: string; curious: string }
const topics: Topic[] = [
  {
    keys: ["who", "background", "yourself", "deal", "bio", "introduce", "from", "vietnam", "hanoi", "where", "home", "school", "uf", "florida", "gpa", "university", "major", "study", "student", "class", "college", "education", "deloitte", "research", "experience"],
    friend: friendQs[0].a,
    curious: curiousQs[0].a,
  },
  {
    keys: ["goal", "goals", "future", "career", "role", "roles", "toward", "dream", "product management", "consulting", "strategy", "pm"],
    friend: "i want to work on messy, ambiguous stuff — product management, strategy consulting, or analytical roles where the hard part is figuring out what to build or decide, not just how. basically where tech, data, and business thinking overlap 🎯",
    curious: curiousQs[1].a,
  },
  {
    keys: ["favorite", "favourite", "fave", "best", "proudest", "proud", "top"],
    friend: "hard to pick just one, but if i had to point to one it's transPEAKtation 🏆 — an event-aware routing app that won 2nd place for Best Use of AWS + Best Use of Tiger Data at ShellHacks 2026. i built the data pipeline + backend. tap '→ best project' below to see it",
    curious: "The project I'd point to is transPEAKtation, which won 2nd Place for Best Use of AWS and Best Use of Tiger Data at ShellHacks 2026. I built the data pipeline and backend integration. The '→ best project' shortcut below opens its page.",
  },
  {
    keys: ["first", "earliest", "oldest", "started", "beginning", "begin"],
    friend: "one of my earlier ones was the Artificial Reef Web App (Nov 2024) — a full-stack app visualizing 3D reef models for ecological data, built with a 5-person team. i designed the MongoDB schema + indexing 🪸 it taught me a lot about backend thinking",
    curious: "One of my earliest projects was the Artificial Reef Web App (Nov 2024), a full-stack platform visualizing 3D reef models to improve ecological data access. I designed the MongoDB schema and indexing as part of a 5-person team.",
  },
  {
    keys: ["project", "projects", "build", "built", "building", "portfolio", "made", "app", "latest", "recent", "standout", "highlight"],
    friend: friendQs[2].a,
    curious: curiousQs[2].a,
  },
  {
    keys: ["transpeaktation", "shellhacks", "hackathon", "aws", "tiger", "routing", "traffic"],
    friend: "transPEAKtation is my latest — an event-aware routing app my team built at ShellHacks 2026 (2nd place for Best Use of AWS + Best Use of Tiger Data 🏆). i built the data pipeline + backend: 17,000+ road incident records turned into something the router could actually use",
    curious: "transPEAKtation won 2nd Place for Best Use of AWS and Best Use of Tiger Data at ShellHacks 2026. It's event-aware routing; I built the data pipeline (17,000+ road incident records) and the backend integration.",
  },
  {
    keys: ["gatorbot", "innovation", "referral", "challenge", "chatbot"],
    friend: "GatorBot won the Deloitte Innovation Challenge!! it's an AI chatbot that cut campus referral time by ~70% 🐊",
    curious: "GatorBot won the Deloitte Innovation Challenge — an AI chatbot that cut campus referral time by about 70%.",
  },
  {
    keys: ["wnba", "monte", "simulator", "simulation", "basketball", "profit"],
    friend: "the WNBA strategy simulator was a for-fun one — monte carlo analysis projecting $56M–$79M season profit ranges. yes i'm that person lol 🏀",
    curious: "The WNBA Strategy Simulator used Monte Carlo simulation to project $56M–$79M season profit ranges.",
  },
  {
    keys: ["cartcoach", "impulse", "extension", "chrome", "shopping", "savings"],
    friend: "CartCoach is an AI chrome extension that pops up when you're about to impulse buy and shows the real cost — like 'this delays your savings goal by 3 weeks' 💀",
    curious: "CartCoach is an AI Chrome extension that appears when you're about to make an impulse purchase and shows its real cost, for example how much it delays a savings goal.",
  },
  {
    keys: ["kite", "pediatric", "health"],
    friend: "Kite is a pediatric health platform i worked on — it captures 1,000+ interaction data points per session 🩺",
    curious: "Kite is a pediatric health platform capturing 1,000+ interaction data points per session.",
  },
  {
    keys: ["cshirt", "c-shirt", "coffee", "fashion", "sustainable", "tees", "startup", "lattera", "lattéra"],
    friend: "C-Shirt is my tiny sustainable fashion startup — eco tees made from coffee waste ☕. i'm also doing product strategy work for a startup called Lattéra!",
    curious: "Alongside school I run C-Shirt, a small sustainable fashion startup making eco tees from coffee waste, and I do product strategy work for a startup called Lattéra.",
  },
  {
    keys: ["skill", "skills", "tech", "stack", "python", "sql", "react", "figma", "tools", "code", "coding", "language", "languages", "good", "strengths", "tableau"],
    friend: friendQs[1].a,
    curious: curiousQs[3].a,
  },
  {
    keys: ["travel", "traveling", "travelling", "trip", "trips", "photo", "photos", "photography", "pictures", "picture", "camera", "vlog", "vlogs", "vlogging", "film", "cities", "city", "cafe", "cafes"],
    friend: "i love travelling, taking pictures and making vlogs — my friends say that about me all the time lol 📸 i'm more of a wander-around-a-city-with-no-plan, cafe-hopping, museum-and-architecture person than a tourist-checklist one. my camera roll is basically a scrapbook. the /film page has some of my photos ✈️",
    curious: "I enjoy travelling, photography and making vlogs. I like exploring cities on foot, visiting cafes, museums and interesting architecture, and collecting photos of the places and everyday moments. Some of my photos are on the /film page.",
  },
  {
    keys: ["swamphacks", "adobe", "grace", "hopper", "ghc", "california", "upcoming", "next", "soon", "events", "meet"],
    friend: "coming up: i'm doing SwampHacks and an Adobe hackathon, and i'll be in California for Grace Hopper 2026 ✨ if you're gonna be around and wanna meet up, email me or use the Connect page!",
    curious: "Coming up, I'm participating in SwampHacks and an Adobe hackathon, and I'll be in California for Grace Hopper Celebration 2026. If you'd like to meet up, feel free to reach out through the Connect page or by email.",
  },
  {
    keys: ["matcha", "cat", "cats", "spicy", "music", "playlist", "playlists", "rain", "notebook", "notebooks"],
    friend: "okay lore time: matcha latte is my official drink 🍵, i'm a cat person (had two cats), i cannot handle spicy food, and i make very oddly specific playlists. also rainy days + cute notebooks + a cafe = peak happiness",
    curious: "A few personal details: I love matcha lattes, I'm a cat person and previously had two cats, I make mood-based playlists, and I can't handle spicy food very well.",
  },
  {
    keys: ["fun", "hobby", "hobbies", "piano", "tennis", "swim", "swimming", "golf", "glee", "free time", "outside"],
    friend: friendQs[3].a,
    curious: "Outside of work I love travelling, photography and making vlogs. I also play piano (I've done solo performances), and I enjoy tennis, swimming and golf. I was in a glee club in high school.",
  },
  {
    keys: ["contact", "email", "mail", "reach", "linkedin", "message", "talk", "connect", "touch", "number", "phone"],
    friend: friendQs[4].a,
    curious: `You can reach me at ${SITE_EMAIL} or on LinkedIn at linkedin.com/in/mypham237. The Connect page also has a contact form.`,
  },
  {
    keys: ["hire", "hiring", "intern", "internship", "internships", "opportunities", "job", "jobs", "available", "availability", "recruit", "recruiter", "open"],
    friend: `yes!! i'm open to opportunities — product, consulting, or data/analytics. email me at ${SITE_EMAIL} or hit me up on LinkedIn 📬`,
    curious: curiousQs[4].a,
  },
  {
    keys: ["resume", "cv", "curriculum"],
    friend: "my resume lives on the CV page — tap '→ resume' below and it'll take you there 📄",
    curious: "My full resume is on the CV page — use the '→ resume' shortcut below to open it.",
  },
];

const GREETING = /^(hi|hey|hello|yo|sup|hiya|howdy)\b/;
const THANKS = /\b(thanks|thank you|thx|ty)\b/;

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9À-ỹ\s-]/g, " ").split(/\s+/).filter(Boolean);
}

/** best topic for a typed message (or null) */
function findTopic(text: string): Topic | null {
  const lower = text.toLowerCase();
  const words = tokenize(text);
  let best: Topic | null = null;
  let bestScore = 0;
  for (const t of topics) {
    let score = 0;
    for (const k of t.keys) {
      if (k.includes(" ") ? lower.includes(k) : words.some((w) => w === k || (k.length >= 4 && w.startsWith(k)))) score++;
    }
    // on a tie the narrower topic (fewer keywords, e.g. one project) beats the broad one
    if (score > bestScore || (score > 0 && score === bestScore && best && t.keys.length < best.keys.length)) { best = t; bestScore = score; }
  }
  return best;
}

/* ─── Helpers ──────────────────────────────────────── */
function BotAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[#20201E] text-xs font-display"
      style={{ background: "#F4D35E" }}
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
            : "bg-[#F4D35E] text-[#20201E] rounded-tr-sm"
        }`}
      >
        {msg.text || (
          <span className="inline-flex items-center gap-1 py-1" role="status" aria-label="Typing">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:300ms]" />
          </span>
        )}
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
  const [busy, setBusy] = useState(false);
  // suggested questions: shown at the start, hidden once a question is answered, shown again when the message box is clicked
  const [showQs, setShowQs] = useState(true);
  // set once the AI route reports it isn't configured, so later messages go straight to the built-in answers
  const aiOffRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const jump = (href: string) => { router.push(href); setOpen(false); };
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("open-chat", openChat);
    return () => window.removeEventListener("open-chat", openChat);
  }, []);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  // focus the message box as soon as a conversation starts (or the panel reopens mid-conversation)
  useEffect(() => {
    if (open && tone) inputRef.current?.focus();
  }, [open, tone]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, showQs]);

  const questions = tone === "friend" ? friendQs : curiousQs;

  function pickTone(t: Tone) {
    setTone(t);
    setShowQs(true);
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
    setShowQs(false);
    setMsgs((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "bot", text: a },
    ]);
  }

  /** the built-in (keyword/topic) answer, used whenever the AI is unavailable */
  function localReply(text: string): string {
    const lower = text.toLowerCase().trim();
    const friend = tone === "friend";
    const topic = findTopic(text);
    if (GREETING.test(lower) && !topic) {
      return friend ? "heyy 👋 ask me anything — pick a question below or just type" : "Hello! Feel free to pick a question below or type your own.";
    }
    if (THANKS.test(lower) && !topic) {
      return friend ? "anytime!! 💛" : "You're welcome! Let me know if there's anything else you'd like to know.";
    }
    if (topic) return friend ? topic.friend : topic.curious;
    return friend
      ? `hmm not sure about that one! try one of the question buttons, or email me directly at ${SITE_EMAIL} 😊`
      : `I don't have a specific answer for that. Try one of the suggested questions, or reach out directly at ${SITE_EMAIL}.`;
  }

  const dropPlaceholder = () => setMsgs((prev) => (prev[prev.length - 1]?.text === "" ? prev.slice(0, -1) : prev));

  /** streams a reply from /api/chat into a new bot bubble; "off" means use the built-in answer instead */
  async function askAI(text: string, prior: Msg[]): Promise<"ok" | "limited" | "off"> {
    const payload = [...prior, { role: "user" as const, text }]
      .map((m) => ({ role: m.role === "bot" ? ("assistant" as const) : ("user" as const), content: m.text.slice(0, 590) }))
      .slice(-10);
    while (payload.length && payload[0].role !== "user") payload.shift();

    setMsgs((prev) => [...prev, { role: "bot", text: "" }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let acc = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload, tone }),
        signal: ctrl.signal,
      });
      if (res.status === 429) {
        const msg = (await res.json().catch(() => null))?.error as string | undefined;
        setMsgs((prev) => [...prev.slice(0, -1), { role: "bot", text: `${msg ?? "Too many messages right now."} You can also email ${SITE_EMAIL}.` }]);
        return "limited";
      }
      if (!res.ok || !res.body) {
        // only a permanent "not configured" answer switches the AI off for the session; a 404/500/503 during a
        // recompile or a Redis blip must not lock the tab onto the canned answers
        if (res.status === 503 && (await res.json().catch(() => null))?.error === "Chat is not configured.") aiOffRef.current = true;
        dropPlaceholder();
        return "off";
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const shown = acc;
        setMsgs((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: shown } : m)));
      }
      acc += decoder.decode();
      if (!acc.trim()) {
        dropPlaceholder();
        return "off";
      }
      return "ok";
    } catch {
      // keep whatever streamed before a mid-reply failure; otherwise fall back to the built-in answer
      if (acc.trim()) return "ok";
      dropPlaceholder();
      return "off";
    } finally {
      abortRef.current = null;
    }
  }

  async function handleInput(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setShowQs(false);
    const prior = msgs;
    setMsgs((prev) => [...prev, { role: "user", text }]);

    if (!aiOffRef.current) {
      setBusy(true);
      const result = await askAI(text, prior);
      setBusy(false);
      if (result !== "off") return;
    }
    setMsgs((prev) => [...prev, { role: "bot", text: localReply(text) }]);
  }

  function reset() {
    abortRef.current?.abort();
    setBusy(false);
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
          aria-label={open ? "Close chat" : "Open chat"}
          aria-expanded={open}
          className="w-14 h-14 rounded-full flex items-center justify-center text-[#20201E] shadow-xl shadow-black/30 ring-1 ring-[#20201E]/20"
          style={{ background: "#F4D35E" }}
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
          <span className="absolute inset-0 rounded-full animate-ping bg-[#F4D35E]/40 pointer-events-none" />
        )}
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="journey-chatbot-widget fixed bottom-24 right-6 z-50 w-[340px] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 flex flex-col"
            style={{ background: "#20201E" }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
              style={{ background: "#2A2A27" }}
            >
              <BotAvatar />
              <div className="flex-1">
                <p className="font-type text-sm text-white font-bold">Chat with My</p>
                <p className="font-mono text-[10px] text-white/40">AI Portfolio Assistant</p>
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
                      hey! 👋 i&apos;m My&apos;s portfolio assistant (an AI). how do you want to vibe?
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

                  {/* Jump straight to a page */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {([["best project", "/projects/transpeaktation"], ["all work", "/projects"], ["leadership", "/involvements"], ["resume", "/cv"], ["say hi", "/connect"]] as const).map(([label, href]) => (
                      <button key={label} type="button" onClick={() => jump(href)} className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15 text-[#F4D35E] hover:bg-[#F4D35E] hover:text-[#20201E] transition-colors">
                        → {label}
                      </button>
                    ))}
                  </div>
                  {/* Suggested questions: only before a question is asked / when the message box is clicked */}
                  <AnimatePresence initial={false}>
                    {showQs && (
                      <motion.div
                        key="suggestions"
                        className="space-y-1.5 pt-2"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {questions.map((item) => (
                          <button
                            key={item.q}
                            onClick={() => askQuestion(item.q, item.a)}
                            className="w-full text-left font-body text-xs text-white/60 px-3 py-2 rounded-lg border border-white/10 hover:border-accent/40 hover:text-white/85 hover:bg-accent/5 transition-all"
                          >
                            {item.q}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                  ref={inputRef}
                  aria-label="Message"
                  maxLength={500}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setShowQs(e.target.value === ""); }}
                  onFocus={() => !input && setShowQs(true)}
                  onClick={() => !input && setShowQs(true)}
                  placeholder={tone === "friend" ? "type anything..." : "Ask something..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 font-body text-sm text-white placeholder-white/30 outline-none focus:border-accent/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-8 h-8 disabled:opacity-50 rounded-full bg-[#F4D35E] flex items-center justify-center text-[#20201E] text-xs hover:bg-[#F4D35E]/80 transition-colors flex-shrink-0"
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
