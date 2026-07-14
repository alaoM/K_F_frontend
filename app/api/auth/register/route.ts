import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

interface RegisterRequestBody {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  location: string;
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();

  
    if (!body.fullName || !body.email || !body.password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const payload = {
      fullName: body.fullName.trim(),
      email: body.email.toLowerCase().trim(),
      password: body.password,
      phoneNumber: body.phoneNumber,
      address: body.address,
      location: body.location 
    };

    
    const response = await axios.post(
      `${process.env.BASE_URL}/auth/register`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
 
    return NextResponse.json(response.data, { status: 201 });

  } catch (error) {
    const axiosError = error as AxiosError<any>;

    // 🔒 Log safely (server-only)
    console.error(
      "Register API error:",
      axiosError.response?.data || axiosError.message
    );

    if (axiosError.response) {
      const status = axiosError.response.status;

      // ✅ Map backend errors to frontend-safe messages
      let message = "Registration failed";

      if (status === 409) {
        message = "User already exists";
      } else if (status === 400) {
        message = "Invalid registration data";
      }

      return NextResponse.json(
        { success: false, message },
        { status }
      );
    }

    return NextResponse.json(
      { success: false, message: "Service temporarily unavailable" },
      { status: 500 }
    );
  }
}
