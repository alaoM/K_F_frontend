import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const token = await getAuthToken();
        const res = await axios.post(`${process.env.BASE_URL}/auth/2fa/setup`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json({ success: true, data: res.data });
    } catch (e) { return handleAxiosError(e); }
}