"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, Layout, Code, Play, RefreshCw, Wand2, Sparkles, Monitor, Smartphone, Tablet, 
  ChevronLeft, ChevronRight, Copy, History, Trash2, Maximize2, Globe, ArrowRight,
  MessageSquare, User, Zap, Download, FileCode, Check, Code2, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast, { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import Editor from "@monaco-editor/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const SUGGESTIONS = [
  { label: "AI SaaS Dashboard", prompt: "Futuristic AI SaaS dashboard with glassmorphism and real-time charts" },
  { label: "Crypto Landing Page", prompt: "Vibrant crypto landing page with 3D elements and dark mode" },
  { label: "Apple Style Portfolio", prompt: "Minimalist Apple-inspired portfolio with smooth scroll" },
  { label: "Stripe Style Homepage", prompt: "Stripe-style SaaS homepage with elegant gradients" },
];

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [projectID, setProjectID] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "prompt">("preview");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [history, setHistory] = useState<{prompt: string, code: string, timestamp: number}[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("gen_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedProjectID = localStorage.getItem("readdy_project_id");
    if (savedProjectID) setProjectID(savedProjectID);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveToHistory = (newEntry: {prompt: string, code: string}) => {
    const updated = [{ ...newEntry, timestamp: Date.now() }, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("gen_history", JSON.stringify(updated));
  };

  const cleanCode = (code: string) => {
    return code
      .replace(/```(html|jsx|javascript|tsx|react)?/g, "")
      .replace(/```/g, "")
      .trim();
  };

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt) return;
    
    const userMsg: ChatMessage = { role: "user", content: finalPrompt, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    
    setIsGenerating(true);
    setGeneratedCode(""); 
    
    try {
      const response = await fetch("/api/readdy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, projectID }),
      });

      if (!response.ok) throw new Error("Failed to connect to Readdy API");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullCode = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.content || data.html || data.code || (typeof data === 'string' ? data : "");
                if (content) {
                  fullCode += content;
                  setGeneratedCode(cleanCode(fullCode));
                }
                if (data.projectID) {
                  setProjectID(data.projectID);
                  localStorage.setItem("readdy_project_id", data.projectID);
                }
              } catch (e) {}
            }
          }
        }
      }

      const aiMsg: ChatMessage = { role: "ai", content: "Successfully generated your React component!", timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      saveToHistory({ prompt: finalPrompt, code: cleanCode(fullCode) });
      toast.success("Ready for launch!");
    } catch (error) {
      console.error(error);
      toast.error("Generation failed.");
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Step 4: Full Next.js Project Export
  const handleFullExport = async () => {
    if (!generatedCode) return;
    
    const zip = new JSZip();
    toast.loading("Preparing project zip...", { id: "export" });

    // Add component
    zip.file("components/GeneratedWebsite.tsx", `
"use client";
import React from 'react';
// Assuming common lucide-react imports or similar based on generation
export ${generatedCode.includes("export") ? "" : "default"} ${generatedCode}
    `.trim());

    // Add app/page.tsx
    zip.file("app/page.tsx", `
import GeneratedWebsite from '@/components/GeneratedWebsite';

export default function Home() {
  return (
    <main>
      <GeneratedWebsite />
    </main>
  );
}
    `.trim());

    // Add tailwind config
    zip.file("tailwind.config.ts", `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
    `.trim());

    // Add package.json
    zip.file("package.json", JSON.stringify({
      name: "ai-generated-project",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        "next": "latest",
        "react": "latest",
        "react-dom": "latest",
        "lucide-react": "latest",
        "clsx": "latest",
        "tailwind-merge": "latest"
      },
      devDependencies: {
        "typescript": "latest",
        "@types/node": "latest",
        "@types/react": "latest",
        "@types/react-dom": "latest",
        "tailwindcss": "latest",
        "postcss": "latest",
        "autoprefixer": "latest"
      }
    }, null, 2));

    zip.file("README.md", "# AI Generated Next.js Project\n\nRun `npm install` and `npm run dev` to start.");

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `ai-builder-project-${projectID?.slice(0, 5) || 'new'}.zip`);
    toast.success("Full project exported!", { id: "export" });
  };

  const getIframeSrcDoc = () => {
    if (!generatedCode) return "";
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${generatedCode.replace(/export default/g, "").replace(/export /g, "")}
            try {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<GeneratedWebsite />);
            } catch (e) {
              console.error(e);
            }
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="flex h-screen flex-col bg-[#050505] text-zinc-100 font-sans selection:bg-orange-500/30 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800/50 px-4 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight leading-none uppercase">AI SaaS Builder Pro</h1>
            <span className="text-[9px] text-zinc-500 font-mono mt-1">ENGINE: READDY_V2_STREAM</span>
          </div>
        </div>

        {generatedCode && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
              {["preview", "code", "prompt"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-bold transition-all capitalize tracking-wider",
                    activeTab === t ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
              <button onClick={() => setDevice("desktop")} className={cn("p-1.5 rounded-md", device === "desktop" ? "text-orange-400 bg-zinc-800" : "text-zinc-500")}>
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setDevice("mobile")} className={cn("p-1.5 rounded-md", device === "mobile" ? "text-orange-400 bg-zinc-800" : "text-zinc-500")}>
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
           <button 
             onClick={handleFullExport}
             disabled={!generatedCode}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-[10px] font-bold hover:bg-orange-500 transition-all disabled:opacity-50 shadow-lg shadow-orange-600/20"
           >
              <Package className="h-3.5 w-3.5" /> DOWNLOAD FULL PROJECT
           </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Chat Sidebar */}
        <motion.div 
          animate={{ width: isSidebarOpen ? "360px" : "0px", opacity: isSidebarOpen ? 1 : 0 }}
          className="flex flex-col border-r border-zinc-800/50 bg-[#080808] z-30"
        >
          <div className="flex flex-col h-full min-w-[360px]">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-orange-600/5 border border-orange-500/20">
                    <h2 className="text-sm font-bold flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      Welcome, Engineer.
                    </h2>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">I can build entire React components from your description. Try one of the prompts below to start.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => handleGenerate(s.prompt)}
                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-orange-500/40 hover:bg-zinc-900 transition-all text-left"
                      >
                        <span className="text-[11px] text-zinc-400">{s.label}</span>
                        <ArrowRight className="h-3 w-3 text-zinc-700" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[90%] rounded-2xl p-3.5 text-xs",
                    msg.role === "user" ? "bg-zinc-900 border border-zinc-800 self-end ml-auto" : "bg-orange-600/10 border border-orange-500/20 self-start"
                  )}>
                    <p className={cn("leading-relaxed", msg.role === "user" ? "text-zinc-400" : "text-zinc-100")}>
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/50">
              <div className="relative flex flex-col gap-2 rounded-xl bg-zinc-900 border border-zinc-800 p-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                  placeholder="Ask for changes or start new..."
                  className="min-h-[50px] w-full resize-none bg-transparent p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none text-[11px]"
                />
                <div className="flex justify-between items-center p-2 pt-0">
                   <div className="flex items-center gap-1.5 opacity-50">
                      <div className={cn("h-1.5 w-1.5 rounded-full", projectID ? "bg-orange-500" : "bg-zinc-700")}></div>
                      <span className="text-[9px] font-mono">{projectID?.slice(0,8) || "NEW_SESSION"}</span>
                   </div>
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !prompt}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-orange-600 text-white disabled:opacity-50"
                  >
                    {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preview / Code Editor */}
        <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
          <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              {isGenerating && !generatedCode ? (
                <motion.div key="loading" className="h-full w-full max-w-5xl mx-auto flex flex-col gap-6">
                   <div className="flex items-center gap-4">
                      <div className="h-8 w-8 border-2 border-t-orange-500 border-zinc-800 rounded-full animate-spin"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Synthesizing React Project...</span>
                   </div>
                   <SkeletonTheme baseColor="#0a0a0a" highlightColor="#121212">
                      <Skeleton height={400} borderRadius={16} />
                   </SkeletonTheme>
                </motion.div>
              ) : !generatedCode ? (
                <motion.div key="empty" className="h-full w-full flex flex-col items-center justify-center gap-6 relative">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent"></div>
                   <Zap className="h-16 w-16 text-zinc-900 relative animate-pulse" />
                   <h2 className="text-xl font-bold tracking-tight text-zinc-600 uppercase tracking-[0.2em]">Ready to Build</h2>
                </motion.div>
              ) : (
                <motion.div key="content" className="h-full w-full flex flex-col gap-4">
                  {activeTab === "preview" ? (
                    <div className={cn(
                      "mx-auto flex flex-col bg-[#0d0d0d] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-500",
                      device === "desktop" ? "w-full h-full" : "w-[375px] h-[90%]"
                    )}>
                      <div className="h-9 flex items-center justify-between px-4 bg-[#121212] border-b border-zinc-800/80">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500/50"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50"></div>
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono">localhost:3000</div>
                        <div className="w-10"></div>
                      </div>
                      <div className="flex-1 relative bg-white">
                        <iframe srcDoc={getIframeSrcDoc()} className="h-full w-full border-none" />
                        {isGenerating && (
                          <div className="absolute bottom-4 right-4 bg-black px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-bold flex items-center gap-2">
                             <RefreshCw className="h-3 w-3 animate-spin text-orange-500" /> STREAMING_JSX
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeTab === "code" ? (
                    <div className="flex-1 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl bg-[#1e1e1e]">
                       <Editor
                         height="100%"
                         defaultLanguage="typescript"
                         theme="vs-dark"
                         value={generatedCode}
                         options={{
                           fontSize: 12,
                           minimap: { enabled: false },
                           padding: { top: 20 },
                           readOnly: true,
                           scrollBeyondLastLine: false,
                         }}
                       />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-zinc-900/10 rounded-3xl border border-zinc-800/50">
                       <MessageSquare className="h-10 w-10 text-orange-500/20 mb-4" />
                       <p className="text-zinc-500 italic max-w-lg text-sm">"{messages[messages.length-1]?.content}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
