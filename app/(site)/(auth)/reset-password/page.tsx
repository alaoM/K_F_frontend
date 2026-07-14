'use client'

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useForm } from "react-hook-form"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "react-toastify"
import { useRouter } from 'next/navigation'

type FormData = {
  password: string
  confirmPassword: string
  otp?: string
}

const ResetPasswordContent = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
            <div className="flex flex-col gap-2">
              <label>New Password</label>

              <input
                type="password"
                placeholder="Enter new password"
                className="border p-3 rounded-md border-gray-300"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />

              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Confirm password"
                className="border p-3 rounded-md border-gray-300"
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#f6c947] font-semibold px-7 py-3 rounded-md hover:bg-[#f6c947]/70 text-black transition mb-5 disabled:opacity-60"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

          {/* Login CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-[#f6c947] rounded-md p-5 mt-8 text-center">
            <span className="font-semibold">
              Remember your password?
            </span>

            <Link
              href="/login"
              className="border-b font-medium"
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