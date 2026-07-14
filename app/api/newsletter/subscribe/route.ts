import axios from "axios";
import { NextResponse } from "next/server";
import { handleAxiosError } from "@/helpers/__helper";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await axios.post(`${process.env.BASE_URL}/newsletter/subscribe`, body);
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}
