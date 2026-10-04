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
    keys: ["fun", "hobby", "hobbies", "piano", "tennis", "swim", "swimming", "golf", "music", "glee", "free time", "outside"],
    friend: friendQs[3].a,
    curious: "Outside of work I play piano (I've done solo performances), and I enjoy tennis, swimming and golf. I was also in a glee club in high school.",
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

    const lower = text.toLowerCase().trim();
    const friend = tone === "friend";
    const topic = findTopic(text);
    let reply: string;
    if (GREETING.test(lower) && !topic) {
      reply = friend ? "heyy 👋 ask me anything — pick a question below or just type" : "Hello! Feel free to pick a question below or type your own.";
    } else if (THANKS.test(lower) && !topic) {
      reply = friend ? "anytime!! 💛" : "You're welcome! Let me know if there's anything else you'd like to know.";
    } else if (topic) {
      reply = friend ? topic.friend : topic.curious;
    } else {
      reply = friend
        ? `hmm not sure about that one! try one of the question buttons, or email me directly at ${SITE_EMAIL} 😊`
        : `I don't have a specific answer for that. Try one of the suggested questions, or reach out directly at ${SITE_EMAIL}.`;
    }

    setMsgs((prev) => [...prev, { role: "user", text }, { role: "bot", text: reply }]);
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

                  {/* Jump straight to a page */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {([["best project", "/projects/transpeaktation"], ["all work", "/projects"], ["leadership", "/involvements"], ["resume", "/cv"], ["say hi", "/connect"]] as const).map(([label, href]) => (
                      <button key={label} type="button" onClick={() => jump(href)} className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15 text-[#F4D35E] hover:bg-[#F4D35E] hover:text-[#20201E] transition-colors">
                        → {label}
                      </button>
                    ))}
                  </div>
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
                  ref={inputRef}
                  aria-label="Message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tone === "friend" ? "type anything..." : "Ask something..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 font-body text-sm text-white placeholder-white/30 outline-none focus:border-accent/50 transition-colors"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-[#F4D35E] flex items-center justify-center text-[#20201E] text-xs hover:bg-[#F4D35E]/80 transition-colors flex-shrink-0"
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
