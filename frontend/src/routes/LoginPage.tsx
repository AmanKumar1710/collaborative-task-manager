import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { loginSchema, type LoginFormValues } from "../validation/authSchemas";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    mutate,
    isPending,
    error,
  } = useMutation({
    mutationFn: (values: LoginFormValues) =>
      apiClient.post("/auth/login", values),
    onSuccess: (res) => {
      setUser(res.data.user);
      navigate("/dashboard");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="text-xl font-semibold">Log in</h1>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          className="w-full rounded border px-3 py-2 text-sm"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2 text-sm"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">
          {(error as any)?.response?.data?.message ?? "Login failed"}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Logging in..." : "Log in"}
      </button>

      <p className="text-xs text-slate-600">
        Need an account?{" "}
        <Link to="/auth/register" className="text-slate-900 underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default LoginPage;
