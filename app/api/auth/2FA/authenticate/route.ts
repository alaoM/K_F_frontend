import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleAxiosError } from "@/helpers/__helper";

export async function POST(req: NextRequest) {
    try {

       
        const body = await req.json(); 
        
        const response = await axios.post(`${process.env.BASE_URL}/auth/2fa/authenticate`, body);
 
                const { user, accessToken, refreshToken } = response.data;

        const frontendResponse = {
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isOnboarded: user.isOnboarded,
            },
            token: accessToken,
            refreshToken: refreshToken,
        };
         return NextResponse.json(frontendResponse, { status: 200 });
    } catch (e) {
        console.error("2FA Authentication Error:", e); // Debug log
        return handleAxiosError(e);
    }
}