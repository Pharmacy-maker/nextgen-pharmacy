import { apiFetch, mockDelay } from "../client";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockNotifications, mockRoles, mockSiteSettings } from "../mock/db";
import type { NotificationSetting, RolePermission, SiteSettings } from "../../../types/models";

let site: SiteSettings = { ...mockSiteSettings };

export const settingsService = {
  async getSite(): Promise<SiteSettings> {
    if (!USE_MOCK_API) return apiFetch<SiteSettings>(ENDPOINTS.settings.site);
    return mockDelay(site);
  },

  async updateSite(input: Partial<SiteSettings>): Promise<SiteSettings> {
    if (!USE_MOCK_API) return apiFetch<SiteSettings>(ENDPOINTS.settings.site, { method: "PUT", body: input });
    site = { ...site, ...input };
    return mockDelay(site, 400);
  },

  async roles(): Promise<RolePermission[]> {
    if (!USE_MOCK_API) return apiFetch<RolePermission[]>(ENDPOINTS.settings.roles);
    return mockDelay(mockRoles);
  },

  async notifications(): Promise<NotificationSetting[]> {
    if (!USE_MOCK_API) return apiFetch<NotificationSetting[]>(ENDPOINTS.settings.notifications);
    return mockDelay(mockNotifications);
  },
};
