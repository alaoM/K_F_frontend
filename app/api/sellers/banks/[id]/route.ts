import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";



// PATCH: Set a specific bank as Primary
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
 
) {
    try {
        const token = await getAuthToken();
        const { id } = await context.params;


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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getAuthToken();
        const { id } = await context.params;

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