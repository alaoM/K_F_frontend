import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const token = await getAuthToken();
        const body = await req.json();

        console.log(body)
        const res = await axios.patch(`${process.env.BASE_URL}/users/profile`, body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json({ success: true, data: res.data });
    } catch (e) { return handleAxiosError(e); }
}