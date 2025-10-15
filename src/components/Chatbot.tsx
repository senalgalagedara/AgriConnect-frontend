"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle, X, ChevronDown, Circle, Loader2, Trash, Sparkles, CornerDownLeft } from "lucide-react";

type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  text: string;
  ts: number;
}

const STORAGE_KEY = "ac_chat_history_v1";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const SUGGESTIONS = [
  "How do I place an order?",
  "What are the delivery options?",
  "How do I pay for items?",
  "How can I track my order?",
  "How to contact support?",
];

export default function Chatbot() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null as any);

  // Seed a welcome message and restore history
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Message[];
        setMessages(parsed);
        return;
      } catch {}
    }
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          "Hi! I'm your AgriConnect Assistant. I can help you find products, add to cart, check out, track deliveries, and more. How can I help today?",
        ts: Date.now(),
      },
    ]);
  }, []);

  // Track viewport to decide whether to mount the Drawer (mobile) or desktop panel
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 639px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    };
    // Initialize
    setIsMobile(mql.matches);
    // Subscribe
    try {
      mql.addEventListener("change", onChange as any);
      return () => mql.removeEventListener("change", onChange as any);
    } catch {
      // Safari fallback
      // @ts-ignore
      mql.addListener(onChange);
      return () => {
        // @ts-ignore
        mql.removeListener(onChange);
      };
    }
  }, []);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
      setShowScrollBtn(false);
    } else {
      setShowScrollBtn(true);
    }
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const user: Message = { id: crypto.randomUUID(), role: "user", text: content, ts: Date.now() };
    setMessages((prev) => [...prev, user]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to get response from the bot.");
      }
      const text = data?.text || "";
      const assistant: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: text || "(No response)",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, assistant]);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Chat failed", description: e?.message ?? String(e), variant: "destructive" });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: "Sorry, I hit an error. Please try again.", ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current && (listRef.current.scrollTop = listRef.current.scrollHeight), 0);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          "Chat cleared. How can I help you next? You can ask about browsing products, placing orders, payments, deliveries, or support.",
        ts: Date.now(),
      },
    ]);
  };

  const launcher = (
    <Button
      onClick={() => setOpen(true)}
      className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 relative"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-white">
        <span className="sr-only">Online</span>
      </span>
    </Button>
  );

  const Header = (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/logo.png" alt="AgriConnect" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <div className="font-semibold">AgriConnect Assistant</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Circle className="w-2 h-2 text-emerald-500" /> Online
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Clear chat" onClick={clearChat}>
          <Trash className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Minimize" onClick={() => setOpen(false)}>
          <ChevronDown className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  const Suggestions = (
    <div className="px-4 py-2 bg-white dark:bg-zinc-900">
      <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Button key={s} size="sm" variant="secondary" className="text-xs" onClick={() => sendMessage(s)}>
            <Sparkles className="w-3.5 h-3.5 mr-1" /> {s}
          </Button>
        ))}
      </div>
    </div>
  );

  const Typing = (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.2s]"></span>
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.1s]"></span>
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"></span>
      </div>
      Typing…
    </div>
  );

  const MessageBubble = ({ m }: { m: Message }) => (
    <div className={cn("mb-3 flex", m.role === "user" ? "justify-end" : "justify-start")}> 
      <div className={cn(
        "rounded-2xl px-3 py-2 max-w-[80%] whitespace-pre-wrap break-words",
        m.role === "user" ? "bg-emerald-600 text-white" : "bg-muted"
      )}>
        <div className="text-sm leading-relaxed">{m.text}</div>
        <div className={cn("mt-1 text-[10px]", m.role === "user" ? "text-emerald-100/80" : "text-muted-foreground")}>{formatTime(m.ts)}</div>
      </div>
    </div>
  );

  const Panel = (
    <div className="absolute bottom-20 right-0 w-[380px] max-w-[92vw] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border overflow-hidden flex flex-col h-[560px]">
      {Header}
      <div
        ref={listRef}
        className="flex-1 px-4 py-3 overflow-y-auto space-y-0"
        onScroll={(e) => {
          const el = e.currentTarget;
          const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          setShowScrollBtn(!nearBottom);
        }}
      >
        {/* Assistant avatar for first message */}
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2">
            {m.role === "assistant" ? (
              <Avatar className="h-6 w-6 mt-1">
                <AvatarImage src="/logo.png" alt="AgriConnect" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-6" />
            )}
            <div className="flex-1">
              <MessageBubble m={m} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2">
            <Avatar className="h-6 w-6 mt-1">
              <AvatarImage src="/logo.png" alt="AgriConnect" />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div className="rounded-2xl px-3 py-2 max-w-[80%] bg-muted text-muted-foreground">
              {Typing}
            </div>
          </div>
        )}
      </div>
      {Suggestions}
  <div className="px-3 pb-3 pt-2 border-t bg-white dark:bg-zinc-900">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about orders, delivery, payments…"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-h-32"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" /> to send
              </div>
            </div>
          </div>
          <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">AI can make mistakes. Check important info.</div>
      </div>

      {showScrollBtn && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-24 right-4 shadow"
          onClick={() => {
            if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
            setShowScrollBtn(false);
          }}
        >
          Scroll to bottom
        </Button>
      )}
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {launcher}
      {/* Desktop panel (render only on desktop to avoid Drawer overlay) */}
      {open && !isMobile && (
        <div className="relative">{Panel}</div>
      )}

      {/* Mobile drawer (mount only on mobile) */}
      {isMobile && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>AgriConnect Assistant</DrawerTitle>
          </DrawerHeader>
          <div className="h-[80vh] max-h-[80svh]">
            <div className="mx-auto max-w-md h-full relative">
              <div className="absolute inset-0 border rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                {Header}
                <div ref={listRef} className="flex-1 px-4 py-3 overflow-y-auto">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} m={m} />
                  ))}
                  {loading && (
                    <div className="rounded-2xl px-3 py-2 max-w-[80%] bg-muted text-muted-foreground">{Typing}</div>
                  )}
                </div>
                {Suggestions}
                  <div className="px-3 pb-3 pt-2 border-t bg-white dark:bg-zinc-900">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message…"
                      className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm leading-6"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="shrink-0">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
