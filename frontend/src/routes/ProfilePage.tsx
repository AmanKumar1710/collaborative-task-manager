import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfilePage() {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      apiClient.put("/auth/profile", values),
    onSuccess: (res) => {
      setUser(res.data.user);
      reset({ name: res.data.user.name });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    mutation.mutate(values);
  };

  if (!user) {
    return (
      <p className="text-sm text-slate-600">
        Please log in to view your profile.
      </p>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <div className="space-y-1 text-sm">
        <div className="text-slate-500">Email</div>
        <div className="font-medium text-slate-900">{user.email}</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-xs text-red-600">
            {(mutation.error as any)?.response?.data?.message ??
              "Failed to update profile"}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
