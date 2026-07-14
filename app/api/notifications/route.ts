import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${process.env.BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(handleAxiosError(error));
  }
}
