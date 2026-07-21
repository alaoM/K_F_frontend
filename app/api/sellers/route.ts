import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleAxiosError } from "@/helpers/__helper";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "20";

        const response = await axios.get(`${process.env.BASE_URL}/seller`, {
            params: { page, limit }
        });

        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}
