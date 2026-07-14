import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
 



// GET seller store profile
export async function GET() {
    const token = await getAuthToken();
    try {
        const res = await axios.get(`${process.env.BASE_URL}/seller/me`,
            {
                headers: { Authorization: `Bearer ${token}` }
            });

          
        return NextResponse.json({ success: true, data: res.data });
    } catch (error) {
        return handleAxiosError(error);
    }
}


export async function POST(
    request: Request,
) {
    try {
        const token = await getAuthToken();
        const body = await request.json();


        const res = await axios.post(
            `${process.env.BASE_URL}/seller`,
            body,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );


        return NextResponse.json({ success: true, data: res.data });
    } catch (error: any) {

        return NextResponse.json(
            { message: error.response?.data?.message || "Update failed" },
            { status: error.response?.status || 400 }
        );
    }
}

// PATCH: Update Product
export async function PATCH(
    request: Request,
) {
    try {
        const token = await getAuthToken();
        const body = await request.json();

        const res = await axios.patch(
            `${process.env.BASE_URL}/seller/me`,
            body,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return NextResponse.json({ success: true, data: res.data });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.response?.data?.message || "Update failed" },
            { status: error.response?.status || 400 }
        );
    }
}

// DELETE: Remove Product
export async function DELETE(
request: Request,
) {
    try {
        const token = await getAuthToken();
        const searchParams = new URL(request.url).searchParams;
        const id = searchParams.get("id");
       

        await axios.delete(
            `${process.env.BASE_URL}/products/${id}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return NextResponse.json({ success: true, message: "Product deleted" });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Delete failed" },
            { status: error.response?.status || 500 }
        );
    }
}