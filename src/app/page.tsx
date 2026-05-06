"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, Sparkles, Code2, Download, Rocket, Shield, 
  ChevronRight, Github, Monitor, Globe, Smartphone, Play, 
  ArrowRight, CheckCircle2, Star, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-zinc-100 selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Readdy Pro</span>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Workflow</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/builder" 
              className="group relative flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-all hover:bg-zinc-200"
            >
              Start Building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"></div>
          
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-500">
                <Sparkles className="h-3 w-3" /> AI-Powered Frontend Engineering
              </span>
              
              <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
                Prompt to Production in <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Seconds</span>
              </h1>
              
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400">
                The world's most advanced AI website builder. Generate production-ready React + Tailwind components, 
                iterate in real-time with AI chat, and export full Next.js projects with one click.
              </p>

              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link 
                  href="/builder" 
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-8 text-lg font-bold text-white shadow-2xl shadow-orange-600/30 transition-all hover:bg-orange-500 hover:scale-105 sm:w-auto"
                >
                  Get Started Free
                </Link>
                <a 
                  href="https://github.com" 
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 text-lg font-bold transition-all hover:bg-white/10 sm:w-auto"
                >
                  <Github className="h-5 w-5" /> View on GitHub
                </a>
              </div>

              <div className="mt-16 flex items-center justify-center gap-8 opacity-40 grayscale filter">
                <div className="flex items-center gap-2"><Zap className="h-6 w-6" /> <span className="font-bold">FAST</span></div>
                <div className="flex items-center gap-2"><Code2 className="h-6 w-6" /> <span className="font-bold">REACT</span></div>
                <div className="flex items-center gap-2"><Globe className="h-6 w-6" /> <span className="font-bold">WEB</span></div>
                <div className="flex items-center gap-2"><Rocket className="h-6 w-6" /> <span className="font-bold">SAAS</span></div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mx-auto mt-24 max-w-6xl rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-4 shadow-[0_0_100px_-20px_rgba(249,115,22,0.2)]"
          >
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#0d0d0d] shadow-2xl">
               <div className="flex items-center justify-between border-b border-white/5 bg-[#121212] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-500/50"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500/50"></div>
                  </div>
                  <div className="rounded-full border border-white/5 bg-black/40 px-8 py-1 text-xs text-zinc-500 font-mono">
                    builder.readdy.pro/new
                  </div>
                  <div className="w-12"></div>
               </div>
               <div className="grid grid-cols-12 h-[600px]">
                  <div className="col-span-3 border-r border-white/5 p-6 bg-[#080808]">
                     <div className="h-4 w-24 rounded bg-white/5 mb-6"></div>
                     <div className="space-y-4">
                        <div className="h-10 w-full rounded-xl bg-white/5 border border-white/5 p-3 flex items-center gap-2">
                           <div className="h-4 w-4 rounded-full bg-orange-500/20"></div>
                           <div className="h-2 w-20 rounded bg-white/10"></div>
                        </div>
                        <div className="h-24 w-full rounded-xl bg-orange-600/5 border border-orange-500/20 p-4">
                           <div className="h-2 w-full rounded bg-white/10 mb-2"></div>
                           <div className="h-2 w-2/3 rounded bg-white/10"></div>
                        </div>
                     </div>
                  </div>
                  <div className="col-span-9 p-10 bg-white flex items-center justify-center">
                     <div className="text-center">
                        <div className="h-12 w-12 bg-orange-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                           <Zap className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="h-8 w-64 bg-zinc-900 rounded-lg mx-auto mb-4"></div>
                        <div className="h-4 w-96 bg-zinc-200 rounded-lg mx-auto mb-8"></div>
                        <div className="flex gap-4 justify-center">
                           <div className="h-10 w-32 bg-orange-600 rounded-xl"></div>
                           <div className="h-10 w-32 bg-zinc-900 rounded-xl"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

        {/* Features Grid */}
        <section id="features" className="px-4 py-32 sm:px-6 lg:px-8 bg-black/20">
           <div className="mx-auto max-w-7xl">
              <div className="text-center mb-20">
                 <h2 className="text-3xl font-bold sm:text-5xl">Engineered for Builders</h2>
                 <p className="mt-4 text-zinc-500">Everything you need to go from idea to a live product in minutes.</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-3">
                 {[
                   { title: "Iterative AI Chat", icon: <MessageSquare className="h-6 w-6" />, desc: "Don't just generate once. Talk to the AI to refine every detail of your UI." },
                   { title: "Production React", icon: <Code2 className="h-6 w-6" />, desc: "No more plain HTML. Get modular, production-ready React components." },
                   { title: "Next.js Projects", icon: <Package className="h-6 w-6" />, desc: "Export a full Next.js project structure with Tailwind, ready for deployment." },
                   { title: "Streaming Engine", icon: <Zap className="h-6 w-6" />, desc: "See your changes in real-time with our high-speed streaming AI engine." },
                   { title: "Mobile Responsive", icon: <Smartphone className="h-6 w-6" />, desc: "Every component is built with mobile-first responsiveness out of the box." },
                   { title: "IDE Integration", icon: <Monitor className="h-6 w-6" />, desc: "Edit your code in a professional-grade Monaco editor directly in browser." }
                 ].map((f, i) => (
                   <div key={i} className="group rounded-[2rem] border border-white/5 bg-zinc-900/30 p-8 hover:bg-zinc-900/50 transition-all">
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/10 text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                         {f.icon}
                      </div>
                      <h3 className="mb-3 text-xl font-bold">{f.title}</h3>
                      <p className="text-zinc-500 leading-relaxed">{f.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Call to Action */}
        <section className="px-4 py-32 sm:px-6 lg:px-8">
           <div className="mx-auto max-w-5xl rounded-[3rem] bg-gradient-to-br from-orange-600 to-red-700 p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-96 w-96 bg-white/10 rounded-full blur-[100px]"></div>
              <h2 className="text-4xl font-bold sm:text-6xl mb-6">Start Building Your Next Startup Today.</h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join 10,000+ builders using Readdy to ship faster than ever before.</p>
              <Link 
                href="/builder" 
                className="inline-flex h-16 items-center px-10 rounded-2xl bg-white text-black font-extrabold text-xl hover:scale-105 transition-all shadow-2xl"
              >
                Launch Builder <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
           </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
         <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-50">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-bold">Readdy AI v3.0</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-500">
               <a href="#" className="hover:text-white">Twitter</a>
               <a href="#" className="hover:text-white">GitHub</a>
               <a href="#" className="hover:text-white">Discord</a>
            </div>
            <p className="text-sm text-zinc-600">© 2026 Readdy Pro. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
