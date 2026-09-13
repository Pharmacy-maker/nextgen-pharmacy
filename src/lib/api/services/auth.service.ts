import { supabase } from "../../supabase";
import { setToken } from "../client";
import type { AuthSession, User } from "@/types/models";

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
    | "ACCOUNT_NOT_FOUND"
    | "FORBIDDEN";

  constructor(
    code: AuthError["code"],
    message: string
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export const authService = {
  // =========================
  // SIGNUP
  // =========================
  async signup(
    payload: SignupPayload
  ): Promise<User> {
    const { data, error } =
      await supabase.auth.signUp({
        email: payload.email.trim(),
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
      console.error("Signup error:", error);

      if (
        error.message
          .toLowerCase()
          .includes("already registered")
      ) {
        throw new AuthError(
          "EMAIL_TAKEN",
          "An account with this email already exists. Please log in."
        );
      }

      throw new AuthError(
        "FORBIDDEN",
        error.message
      );
    }

    if (!data.user) {
      throw new AuthError(
        "FORBIDDEN",
        "Unable to create account."
      );
    }

    // Save profile in users table
    const { error: profileError } =
      await supabase
        .from("users")
        .upsert({
          id: data.user.id,
          full_name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: "user",
          is_active: true,
        });

    if (profileError) {
      console.error(
        "Profile creation error:",
        profileError
      );
    }

    return {
      id: data.user.id,
      name: payload.name,
      email:
        data.user.email ?? payload.email,
      phone: payload.phone,
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
    };
  },

  // =========================
  // LOGIN
  // =========================
  async login(
    payload: LoginPayload
  ): Promise<AuthSession> {
    console.log(
      "LOGIN ATTEMPT:",
      payload.email
    );

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: payload.email.trim(),
        password: payload.password,
      });

    if (error) {
      console.error(
        "SUPABASE LOGIN ERROR:",
        error
      );

      if (
        error.message
          .toLowerCase()
          .includes("invalid login credentials")
      ) {
      throw new AuthError(
  "ACCOUNT_NOT_FOUND",
  "Account not found. Please sign up first."
);
      }

      throw new AuthError(
        "FORBIDDEN",
        error.message
      );
    }

    if (!data.user || !data.session) {
      throw new AuthError(
        "FORBIDDEN",
        "Unable to sign in."
      );
    }

    console.log(
      "SUPABASE LOGIN SUCCESS:",
      data.user.id
    );

    // Get existing profile
    const { data: profile } =
      await supabase
        .from("users")
        .select(
          "id, full_name, email, phone, role, is_active, created_at"
        )
        .eq("id", data.user.id)
        .maybeSingle();

    // If profile doesn't exist, create it
    let finalProfile = profile;

    if (!finalProfile) {
      const { data: insertedProfile } =
        await supabase
          .from("users")
          .insert({
            id: data.user.id,
            full_name:
              data.user.user_metadata?.name ?? "",
            email:
              data.user.email ?? payload.email,
            phone:
              data.user.user_metadata?.phone ?? "",
            role:
              data.user.user_metadata?.role ===
              "admin"
                ? "admin"
                : "user",
            is_active: true,
          })
          .select(
            "id, full_name, email, phone, role, is_active, created_at"
          )
          .single();

      if (insertedProfile) {
        finalProfile = insertedProfile;

        console.log(
          "User profile created:",
          insertedProfile
        );
      }
    }

    // Check active status
    if (
      finalProfile &&
      finalProfile.is_active === false
    ) {
      await supabase.auth.signOut();

      throw new AuthError(
        "ACCOUNT_BLOCKED",
        "Your account has been blocked."
      );
    }

    const user: User = {
      id: data.user.id,

      name:
        finalProfile?.full_name ??
        data.user.user_metadata?.name ??
        "",

      email:
        finalProfile?.email ??
        data.user.email ??
        payload.email,

      phone:
        finalProfile?.phone ??
        data.user.user_metadata?.phone ??
        "",

      role:
        finalProfile?.role === "admin"
          ? "admin"
          : "user",

      status:
        finalProfile?.is_active === false
          ? "inactive"
          : "active",

      createdAt:
        finalProfile?.created_at ??
        new Date().toISOString(),
    };

    const session: AuthSession = {
      token: data.session.access_token,
      user,
    };

    // Store token
    setToken(session.token);

    // Verify session really exists
    const {
      data: verifySession,
    } =
      await supabase.auth.getSession();

    console.log(
      "SUPABASE SESSION:",
      verifySession.session
    );

    return session;
  },

  // =========================
  // LOGIN AS ROLE
  // =========================
  async loginAs(
    role: User["role"],
    payload: LoginPayload
  ): Promise<AuthSession> {
    const session =
      await this.login(payload);

    if (session.user.role !== role) {
      await supabase.auth.signOut();
      setToken(null);

      throw new AuthError(
        "FORBIDDEN",
        "These credentials are not authorised for this area."
      );
    }

    return session;
  },

  // =========================
  // CURRENT USER
  // =========================
  async me(): Promise<User | null> {
    const {
      data,
      error,
    } = await supabase.auth.getUser();

    if (error || !data.user) {
      console.log("NO SUPABASE USER");
      return null;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("users")
      .select(
        "id, full_name, email, phone, role, is_active, created_at"
      )
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Profile error:",
        profileError
      );
    }

    if (!profile) {
      return {
        id: data.user.id,

        name:
          data.user.user_metadata?.name ??
          "",

        email:
          data.user.email ??
          "",

        phone:
          data.user.user_metadata?.phone ??
          "",

        role:
          data.user.user_metadata?.role ===
          "admin"
            ? "admin"
            : "user",

        status: "active",

        createdAt:
          new Date().toISOString(),
      };
    }

    return {
      id: profile.id,

      name:
        profile.full_name ?? "",

      email:
        profile.email ??
        data.user.email ??
        "",

      phone:
        profile.phone ?? "",

      role:
        profile.role === "admin"
          ? "admin"
          : "user",

      status:
        profile.is_active
          ? "active"
          : "inactive",

      createdAt:
        profile.created_at ??
        new Date().toISOString(),
    };
  },

  // =========================
  // LOGOUT
  // =========================
  async logout(): Promise<void> {
    await supabase.auth.signOut();

    setToken(null);

    console.log("LOGGED OUT");
  },

  // =========================
  // PASSWORD RESET
  // =========================
  async requestPasswordReset(
    email: string
  ): Promise<void> {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    if (error) {
      throw new AuthError(
        "FORBIDDEN",
        error.message
      );
    }
  },

  // =========================
  // UPDATE PASSWORD
  // =========================
  async resetPassword(
    _token: string,
    password: string
  ): Promise<void> {
    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      throw new AuthError(
        "FORBIDDEN",
        error.message
      );
    }
  },
};