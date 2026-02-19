import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "user";

export function useUserRole() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("user");
          setIsAdmin(false);
        } else if (data) {
          setRole(data.role as AppRole);
          setIsAdmin(data.role === "admin");
        } else {
          setRole("user");
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error in useUserRole:", err);
        setRole("user");
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();

    // Re-fetch role when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, isAdmin, isLoading };
}
