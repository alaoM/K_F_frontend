import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function POST(
    request: NextRequest,
   context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json(); // { action: 'refund' | 'release', note: string }
        const token = await getAuthToken();

        const response = await axios.patch(
            `${process.env.BASE_URL}/disputes/${id}/resolve`, 
            body, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return NextResponse.json({ success: true, data: response.data });
    } catch (e) { return handleAxiosError(e); }
}