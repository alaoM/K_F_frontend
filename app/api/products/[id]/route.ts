import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const res = await axios.get(`${process.env.BASE_URL}/products/${id}`);
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
