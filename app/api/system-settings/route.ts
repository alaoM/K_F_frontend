import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${process.env.BASE_URL}/system-settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleAxiosError(error);
  }
}

export async function POST(req: Request) {
  try {
    const token = await getAuthToken();
    const body = await req.json();
    const response = await axios.post(`${process.env.BASE_URL}/system-settings`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleAxiosError(error);
  }
}
