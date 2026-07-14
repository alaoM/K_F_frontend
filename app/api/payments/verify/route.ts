import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reference = searchParams.get("reference");
        const token = await getAuthToken();

       
        const response = await axios.get(
            `${process.env.BASE_URL}/payment-gateways/verify?reference=${reference}`, 
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
 
        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}