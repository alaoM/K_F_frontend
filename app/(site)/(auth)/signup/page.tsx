'use client'

export const dynamic = 'force-dynamic'

import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

type FormData = {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  address?: string
  location?: string
  terms: boolean
}

const SignupContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if they came from the "Become a Seller" button
  const intent = searchParams.get("intent");
  const isRegisteringToSell = intent === "seller";



  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>()
  const [error, setError] = useState<string | null>(null);

  const { register: registerUser, isLoading } = useAuth();

  const normalizePhone = (phone: string) => {
    if (phone.startsWith("0")) {
      return "+234" + phone.slice(1);
    }
    return phone;
  };
const onSubmit = async (data: FormData) => {
  setError(null);

  const res = await registerUser({
    fullName: data.fullName,
    email: data.email,
    password: data.password,
    phoneNumber: normalizePhone(data.phoneNumber) || "",
    address: data.address || "",
    location: data.location || "",
    isRegisteringToSell,
  });


  if (!res?.success) {
    setError(res?.message || "Registration failed");
    return;
  }

  // Optional success handling
  // toast.success("Registration successful");
};

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-[url('/breadcrumb/breadcrumb.jpg')] bg-center bg-cover py-3">
        <div className="text-white text-sm flex items-center gap-2 px-5 max-w-6xl mx-auto">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Create Account</span>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-5 py-12">
        <div className="max-w-xl mx-auto">

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-extrabold text-2xl lg:text-4xl text-[#243e6b]">
              {isRegisteringToSell ? "Step 1: Create Seller Account" : "Create Account"}
            </h2>
            {isRegisteringToSell && (
              <p className="text-gray-500 mt-2 text-sm">
                Register your base account first, then we&apos;ll set up your store.
              </p>
            )}
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-none bg-red-50 border border-red-200 text-xs text-center text-red-600 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-gray-700">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Name</label>
              <input
                className="border p-3 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                placeholder="Full Name"
                {...register("fullName", { required: "Name is required" })}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Email Address</label>
              <input
                type="email"
                placeholder="Email address"
                className="border p-3 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email"
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Phone Number</label>
              <input
                type="tel"
                placeholder="Phone number"
                className="border p-3 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                {...register("phoneNumber", { required: "Phone number is required" })}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>
              )}
            </div>
            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Address</label>
              <input
                className="border p-3 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                placeholder="Address"
                {...register("address")}
              />

            </div>
            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">City</label>
              <input
                className="border p-3 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                placeholder="Location / City"
                {...register("location")}
              />

            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="border p-3 rounded-none border-gray-300 text-xs outline-none focus:border-[#111111]"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                    message: "Password must contain at least one letter and one number"
                  }
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                className="mt-0.5 rounded-none border-gray-300 text-[#111111] focus:ring-0"
                {...register("terms", {
                  required: "You must accept the terms"
                })}
              />
              <span className="text-gray-600">
                I agree to the
                <Link
                  href="/terms"
                  className="ml-1 border-b border-[#111111] font-bold text-[#111111]"
                >
                  terms & conditions
                </Link>
              </span>
            </div>

            {errors.terms && (
              <p className="text-red-500 text-xs">{errors.terms.message}</p>
            )}

            {/* Submit */}
            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-[#111111] hover:bg-[#f6c947] hover:text-[#111111] text-[#f6c947] font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-none transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Get Started'}
            </button>

          </form>

          {/* Login link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 rounded-none p-4 mt-8 text-center text-xs bg-gray-50 border border-gray-100">
            <span className="font-bold text-gray-700 uppercase tracking-wider">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="border-b border-[#111111] font-black uppercase text-[#111111]"
            >
              Log in
            </Link>
          </div>

        </div>
      </section>
    </>
  )
}

const Page = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" /></div>}>
    <SignupContent />
  </Suspense>
)

export default Page