import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        // The backend GET /seller/:slug also works for IDs because of TypeORM findOne behavior or explicit logic
        // But the controller specifically says :slug
        const res = await axios.get(`${process.env.BASE_URL}/seller/${id}`);
        return NextResponse.json({ success: true, data: res.data });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: e.response?.status || 500 });
    }
}
