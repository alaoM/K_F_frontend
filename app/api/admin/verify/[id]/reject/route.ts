import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function PATCH(
    request: NextRequest,
     context: { params: Promise<{ id: string }> }
) {
    try { 
        const { id } = await context.params;
        const { reason } = await request.json();
        const token = await getAuthToken();
        const response = await axios.patch(
            `${process.env.BASE_URL}/users/${id}/reject`, 
            { reason }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return NextResponse.json({ success: true, data: response.data });
    } catch (e) { return handleAxiosError(e); }
}