import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  adi_number?: string;
  hourly_rate?: number;
  avatar_url?: string;
  parent_email?: string;
}

export const useProfileUpdate = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    },
  });
};

export const useAvatarUpload = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Validate file
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("File size must be less than 2MB");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-profile"] });
      toast.success("Avatar updated successfully");
    },
    onError: (error: Error) => {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Failed to upload avatar");
    },
  });
};
