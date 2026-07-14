import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();

  
    // 3. Call backend verification endpoint
    await axios.post(
      `${process.env.BASE_URL}/auth/resend-verification`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );


    // 4. Return success (do NOT leak backend response object)
    return NextResponse.json(
      {
        success: true,
        message: "Verification Email sent successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    const axiosError = error as AxiosError<any>;

    // Server-side logging ONLY
    console.error(
      "Email verification error:",
      axiosError.response?.data || axiosError.message
    );

    // 5. Error mapping (verification-specific)
    if (axiosError.response) {
      const status = axiosError.response.status;
      let message = "Email verification failed";

      if (status === 400) {
        message = "Invalid verification request";
      } else if (status === 401) {
        message = "Invalid or expired verification link";
      } else if (status === 409) {
        message = "Email already verified";
      } else if (status === 429) {
        message = "Too many attempts. Please try again later";
      }

      return NextResponse.json(
        { success: false, message },
        { status }
      );
    }

    // Network / backend unavailable
    return NextResponse.json(
      {
        success: false,
        message: "Verification service temporarily unavailable",
      },
      { status: 503 }
    );
  }
}
