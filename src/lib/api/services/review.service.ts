import { supabase } from "../../supabase";

export const reviewService = {
  async list(productId: string) {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(input: {
    productId: string;
    customerName: string;
    rating: number;
    review: string;
  }) {
    const { data, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: input.productId,
        customer_name: input.customerName,
        rating: input.rating,
        review: input.review,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};