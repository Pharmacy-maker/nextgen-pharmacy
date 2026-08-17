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
    if (!USE_MOCK_API) return apiFetch<User[]>(ENDPOINTS.users.list);
    return mockDelay(users);
  },

  async get(id: ID): Promise<User | null> {
    if (!USE_MOCK_API) return apiFetch<User>(ENDPOINTS.users.detail(id));
    return mockDelay(users.find((u) => u.id === id) ?? null);
  },

  async updateStatus(id: ID, status: UserStatus): Promise<User> {
    if (!USE_MOCK_API) return apiFetch<User>(ENDPOINTS.users.detail(id), { method: "PATCH", body: { status } });
    users = users.map((u) => (u.id === id ? { ...u, status } : u));
    return mockDelay(users.find((u) => u.id === id)!, 300);
  },

  async update(id: ID, input: Partial<Pick<User, "name" | "email" | "phone" | "role" | "status">>): Promise<User> {
    if (!USE_MOCK_API) return apiFetch<User>(ENDPOINTS.users.detail(id), { method: "PATCH", body: input });
    users = users.map((u) => (u.id === id ? { ...u, ...input } : u));
    return mockDelay(users.find((u) => u.id === id)!, 300);
  },

  async remove(id: ID): Promise<void> {
    if (!USE_MOCK_API) {
      await apiFetch<void>(ENDPOINTS.users.detail(id), { method: "DELETE" });
      return;
    }
    users = users.filter((u) => u.id !== id);
    await mockDelay(null, 250);
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
    fullName: row.full_name,
    phone: row.phone,
    line1: row.address_line_1,
    line2: row.address_line_2 ?? "",
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  }));
},

  async addAddress(userId: ID, input: Omit<AddressInput, "userId">): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      full_name: input.fullName,
      phone: input.phone,
      address_line_1: input.line1,
      address_line_2: input.line2 || null,
      city: input.city,
      state: input.state,
      postal_code: input.postalCode,
      country: input.country,
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
    fullName: data.full_name,
    phone: data.phone,
    line1: data.address_line_1,
    line2: data.address_line_2 ?? "",
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    country: data.country,
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