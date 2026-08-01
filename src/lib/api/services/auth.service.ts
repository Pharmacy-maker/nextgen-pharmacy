import { apiFetch, mockDelay, setToken } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import {
  consumeResetToken,
  createAccount,
  findAccount,
  hashPassword,
  issueResetToken,
  toUser,
} from "../mock/accounts";
import type { AuthSession, User } from "../../../types/models";

export type LoginPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; phone: string; password: string };

export class AuthError extends Error {
  code: "EMAIL_NOT_FOUND" | "INVALID_PASSWORD" | "ACCOUNT_BLOCKED" | "EMAIL_TAKEN" | "FORBIDDEN";
  constructor(code: AuthError["code"], message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export const authService = {
  /** Registers a new customer account. Does NOT create a session. */
  async signup(payload: SignupPayload): Promise<User> {
    if (!USE_MOCK_API) {
      return apiFetch<User>(ENDPOINTS.auth.signup, { method: "POST", body: payload });
    }
    const existing = await findAccount(payload.email);
    if (existing) throw new AuthError("EMAIL_TAKEN", "An account with this email already exists. Please log in.");
    const account = await createAccount(payload);
    return mockDelay(toUser(account), 500);
  },

  /** Authenticates a previously registered account. */
  async login(payload: LoginPayload): Promise<AuthSession> {
    if (!USE_MOCK_API) {
      const session = await apiFetch<AuthSession>(ENDPOINTS.auth.login, { method: "POST", body: payload });
      setToken(session.token);
      return session;
    }
    const account = await findAccount(payload.email);
    if (!account) throw new AuthError("EMAIL_NOT_FOUND", "No account found. Please sign up first.");
    if (account.status === "blocked") throw new AuthError("ACCOUNT_BLOCKED", "This account has been blocked.");
    const hash = await hashPassword(payload.password);
    if (hash !== account.passwordHash) throw new AuthError("INVALID_PASSWORD", "Incorrect password.");
    const session: AuthSession = { token: `mock.${account.id}.${account.role}`, user: toUser(account) };
    setToken(session.token);
    return mockDelay(session, 400);
  },

  /** Role-scoped sign-in used by the admin entry point. */
  async loginAs(role: User["role"], payload: LoginPayload): Promise<AuthSession> {
    const session = await this.login(payload);
    if (session.user.role !== role) {
      setToken(null);
      throw new AuthError("FORBIDDEN", "These credentials are not authorised for this area.");
    }
    return session;
  },

  /**
   * Starts a password reset. Always resolves successfully so the UI never
   * leaks whether an email is registered. In mock mode the token is returned
   * so the reset screen can be reached without an inbox.
   */
  async requestPasswordReset(email: string): Promise<{ token?: string }> {
    if (!USE_MOCK_API) {
      await apiFetch<void>(ENDPOINTS.auth.forgotPassword, { method: "POST", body: { email } });
      return {};
    }
    const token = await issueResetToken(email);
    return mockDelay(token ? { token } : {}, 600);
  },

  /** Completes a password reset with a single-use token. */
  async resetPassword(token: string, password: string): Promise<void> {
    if (!USE_MOCK_API) {
      await apiFetch<void>(ENDPOINTS.auth.resetPassword, { method: "POST", body: { token, password } });
      return;
    }
    const result = await consumeResetToken(token, password);
    if (!result.ok) throw new AuthError("EMAIL_NOT_FOUND", result.reason ?? "Reset failed.");
    await mockDelay(null, 500);
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
