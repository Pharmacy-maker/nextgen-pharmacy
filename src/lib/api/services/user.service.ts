import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockAddresses, mockUsers } from "../mock/db";
import type { Address, ID, User, UserStatus } from "../../../types/models";

let users: User[] = [...mockUsers];

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
    return mockDelay(mockAddresses.filter((a) => a.userId === userId || userId.startsWith("u-")));
  },
};
