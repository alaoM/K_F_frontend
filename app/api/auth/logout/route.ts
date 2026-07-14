import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { decrypt } from "@/secure/__enc";

export async function POST() {
    const cookieStore = await cookies();
    const enc_token = cookieStore.get("_tkn_")?.value;
    const token = enc_token ? decrypt(enc_token) : null;
    try {
        

       await axios.post(
            `${process.env.BASE_URL}/auth/logout`,
          
            {
                headers: { "Content-Type": "application/json", 
                      Authorization: `Bearer ${token}`,
                 },
            }
        );

        
       return NextResponse.json(
      {
        success: true,
        message: "User logged out successfully",
      },
      { status: 200 }
    );

    } catch (error) {
        const axiosError = error as AxiosError<any>;

      
      
        if (axiosError.response) {
            const message = "An error occurred";

            return NextResponse.json(
                { success: false, message },
               
            );
        }

        // Generic fallback for network errors/server crashes
        return NextResponse.json(
            { success: false, message: "Service temporarily unavailable" },
            { status: 500 }
        );
    }
}