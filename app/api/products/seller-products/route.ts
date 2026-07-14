import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(request: NextRequest) {
    try {
        const token = await getAuthToken();
        const { searchParams } = new URL(request.url);

        // Forward all query params (search, limit, offset, etc.)
        const response = await axios.get(`${process.env.BASE_URL}/products/seller`, {
            params: Object.fromEntries(searchParams.entries()),
            headers: { Authorization: `Bearer ${token}` } 
        });
    
        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}