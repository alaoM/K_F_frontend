import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { decrypt } from "@/secure/__enc";

type BackendErrorResponse = {
    message?: string | string[];
    error?: string;
    statusCode?: number;
};

export async function POST(request: Request) {
    try {
        /* ----------------------------- */
        /* 1. AUTH TOKEN                 */
        /* ----------------------------- */
        const cookieStore = await cookies();
        const encToken = cookieStore.get("_tkn_")?.value;
        const token = encToken ? decrypt(encToken) : null;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    code: "AUTH_REQUIRED",
                    message: "Authentication required",
                },
                { status: 401 }
            );
        }

        /* ----------------------------- */
        /* 2. REQUEST DATA               */
        /* ----------------------------- */
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    code: "INVALID_REQUEST",
                    message: "User ID is required",
                },
                { status: 400 }
            );
        }

        /* ----------------------------- */
        /* 3. BACKEND REQUEST            */
        /* ----------------------------- */
        const response = await axios.patch(
            `${process.env.BASE_URL}/auth/${userId}/onboard`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        /* ----------------------------- */
        /* 4. SUCCESS RESPONSE           */
        /* ----------------------------- */

        console.log("Onboarding response:", response.data); // Server-side logging ONLY
        return NextResponse.json(
            {
                success: true,
                user: response.data.user,
            },
            { status: 200 }
        );
    } catch (error) {
        const axiosError = error as AxiosError<BackendErrorResponse>;
        const status = axiosError.response?.status || 500;
        const data = axiosError.response?.data;

        let message = "Service temporarily unavailable";
        let code = "SERVER_ERROR";

        switch (status) {
            case 400:
                message = Array.isArray(data?.message)
                    ? data.message.join(", ")
                    : data?.message || "Invalid input";
                code = "VALIDATION_ERROR";
                break;

            case 401:
                message = "Unauthorized request";
                code = "AUTH_REQUIRED";
                break;

            case 403:
                message = "Your account has been suspended";
                code = "ACCOUNT_SUSPENDED";
                break;

            case 404:
                message = "User not found";
                code = "USER_NOT_FOUND";
                break;

            case 409:
                message = "User has already completed onboarding";
                code = "ONBOARDING_COMPLETED";
                break;

            case 429:
                message = "Too many attempts";
                code = "RATE_LIMITED";
                break;
        }

        return NextResponse.json(
            {
                success: false,
                code,
                message,
            },
            { status }
        );
    }
}