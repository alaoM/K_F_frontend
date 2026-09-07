'use client'

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useForm } from "react-hook-form"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "react-toastify"
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from "lucide-react"

type FormData = {
  password: string
  confirmPassword: string
  otp?: string
}

const ResetPasswordContent = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const email = searchParams.get("email");

  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>()

  const password = watch("password")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    if (!q) {
      setError("Invalid or expired reset link");
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: q,
          newPassword: password,
          email: email,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Password reset failed")
      }


      toast.success("Password reset successful! You can now log in with your new password.")
      router.push("/login")

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-[url('/breadcrumb/breadcrumb.jpg')] bg-center bg-cover py-3">
        <div className="text-white text-sm flex items-center gap-2 px-5 max-w-6xl mx-auto">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Reset Password</span>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-5 py-12">
        <div className="max-w-xl mx-auto">

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-extrabold text-2xl lg:text-4xl">
              Reset Password
            </h2>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 text-gray-500"
          >

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">New Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full border p-3 pr-11 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Confirm Password</label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="w-full border p-3 pr-11 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] transition-colors p-1 cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] font-black text-xs uppercase tracking-widest px-7 py-3.5 rounded-none transition mb-5 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

          {/* Login CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-[#f6c947] rounded-none p-4 mt-8 text-center text-xs">
            <span className="font-bold text-[#111111] uppercase tracking-wider">
              Remember your password?
            </span>

            <Link
              href="/login"
              className="border-b border-[#111111] font-black uppercase text-[#111111]"
            >
              Sign in
            </Link>
          </div>

        </div>
      </section>
    </>
  )
}

const Page = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>}>
    <ResetPasswordContent />
  </Suspense>
)

export default Page