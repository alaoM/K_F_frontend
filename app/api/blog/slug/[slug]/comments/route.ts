import axios from "axios";
import { NextResponse } from "next/server";
import { handleAxiosError } from "@/helpers/__helper";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const response = await axios.post(`${process.env.BASE_URL}/blog/${slug}/comments`, body);
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}
