import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET() {
    try {
        const response = await axios.get(`${process.env.BASE_URL}/categories`);
        return NextResponse.json({ success: true, data: response.data });
    } catch (e) { return handleAxiosError(e); }
}

export async function POST(req: NextRequest) {
    try {
        const token = await getAuthToken();
        const body = await req.json();
        const res = await axios.post(`${process.env.BASE_URL}/categories`, body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        try {
            revalidatePath('/', 'layout');
        } catch {}
        return NextResponse.json({ success: true, data: res.data });
    } catch (e) { return handleAxiosError(e); }
}