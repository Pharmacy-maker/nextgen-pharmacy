import type { Address, ID } from "../../../types/models";
import { mockAddresses } from "./db";

/**
 * Local-storage backed address book.
 *
 * Mirrors an `addresses` table (PK `id`, FK `userId`). Swap this module for
 * real API calls in `user.service.ts` — no UI change required.
 */

const KEY = "rays:addresses";

function readAll(): Address[] {
  if (typeof localStorage === "undefined") return [...mockAddresses];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(mockAddresses));
      return [...mockAddresses];
    }
    return JSON.parse(raw) as Address[];
  } catch {
    return [...mockAddresses];
  }
}

function writeAll(rows: Address[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* storage unavailable */
  }
}

export const addressStore = {
  list(userId: ID): Address[] {
    return readAll().filter((a) => a.userId === userId);
  },

  create(input: Omit<Address, "id">): Address {
    const rows = readAll();
    const makeDefault = input.isDefault || !rows.some((a) => a.userId === input.userId);
    const address: Address = { ...input, id: `a-${Date.now()}`, isDefault: makeDefault };
    const next = rows.map((a) =>
      makeDefault && a.userId === input.userId ? { ...a, isDefault: false } : a,
    );
    next.push(address);
    writeAll(next);
    return address;
  },

  setDefault(userId: ID, addressId: ID): Address[] {
    const next = readAll().map((a) =>
      a.userId === userId ? { ...a, isDefault: a.id === addressId } : a,
    );
    writeAll(next);
    return next.filter((a) => a.userId === userId);
  },

  remove(userId: ID, addressId: ID): Address[] {
    const next = readAll().filter((a) => !(a.userId === userId && a.id === addressId));
    writeAll(next);
    return next.filter((a) => a.userId === userId);
  },
};
