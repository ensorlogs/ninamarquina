"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Arrow } from "../ui/Arrow";

type Labels = {
  placeholder: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  invalid: string;
  consent: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ labels }: { labels: Labels }) {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "invalid">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return setStatus("invalid");
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const message =
    status === "success" ? labels.success : status === "error" ? labels.error : status === "invalid" ? labels.invalid : null;

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className="flex items-end gap-6 border-b border-charcoal/30 pb-3 focus-within:border-charcoal">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "sending") setStatus("idle");
          }}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          autoComplete="email"
          className="w-full bg-transparent font-serif text-[22px] outline-none placeholder:text-muted/60"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="link-arrow shrink-0 pb-1 hover:text-clay disabled:opacity-50"
        >
          {status === "sending" ? labels.sending : labels.submit} <Arrow className="arrow" />
        </button>
      </div>
      <p
        aria-live="polite"
        className={`mt-4 min-h-5 text-[12.5px] ${status === "success" ? "text-clay" : status === "idle" || status === "sending" ? "text-muted/80" : "text-red-800"}`}
      >
        {message ?? labels.consent}
      </p>
    </form>
  );
}
