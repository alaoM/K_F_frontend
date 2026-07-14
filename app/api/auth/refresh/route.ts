import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";
import { decrypt, encrypt } from "@/secure/__enc";
import { COOKIE_REFRESH_KEY, COOKIE_TOKEN_KEY, getCookieOptions } from "@/context/AuthContext";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const encryptedRefresh = cookieStore.get(COOKIE_REFRESH_KEY)?.value;

        if (!encryptedRefresh) {
            return NextResponse.json({ success: false, message: "No refresh token found" }, { status: 401 });
        }

        const refreshToken = decrypt(encryptedRefresh);

        // 1. Call NestJS Refresh Endpoint
        const response = await axios.post(`${process.env.BASE_URL}/auth/refresh`, {
            refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 2. Prepare Response and Update Cookies
        const nextResponse = NextResponse.json({ 
            success: true, 
            accessToken 
        });

        const options = getCookieOptions(7); // Refresh tokens usually last longer

        nextResponse.cookies.set(COOKIE_TOKEN_KEY, encrypt(accessToken), options);
        nextResponse.cookies.set(COOKIE_REFRESH_KEY, encrypt(newRefreshToken), options);

        return nextResponse;
    } catch (error: any) {
        console.error("Token refresh failed:", error.response?.data || error.message);
        return NextResponse.json({ success: false, message: "Refresh failed" }, { status: 401 });
    }
}