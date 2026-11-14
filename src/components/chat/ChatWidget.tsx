"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "../ui/Arrow";

type Msg = { role: "user" | "assistant"; content: string };

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
    <circle cx="9" cy="12" r="0.9" fill="currentColor" />
    <circle cx="13" cy="12" r="0.9" fill="currentColor" />
    <circle cx="17" cy="12" r="0.9" fill="currentColor" />
  </svg>
);

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [company, setCompany] = useState("");
  const startedAt = useRef(Date.now());
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  const openChat = () => {
    setOpen(true);
    if (!messages.length) setMessages([{ role: "assistant", content: t("welcome") }]);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, company, startedAt: startedAt.current, locale }),
      });
      const data = (await res.json()) as { reply?: string };
      if (!res.ok || !data.reply) throw new Error();
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: t("error") }]);
    }
    setSending(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(560px,72dvh)] w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden bg-ivory shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:bottom-[104px] md:right-8 print:hidden">
          <div className="flex items-center justify-between bg-espresso px-5 py-4 text-ivory">
            <div className="flex items-center gap-3">
              <img
                src="/images/stephany.jpg"
                alt="Nina Marquina"
                className="h-11 w-11 rounded-full border border-ivory/25 object-cover object-[center_22%]"
              />
              <div>
                <p className="font-serif text-[16px] tracking-[0.14em]">NINA MARQUINA</p>
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ivory/60">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("online")}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t("close")} className="px-2 text-[18px] leading-none text-ivory/70 hover:text-ivory">
              ×
            </button>
          </div>

          <div ref={list} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-line px-4 py-3 text-[13.5px] leading-[1.6] ${
                    m.role === "user" ? "bg-charcoal text-ivory" : "bg-sand text-charcoal"
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {sending && (
              <p className="max-w-[60%] bg-sand px-4 py-3 text-[13.5px] text-muted">{t("typing")}</p>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {(["s1", "s2", "s3"] as const).map((k) => (
                  <button key={k} onClick={() => send(t(k))} className="border border-black/15 px-3.5 py-2 text-[12px] text-charcoal hover:border-clay hover:text-clay">
                    {t(k)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-black/10 bg-ivory p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              className="input flex-1 !py-3"
              maxLength={1000}
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label={t("send")} className="grid h-11 w-11 shrink-0 place-items-center bg-charcoal text-ivory hover:bg-clay disabled:opacity-40">
              <Arrow />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={open ? () => setOpen(false) : openChat}
        aria-label={t("open")}
        className="group fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-clay text-ivory shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all hover:bg-charcoal md:bottom-8 md:right-8 print:hidden"
      >
        <ChatIcon />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-charcoal px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ivory opacity-0 transition-opacity group-hover:opacity-100">
          {t("open")}
        </span>
      </button>
    </>
  );
}
