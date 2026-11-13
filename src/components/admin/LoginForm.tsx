"use client";

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  return state === "sent" ? (
    <p className="mt-10 border-l-2 border-clay pl-4 text-[14px] leading-[1.7]">
      Si <b>{email}</b> tiene acceso, recibirás un enlace en unos segundos. Revisa también spam.
    </p>
  ) : (
    <form
      className="mt-10"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          setState(res.ok ? "sent" : "error");
        } catch {
          setState("error");
        }
      }}
    >
      <label className="label text-muted" htmlFor="email">Email</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
      {state === "error" && <p className="mt-4 text-[13px] text-clay">No pudimos enviar el enlace. Inténtalo de nuevo.</p>}
      <button disabled={state === "sending"} className="link-arrow mt-8 w-full justify-center bg-charcoal px-8 py-4 text-ivory hover:bg-clay disabled:opacity-60">
        {state === "sending" ? "Enviando…" : "Enviar enlace de acceso"}
      </button>
    </form>
  );
}
