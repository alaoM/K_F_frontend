import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET() {
    try {
        const token = await getAuthToken();
        
        // This calls your NestJS: @Get('admin/verification-queue')
        const response = await axios.get(`${process.env.BASE_URL}/users/admin/verification-queue`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Wrap in success: true to match your safeFetch/useApi logic
        return NextResponse.json({ success: true, data: response.data });
    } catch (e) {
        return handleAxiosError(e);
    }
}