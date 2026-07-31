// lib/store.js — persistence keyed by the signed-in user's email.
// Production: Upstash Redis (Vercel marketplace sets KV_* or UPSTASH_* env vars).
// Local dev fallback: .data/store.json (gitignored). On Vercel without Redis
// configured we fail loudly rather than silently losing data.
import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const FILE = path.join(process.cwd(), ".data", "store.json");

function fileRead() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function fileWrite(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 1));
}

async function kvGet(key) {
  if (redis) return await redis.get(key);
  if (process.env.VERCEL)
    throw new Error(
      "No KV store configured. Add the Upstash Redis integration to this Vercel project."
    );
  return fileRead()[key] ?? null;
}

async function kvSet(key, value) {
  if (redis) return await redis.set(key, value);
  if (process.env.VERCEL)
    throw new Error(
      "No KV store configured. Add the Upstash Redis integration to this Vercel project."
    );
  const data = fileRead();
  data[key] = value;
  fileWrite(data);
}

const userKey = (email) => `naksha:user:${email.toLowerCase()}`;
const partnersKey = (email) => `naksha:partners:${email.toLowerCase()}`;

export async function getUserProfile(email) {
  return await kvGet(userKey(email));
}

export async function saveUserProfile(email, { name, birth, intent }) {
  const profile = { name, birth, intent, updatedAt: new Date().toISOString() };
  await kvSet(userKey(email), profile);
  return profile;
}

export async function getPartners(email) {
  return (await kvGet(partnersKey(email))) || [];
}

// Upsert by name + birth date so re-checking someone updates their entry
// (and their latest score) instead of duplicating the rolodex.
export async function upsertPartner(email, { name, birth, lastScore }) {
  const partners = await getPartners(email);
  const matches = (p) =>
    p.name?.toLowerCase() === name?.toLowerCase() && p.birth?.date === birth?.date;
  const existing = partners.find(matches);
  const entry = {
    id: existing?.id || crypto.randomUUID(),
    name,
    birth,
    lastScore: lastScore ?? existing?.lastScore ?? null,
    addedAt: existing?.addedAt || new Date().toISOString(),
    checkedAt: new Date().toISOString(),
  };
  const next = [entry, ...partners.filter((p) => !matches(p))];
  await kvSet(partnersKey(email), next);
  return next;
}

export async function removePartner(email, id) {
  const next = (await getPartners(email)).filter((p) => p.id !== id);
  await kvSet(partnersKey(email), next);
  return next;
}
