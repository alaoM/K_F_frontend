import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

// GET: Fetch all saved bank accounts for the logged-in seller
export async function GET() {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${process.env.BASE_URL}/seller/banks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}

// POST: Link a new bank account
export async function POST(request: NextRequest) {
    try {
        const token = await getAuthToken();
        const body = await request.json();

        const response = await axios.post(`${process.env.BASE_URL}/seller/banks`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}

// PATCH: Set a specific bank as Primary
export async function PATCH(
    request: NextRequest,
) {
    try {
        const token = await getAuthToken();
           const searchParams = new URL(request.url).searchParams;
        const id = searchParams.get("id");

        const response = await axios.patch(
            `${process.env.BASE_URL}/seller/banks/${id}/primary`,
            {}, // Empty body
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}

// DELETE: Remove a bank account
export async function DELETE(
    request: NextRequest,
    //   context: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getAuthToken();
        const searchParams = new URL(request.url).searchParams;
        const id = searchParams.get("id");
        
       
    

        const response = await axios.delete(
            `${process.env.BASE_URL}/seller/banks/${id}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}