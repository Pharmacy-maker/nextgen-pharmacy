import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
  return new Response("ok", {
    headers: corsHeaders,
  });
}
  try {
    const { userId } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete from public.users
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) throw dbError;

    // Delete from Authentication
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) throw authError;

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
  JSON.stringify({
    success: true,
  }),
  {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  }
);
  }
});