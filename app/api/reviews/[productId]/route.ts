import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const { productId } = await params;
        const res = await axios.get(`${process.env.BASE_URL}/reviews/product/${productId}`);
        return NextResponse.json({ success: true, data: res.data });
    } catch (e) {
        return handleAxiosError(e);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const { productId } = await params;
        const token = await getAuthToken().catch(() => null); // Optional token
        const body = await request.json();

        const headers: any = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await axios.post(`${process.env.BASE_URL}/reviews/${productId}`, body, { headers });
        return NextResponse.json({ success: true, data: res.data });
    } catch (e) {
        return handleAxiosError(e);
    }
}
