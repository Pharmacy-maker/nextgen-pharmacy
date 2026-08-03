import { apiFetch, mockDelay } from "../client";
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

  async addresses(userId: ID): Promise<Address[]> {
    if (!USE_MOCK_API) return apiFetch<Address[]>(ENDPOINTS.users.addresses(userId));
    return mockDelay(addressStore.list(userId), 200);
  },

  async addAddress(userId: ID, input: Omit<AddressInput, "userId">): Promise<Address> {
    if (!USE_MOCK_API)
      return apiFetch<Address>(ENDPOINTS.users.addresses(userId), { method: "POST", body: input });
    return mockDelay(addressStore.create({ ...input, userId }), 250);
  },

  async setDefaultAddress(userId: ID, addressId: ID): Promise<Address[]> {
    if (!USE_MOCK_API)
      return apiFetch<Address[]>(ENDPOINTS.users.address(userId, addressId), {
        method: "PATCH",
        body: { isDefault: true },
      });
    return mockDelay(addressStore.setDefault(userId, addressId), 200);
  },

  async removeAddress(userId: ID, addressId: ID): Promise<Address[]> {
    if (!USE_MOCK_API)
      return apiFetch<Address[]>(ENDPOINTS.users.address(userId, addressId), { method: "DELETE" });
    return mockDelay(addressStore.remove(userId, addressId), 200);
  },
};
