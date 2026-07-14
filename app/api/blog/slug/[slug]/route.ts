import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {

    try {
        const { slug } = await params;
        const response = await axios.get(`${process.env.BASE_URL}/blog/${slug}`);
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const token = await getAuthToken();
        const { slug: id } = await params; // slug used as ID for delete
        const response = await axios.delete(`${process.env.BASE_URL}/blog/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return NextResponse.json(response.data);
    } catch (error) {
        return handleAxiosError(error);
    }
}
