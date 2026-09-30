import { supabase } from "../../supabase";
import type { NotificationSetting, RolePermission, SiteSettings } from "../../../types/models";

export const settingsService = {
  async getSite(): Promise<SiteSettings> {
    const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
    console.log("SITE", data);

    if (error) throw error;

    return {
  siteName: data?.site_name ?? data?.pharmacy_name ?? "",
  supportEmail: data?.support_email ?? data?.email ?? "",
  supportPhone: data?.support_phone ?? data?.phone ?? "",
  deliveryFee: data?.delivery_fee ?? 0,
  freeDeliveryAbove: data?.free_delivery_above ?? 0,
  maintenanceMode: data?.maintenance_mode ?? false,
};
  },

  async updateSite(input: Partial<SiteSettings>) {
  const payload = {
    site_name: input.siteName,
    support_email: input.supportEmail,
    support_phone: input.supportPhone,
    delivery_fee: input.deliveryFee,
    free_delivery_above: input.freeDeliveryAbove,
    maintenance_mode: input.maintenanceMode,
  };

  const { data, error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", "682ee324-b0ea-48a1-8744-c3bd5b3ab326")
    .select();

  console.log("UPDATE DATA:", data);
  console.log("UPDATE ERROR:", error);

  if (error) throw error;

  return data;
},
  async notifications(): Promise<NotificationSetting[]> {
    const { data, error } = await supabase.from("notification_settings").select("*");
    console.log("NOTIFICATIONS RAW", data);
    console.log("NOTIFICATIONS ERROR", error);

    if (error) throw error;

    return (data ?? []).map((item) => ({
      ...item,
      label: item.name,
    }));
  },

  async updateNotification(id: string, enabled: boolean) {
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
    const { data, error } = await supabase.from("roles").select("*");
    console.log("ROLES RAW", data);
    console.log("ROLES ERROR", error);

    if (error) throw error;

    return (data ?? []).map((role) => ({
      ...role,
      label: role.name,
    }));
  },
};
