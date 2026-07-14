import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const response = await axios.get(`${process.env.BASE_URL}/blog/${params.id}`);
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const token = await getAuthToken();
        const response = await axios.delete(
            `${process.env.BASE_URL}/blog/${params.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        return NextResponse.json(response.data);
    } catch (error: any) {
        return handleAxiosError(error);
    }
}
