import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const token = await getAuthToken();


        const response = await axios.get(`${process.env.BASE_URL}/disputes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}