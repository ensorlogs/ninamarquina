import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const secret = () => process.env.CAPTCHA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "captcha-dev";

const sign = (answer: number) => createHmac("sha256", secret()).update(String(answer)).digest("base64url");

/** Stateless math captcha: the token is an HMAC of the expected answer, so no storage is needed. */
export function newChallenge() {
  const a = randomInt(2, 10);
  const b = randomInt(2, 10);
  return { question: `${a} + ${b} = ?`, token: sign(a + b), answer: a + b };
}

export function verifyChallenge(token: string | undefined, answer: string | undefined): boolean {
  const n = Number(answer);
  if (!token || !answer || !Number.isInteger(n) || n < 0 || n > 99) return false;
  const expected = Buffer.from(sign(n));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

const MIN_FORM_MS = 3000;

/** Rejects submissions faster than a human could realistically complete the form. */
export function humanPace(startedAt: unknown): boolean {
  const t = Number(startedAt);
  if (!t || t > Date.now() + 60_000) return false;
  return Date.now() - t >= MIN_FORM_MS;
}
