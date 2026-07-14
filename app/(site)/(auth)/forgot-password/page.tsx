'use client'

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useForm } from "react-hook-form"
import { setCookie } from "cookies-next"
import { encrypt } from "@/secure/__enc"
import { useState, useEffect } from "react"

const getCookieOptions = (hours = 6) => ({
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: hours * 60 * 60,
})

type FormData = {
  email: string
}

const Page = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  /* -------------------- RETRY TIMER -------------------- */
  useEffect(() => {
    if (retryAfter <= 0) return

    const timer = setInterval(() => {
      setRetryAfter((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [retryAfter])

  /* -------------------- SUBMIT -------------------- */
  const onSubmit = async (data: FormData) => {
    if (!data.email) return

    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email: data.email}),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Failed to send reset email")
      }

      /* Store email for 6 hours */
      setCookie("u_mail", encrypt(data.email), getCookieOptions(6))

      setIsSubmitted(true)
      setRetryAfter(30)

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  /* -------------------- RETRY -------------------- */
  const handleRetry = () => {
    if (retryAfter > 0) return
    setIsSubmitted(false)
    setError(null)
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-[url('/breadcrumb/breadcrumb.jpg')] bg-center bg-cover py-3">
        <div className="text-white text-sm flex items-center gap-2 px-5 max-w-6xl mx-auto">
          <Link href="/">Home</Link>
          <span>/</span>
          <span> Account</span>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-5 py-12">
        <div className="max-w-xl mx-auto">

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-extrabold text-2xl lg:text-4xl">
              Forgot Password
            </h2>
          </div>

          {!isSubmitted && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 text-gray-500"
            >

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Email address"
                  className="border p-3 rounded-md border-gray-300"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Enter a valid email",
                    },
                  })}
                />

                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
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
                className="bg-[#f6c947] font-semibold px-7 py-3 rounded-md hover:bg-[#f6c947/70] text-black transition mb-5 disabled:opacity-60"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

            </form>
          )}

          {/* Success UI */}
          {isSubmitted && (
            <div className="space-y-8 text-center animate-fadeIn">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📩</span>
              </div>

              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  Check your email
                </h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                  We&apos;ve sent a password reset link to <br />
                  <strong className="text-gray-900">
                    your email address
                  </strong>
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Didn&apos;t receive the email?{" "}
                <button
                  onClick={handleRetry}
                  disabled={retryAfter > 0}
                  className={`font-bold transition-colors ${
                    retryAfter > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-600 hover:underline"
                  }`}
                >
                  {retryAfter > 0
                    ? `Retry in ${retryAfter}s`
                    : "Click to retry"}
                </button>
              </p>
            </div>
          )}

          {/* Signup CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-[#f6c947] rounded-md p-5 mt-8 text-center">
            <span className="font-semibold">
              Don&apos;t have an account?
            </span>

            <Link
              href="/signup"
              className="border-b font-medium"
            >
              Create an account
            </Link>
          </div>

        </div>
      </section>
    </>
  )
}

export default Page