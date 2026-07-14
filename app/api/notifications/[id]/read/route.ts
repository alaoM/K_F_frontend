import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthToken();
    const { id } = params;
    const backendUrl = `${process.env.BASE_URL}/notifications/${id}/read`;

    const response = await axios.patch(backendUrl, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(handleAxiosError(error));
  }
}
