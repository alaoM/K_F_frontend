import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();

 


    // 3. Call backend verification endpoint
  const response =   await axios.post(
      `${process.env.BASE_URL}/auth/forgot-password`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

   
    return NextResponse.json(
      {
        success: true,
        message: response.data.message || "If the email exists, a reset link was sent",
      },
      { status: 200 }
    );

  } catch (error) {
    const axiosError = error as AxiosError<any>;

    // Server-side logging ONLY
    

     

    // Network / backend unavailable
    return NextResponse.json(
      {
        success: false,
        message: "Forgot password service temporarily unavailable",
      },
      { status: 503 }
    );
  }
}
