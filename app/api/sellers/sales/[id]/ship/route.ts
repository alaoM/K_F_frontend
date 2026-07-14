import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

export async function PATCH(
    request: NextRequest,
  context: { params: Promise<{ id: string }> }

) {
    try {
          const { id } = await context.params;
 
        const token = await getAuthToken();

        const response = await axios.patch(
            `${process.env.BASE_URL}/orders/sales/${id}/ship`, 
            {},  
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );



        return NextResponse.json({ success: true, data: response.data });
    } catch (error) {
        console.log(error)
        return handleAxiosError(error);
    }
}