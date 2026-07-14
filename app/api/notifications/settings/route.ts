import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const token = await getAuthToken();
    const backendUrl = `${process.env.BASE_URL}/notifications/settings`;

    const response = await axios.get(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(handleAxiosError(error));
  }
}

export async function PATCH(req: Request) {
  try {
    const token = await getAuthToken();
    const body = await req.json();
    const backendUrl = `${process.env.BASE_URL}/notifications/settings`;

    const response = await axios.patch(backendUrl, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(handleAxiosError(error));
  }
}
