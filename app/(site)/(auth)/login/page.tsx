'use client'

import OTPInput from "@/app/components/OTPComponent"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"

type FormData = {
    name: string
    email: string
    phone: string
    password: string
    terms: boolean
}

const Page = () => {

    const { signIn, isLoading, verify2FA } = useAuth();
    const [showMfaModal, setShowMfaModal] = useState(false);
    const [tempUserId, setTempUserId] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [otp, setOtp] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        try {
            const result = await signIn(data.email, data.password, rememberMe);

            if (result?.mfaRequired) {
                setTempUserId(result.userId);
                setShowMfaModal(true);
            }

        } catch (e) {
            console.error("Login error", e);
        }
    };

    const handleMfaVerify = async (code: string) => {
        if (code.length !== 6) return;

        try {
            await verify2FA(tempUserId, code, rememberMe);

            // ✅ Success → close modal
            setShowMfaModal(false);
            setOtp('');
            setTempUserId('');

        } catch (e: any) {
            console.error(e);
            // toast handled in context ideally
        }
    };



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
                            Login Account
                        </h2>
                    </div>


                    {
                        showMfaModal ? (
                            <OTPInput
                                length={6}
                                value={otp}
                                setShowMfaModal={setShowMfaModal}
                                setOtp={setOtp}
                                onChange={setOtp}
                                onSubmit={handleMfaVerify}
                                loading={isLoading}
                            />
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-gray-500">

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
                                                message: "Enter a valid email"
                                            }
                                        })}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                                    )}
                                </div>


                                {/* Password */}
                                <div className="flex flex-col gap-2">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="border p-3 rounded-md border-gray-300"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters"
                                            }
                                        })}
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-1.5 ml-1">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 focus:ring-green-500 text-green-600 cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="block text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer">
                                        Remember me
                                    </label>
                                </div>


                                {/* Submit */}


                                <div className="flex flex-wrap items-center justify-between gap-5">
                                    <button
                                        type="submit"
                                        className=" bg-[#f6c947]
 font-semibold px-7 py-3 rounded-md hover:bg-[#f6c947/70]  text-black transition mb-5"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Signing In" : "Sign In"}

                                    </button>
                                    <Link href="/forgot-password" className="my-5 text-gray-500 border-b py-1">Forgot your password?</Link>
                                </div>

                            </form>
                        )
                    }



                    {/* Login link */}
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