
import { supabase } from "../../supabase";
import type { NotificationSetting, RolePermission, SiteSettings } from "../../../types/models";

export const settingsService = {
  async getSite(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .maybeSingle();
    console.log("SITE", data);

  if (error) throw error;

  return {
    siteName: data?.pharmacy_name ?? "",
    supportEmail: data?.email ?? "",
    supportPhone: data?.phone ?? "",
    deliveryFee: 0,
    freeDeliveryAbove: 0,
    maintenanceMode: false,
  };
},

  async updateSite(input: Partial<SiteSettings>)  {
  const { data, error } = await supabase
    .from("site_settings")
    .update(input)
    .select()
    .single();

  if (error) throw error;

  return data;
},

  async notifications(): Promise<NotificationSetting[]> {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*");
  console.log("NOTIFICATIONS RAW", data);
  console.log("NOTIFICATIONS ERROR", error);


  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    label: item.name,
  }));
},

  async updateNotification(
  id: string,
  enabled: boolean
) {
  const { data, error } = await supabase
    .from("notification_settings")
    .update({ enabled })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
},

async roles(): Promise<RolePermission[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("*");
  console.log("ROLES RAW", data);
  console.log("ROLES ERROR", error);

  if (error) throw error;

  return (data ?? []).map((role) => ({
    ...role,
    label: role.name,
  }));
},
};
