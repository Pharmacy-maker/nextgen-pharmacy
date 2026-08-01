import type { User, UserRole } from "../../../types/models";

/**
 * Local account repository (mock persistence layer).
 *
 * This file is the ONLY place that knows how accounts are stored. When the
 * backend is ready, delete it — `auth.service.ts` already routes to real
 * endpoints whenever `USE_MOCK_API` is false, so no UI code changes.
 */

const ACCOUNTS_KEY = "rays:accounts";

export type StoredAccount = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: User["status"];
  createdAt: string;
  /** Never store plaintext, even in mock storage. */
  passwordHash: string;
};

/** Deterministic, non-reversible digest. Replaced by bcrypt/argon2 server-side. */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`rays::${password}`);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (const b of data) h = (h * 31 + b) | 0;
  return `fallback.${h}`;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

function read(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function write(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

/**
 * Seeds the administrator account once. Credentials live here (server-side
 * equivalent: a seeded admin row), never in any component or UI string.
 */
const ADMIN_SEED = { email: "admin@rayspharmacy.com", password: "Admin@123", name: "Administrator" };

let seeded: Promise<void> | null = null;
export function ensureSeeded(): Promise<void> {
  if (!seeded) {
    seeded = (async () => {
      const accounts = read();
      if (accounts.some((a) => a.role === "admin")) return;
      accounts.push({
        id: "u-admin",
        name: ADMIN_SEED.name,
        email: ADMIN_SEED.email,
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
        passwordHash: await hashPassword(ADMIN_SEED.password),
      });
      write(accounts);
    })();
  }
  return seeded;
}

export async function findAccount(email: string): Promise<StoredAccount | undefined> {
  await ensureSeeded();
  const target = normalizeEmail(email);
  return read().find((a) => normalizeEmail(a.email) === target);
}

export async function createAccount(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<StoredAccount> {
  await ensureSeeded();
  const accounts = read();
  const email = normalizeEmail(input.email);
  if (accounts.some((a) => normalizeEmail(a.email) === email)) {
    throw new Error("An account with this email already exists. Please log in.");
  }
  const account: StoredAccount = {
    id: `u-${Date.now()}`,
    name: input.name.trim(),
    email,
    phone: input.phone,
    role: "user",
    status: "active",
    createdAt: new Date().toISOString().slice(0, 10),
    passwordHash: await hashPassword(input.password),
  };
  accounts.push(account);
  write(accounts);
  return account;
}

export function toUser(account: StoredAccount): User {
  const { passwordHash: _passwordHash, ...user } = account;
  return user;
}
