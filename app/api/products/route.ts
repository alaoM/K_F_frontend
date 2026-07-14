import { NextResponse } from "next/server";
import axios   from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const response = await axios.get(`${process.env.BASE_URL}/products`, {
            params: Object.fromEntries(searchParams), // Pass filters (category, search, etc)
        });

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
            `${process.env.BASE_URL}/products`,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        return NextResponse.json(response.data, { status: 201 });
    } catch (error:any) {
        console.log(error);
        return handleAxiosError(error);
    }
}