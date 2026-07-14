import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET() {
    try {
        const response = await axios.get(`${process.env.BASE_URL}/blog`);
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function POST(request: Request) {
    try {
        const token = await getAuthToken();
        const body = await request.json();

        const response = await axios.post(
            `${process.env.BASE_URL}/blog`,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        return handleAxiosError(error);
    }
}
