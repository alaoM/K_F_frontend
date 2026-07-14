import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { status: false, message: "Access token is required" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files"); 

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: false, message: "No files provided" },
        { status: 400 }
      );
    }

   const uploadForm = new FormData();
    files.forEach((file) => {
     uploadForm.append("files", file); 
    });

    
    const backendUrl = `${process.env.BASE_URL}/upload/bulk`; 

    const response = await axios.post(backendUrl, uploadForm, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Upload Error:", error);
    const errorResult = handleAxiosError(error);
    return NextResponse.json(errorResult);
  }
}