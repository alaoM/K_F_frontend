import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const forwardedFor = request.headers.get("x-forwarded-for") || "";
        const realIp = request.headers.get("x-real-ip") || "";
        const clientIp = forwardedFor.split(",")[0].trim() || realIp || "127.0.0.1";

        const token = await getAuthToken();
        const headers: Record<string, string> = {
            "x-forwarded-for": clientIp,
            "x-client-ip": clientIp,
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await axios.get(`${process.env.BASE_URL}/products/${id}`, { headers });
        return NextResponse.json({ success: true, data: res.data });
    } catch (e: any) {
        return handleAxiosError(e);
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const token = await getAuthToken();
        const body = await request.json();

        const res = await axios.patch(`${process.env.BASE_URL}/products/${id}`, body, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return NextResponse.json({ success: true, data: res.data });
    } catch (e: any) {
        return handleAxiosError(e);
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const token = await getAuthToken();

        const res = await axios.delete(`${process.env.BASE_URL}/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return NextResponse.json({ success: true, data: res.data });
    } catch (e: any) {
        return handleAxiosError(e);
    }
}
