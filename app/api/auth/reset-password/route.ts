import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { decrypt } from "@/secure/__enc";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cookieStore = await cookies();

    const enc_email = cookieStore.get("u_mail")?.value;
    const email = enc_email ? decrypt(enc_email) : null;

    // 1. Validate input early
    if (!body?.token) {
      return NextResponse.json(
        { success: false, message: "Verification token is required" },
        { status: 400 }
      );
    }

    // 2. Sanitize payload
    const payload = {
      email: email,
      token: body.token,
      newPassword: body.newPassword,
    };

    // 3. Call backend verification endpoint
    await axios.post(
      `${process.env.BASE_URL}/auth/reset-password`,
      payload,
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
        message: "Password reset successful",
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
