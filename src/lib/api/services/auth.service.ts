import { apiFetch, mockDelay, setToken } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockUsers } from "../mock/db";
import type { AuthSession, User } from "../../../types/models";

export type LoginPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; phone: string; password: string };

/** Demo admin credentials while running on mock data. */
export const DEMO_ADMIN = { email: "admin@rayspharmacy.com", password: "Admin@123" };

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    if (!USE_MOCK_API) {
      const session = await apiFetch<AuthSession>(ENDPOINTS.auth.login, { method: "POST", body: payload });
      setToken(session.token);
      return session;
    }
    const email = payload.email.trim().toLowerCase();
    const known = mockUsers.find((u) => u.email.toLowerCase() === email);
    const user: User =
      known ??
      {
        id: `u-${Date.now()}`,
        name: email.split("@")[0],
        email,
        role: email.startsWith("admin") ? "admin" : "user",
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
      };
    const session: AuthSession = { token: `mock.${user.id}`, user };
    setToken(session.token);
    return mockDelay(session, 500);
  },

  async signup(payload: SignupPayload): Promise<AuthSession> {
    if (!USE_MOCK_API) {
      const session = await apiFetch<AuthSession>(ENDPOINTS.auth.signup, { method: "POST", body: payload });
      setToken(session.token);
      return session;
    }
    const user: User = {
      id: `u-${Date.now()}`,
      name: payload.name,
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone,
      role: "user",
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const session: AuthSession = { token: `mock.${user.id}`, user };
    setToken(session.token);
    return mockDelay(session, 600);
  },

  async me(): Promise<User | null> {
    if (!USE_MOCK_API) return apiFetch<User>(ENDPOINTS.auth.me);
    return mockDelay(null, 100);
  },

  async logout(): Promise<void> {
    if (!USE_MOCK_API) await apiFetch<void>(ENDPOINTS.auth.logout, { method: "POST" }).catch(() => undefined);
    setToken(null);
  },
};
