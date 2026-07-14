import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function POST(request: NextRequest,
     context: { params: Promise<{ id: string }> }
) {
      const { id } = await context.params;
    try {

        const token = await getAuthToken();
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await request.json();

        
        const response = await axios.post(`${process.env.BASE_URL}/disputes/initiate/${id}`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

         
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}