import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const secret = () => process.env.CAPTCHA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "captcha-dev";

const sign = (answer: number, issuedAt: number) =>
  createHmac("sha256", secret()).update(`${answer}.${issuedAt}`).digest("base64url");

const MIN_FORM_MS = 3000;
const MAX_AGE_MS = 60 * 60 * 1000;

/**
 * Stateless math captcha: the token carries the server issue time plus an HMAC of answer and time,
 * so no storage is needed. Too-fast (bots) and stale (replayed) tokens are rejected using the server clock.
 */
export function newChallenge() {
  const a = randomInt(2, 10);
  const b = randomInt(2, 10);
  const issuedAt = Date.now();
  return { question: `${a} + ${b} = ?`, token: `${issuedAt}.${sign(a + b, issuedAt)}`, answer: a + b };
}

export function verifyChallenge(token: string | undefined, answer: string | undefined): boolean {
  const n = Number(answer);
  if (!token || !answer || !Number.isInteger(n) || n < 0 || n > 99) return false;
  const [ts, mac] = token.split(".");
  const issuedAt = Number(ts);
  const age = Date.now() - issuedAt;
  if (!mac || !Number.isInteger(issuedAt) || age < MIN_FORM_MS || age > MAX_AGE_MS) return false;
  const expected = Buffer.from(sign(n, issuedAt));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
