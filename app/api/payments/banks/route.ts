import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET() {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${process.env.BASE_URL}/payment-gateways/banks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        
        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}