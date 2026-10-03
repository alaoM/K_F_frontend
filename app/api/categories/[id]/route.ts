// app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

// DELETE a category
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const token = await getAuthToken();
        const transferTo = request.nextUrl.searchParams.get('transferTo');
        const url = transferTo
            ? `${process.env.BASE_URL}/categories/${id}?transferTo=${encodeURIComponent(transferTo)}`
            : `${process.env.BASE_URL}/categories/${id}`;

        const response = await axios.delete(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        try {
            revalidatePath('/', 'layout');
        } catch {}
        return NextResponse.json({ success: true, data: response.data });
    } catch (e) { return handleAxiosError(e); }
}


// UPDATE a category
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const token = await getAuthToken();
        const body = await request.json();
        const response = await axios.patch(`${process.env.BASE_URL}/categories/${id}`, body, {
            headers: { Authorization: `Bearer ${token}` }
        });
        try {
            revalidatePath('/', 'layout');
        } catch {}
        return NextResponse.json({ success: true, data: response.data });
    } catch (e) { return handleAxiosError(e); }
}