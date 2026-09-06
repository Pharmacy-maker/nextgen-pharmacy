import { apiFetch, mockDelay } from "../client";
import { supabase } from "../../supabase";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockUsers } from "../mock/db";
import { addressStore } from "../mock/addresses";
import type { Address, ID, User, UserStatus } from "../../../types/models";

let users: User[] = [...mockUsers];

export type AddressInput = Omit<Address, "id">;

export const userService = {
  async list(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = data ?? [];

console.log(
  "USER IDS FROM SUPABASE:",
  rows.map((r) => r.id)
);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.full_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    role: row.role === "admin" ? "admin" : "user",
    status: row.is_active ? "active" : "inactive",
    createdAt: row.created_at,
  }));
},

  async get(id: ID): Promise<User | null> {
    if (!USE_MOCK_API) return apiFetch<User>(ENDPOINTS.users.detail(id));
    return mockDelay(users.find((u) => u.id === id) ?? null);
  },

  async updateStatus(
  id: ID,
  status: UserStatus
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update({
      is_active: status === "active",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.full_name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    role: data.role === "admin" ? "admin" : "user",
    status: data.is_active ? "active" : "inactive",
    createdAt: data.created_at,
  };
},

async update(
  id: ID,
  input: Partial<
    Pick<User, "name" | "email" | "phone" | "role" | "status">
  >
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update({
      full_name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      is_active:
        input.status !== undefined
          ? input.status === "active"
          : undefined,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.full_name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    role: data.role === "admin" ? "admin" : "user",
    status: data.is_active ? "active" : "inactive",
    createdAt: data.created_at,
  };
},

 async remove(id: ID): Promise<void> {
  const { data, error } = await supabase.functions.invoke(
    "delete-user",
    {
      body: {
        userId: id,
      },
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  console.log("Delete response:", data);
},
  async addresses(userId: ID): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
  id: row.id,
  userId: row.user_id,
  label: row.full_name ?? "Home",
  line1: row.address_line_1,
  city: row.city,
  state: row.state ?? "",
  pincode: row.postal_code,
  phone: row.phone,
  isDefault: row.is_default,
}));
},

  async addAddress(userId: ID, input: Omit<AddressInput, "userId">): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .insert({
  user_id: userId,
  full_name: input.label,
  phone: input.phone,
  address_line_1: input.line1,
  city: input.city,
  state: input.state,
  postal_code: input.pincode,
  is_default: input.isDefault ?? false,
})
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
  id: data.id,
  userId: data.user_id,
  label: data.full_name ?? "Home",
  line1: data.address_line_1,
  city: data.city,
  state: data.state ?? "",
  pincode: data.postal_code,
  phone: data.phone,
  isDefault: data.is_default,
};
},
  async setDefaultAddress(userId: ID, addressId: ID): Promise<Address[]> {
  const { error: clearError } = await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);

  if (clearError) {
    throw new Error(clearError.message);
  }

  const { error: setError } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", userId);

  if (setError) {
    throw new Error(setError.message);
  }

  return this.addresses(userId);
},

  async removeAddress(userId: ID, addressId: ID): Promise<Address[]> {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return this.addresses(userId);
},
};