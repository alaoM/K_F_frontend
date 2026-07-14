import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, 
     context: { params: Promise<{ id: string }> }

) {
     const { id } = await context.params;
    try {
        const token = await getAuthToken();
        const res = await axios.patch(`${process.env.BASE_URL}/orders/${id}/confirm`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json({ success: true, data: res.data });
    } catch (e) { return handleAxiosError(e); }
}