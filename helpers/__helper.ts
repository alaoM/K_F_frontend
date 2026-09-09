import { decrypt } from "@/secure/__enc";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper to get token
export async function getAuthToken() {
    const cookieStore = await cookies();
    const enc_token = cookieStore.get("_tkn_")?.value;
    return enc_token ? decrypt
    (enc_token) : null;
}

// Universal Error Handler to hide backend logic
export function handleAxiosError(error: unknown) {
    const axiosError = error as AxiosError<any>;
    console.error("Backend Error:", axiosError.response?.data || axiosError.message || error);

    if (axiosError?.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message || axiosError.response.data?.error || "An error occurred";
        return NextResponse.json({ success: false, message }, { status });
    }
    const fallbackMessage = (error as Error)?.message || "Service Unavailable";
    return NextResponse.json({ success: false, message: fallbackMessage }, { status: 500 });
}

