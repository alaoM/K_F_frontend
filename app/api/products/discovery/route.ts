import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(request: NextRequest) {
    try {
        // 1. Extract query parameters from the incoming URL (the Frontend call)
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit");
        const exclude = searchParams.get("exclude");

        const token = await getAuthToken();

        // 2. Pass these parameters to the NestJS backend call
        const response = await axios.get(`${process.env.BASE_URL}/discovery/personalized`, {
            params: {
                // If limit or exclude exist, they are appended to the URL automatically
                ...(limit && { limit }),
                ...(exclude && { exclude }),
            },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        // 3. Return the data to the frontend
        return NextResponse.json(response.data);
        
    } catch (e) {
        return handleAxiosError(e);
    }
}