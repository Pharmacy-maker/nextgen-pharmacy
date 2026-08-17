import { apiFetch, mockDelay, setToken } from "../client";
import { supabase } from "../../supabase";
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

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export class AuthError extends Error {
  code:
    | "EMAIL_NOT_FOUND"
    | "INVALID_PASSWORD"
    | "ACCOUNT_BLOCKED"
    | "EMAIL_TAKEN"
    | "FORBIDDEN";

  constructor(code: AuthError["code"], message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export const authService = {
  /** Registers a new customer account. Does NOT create a session. */
  async signup(payload: SignupPayload): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          phone: payload.phone,
          role: "user",
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        throw new AuthError(
          "EMAIL_TAKEN",
          "An account with this email already exists. Please log in.",
        );
      }

      throw new AuthError("FORBIDDEN", error.message);
    }

    if (!data.user) {
      throw new AuthError("FORBIDDEN", "Unable to create account.");
    }

    await supabase.from("users").insert({
      id: data.user.id,
      full_name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: "user",
      is_active: true,
    });

    return {
      id: data.user.id,
      name: payload.name,
      email: data.user.email ?? payload.email,
      phone: payload.phone,
      role: "user",
    };
  },

  /** Authenticates a previously registered account. */
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new AuthError(
          "INVALID_PASSWORD",
          "Incorrect email or password.",
        );
      }

      throw new AuthError("FORBIDDEN", error.message);
    }

    if (!data.user || !data.session) {
      throw new AuthError("FORBIDDEN", "Unable to sign in.");
    }

    await supabase.from("users").insert({
      id: data.user.id,
      full_name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: "user",
      is_active: true,
    });

    const user: User = {
      id: data.user.id,
      name: data.user.user_metadata?.name ?? "",
      email: data.user.email ?? payload.email,
      phone: data.user.user_metadata?.phone ?? "",
      role:
        data.user.user_metadata?.role === "admin"
          ? "admin"
          : "user",
    };

    const session: AuthSession = {
      token: data.session.access_token,
      user,
    };

    setToken(session.token);

    return session;
  },

  /** Role-scoped sign-in used by the admin entry point. */
  async loginAs(
    role: User["role"],
    payload: LoginPayload,
  ): Promise<AuthSession> {
    const session = await this.login(payload);

    if (session.user.role !== role) {
      setToken(null);

      throw new AuthError(
        "FORBIDDEN",
        "These credentials are not authorised for this area.",
      );
    }

    return session;
  },

  /**
   * Starts a password reset.
   */
  async requestPasswordReset(
  email: string,
): Promise<{ token?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new AuthError("FORBIDDEN", error.message);
  }

  // Supabase sends the reset link by email.
  return {};
},

  /** Completes a password reset with a single-use token. */
  async resetPassword(
  _token: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new AuthError("FORBIDDEN", error.message);
  }
},
  /** Gets the currently authenticated user and their profile. */
  async me(): Promise<User | null> {
    const {
      data,
      error,
    } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("users")
      .select(
        "id, full_name, email, phone, role, is_active",
      )
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: profile.id,
      name: profile.full_name ?? "",
      email:
        profile.email ??
        data.user.email ??
        "",
      phone: profile.phone ?? "",

      // Only "admin" is treated as admin.
      // Every other profile is treated as a normal user.
      role:
        profile.role === "admin"
          ? "admin"
          : "user",
    };
  },

  /** Logs the user out. */
  async logout(): Promise<void> {
    if (!USE_MOCK_API) {
      await supabase.auth.signOut().catch(() => undefined);
    }

    setToken(null);
  },
};