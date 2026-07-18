import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET() {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${process.env.BASE_URL}/orders/admin/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}
