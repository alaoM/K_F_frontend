import { getAuthToken, handleAxiosError } from "@/helpers/__helper";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
 
  try {
    const formData = await req.formData();
    const file = formData.get("file");
     const token = await getAuthToken();



    if (!file) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: "File is required",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        {
          status: false,
          code: 401,
          message: "Access token is required",
          data: null,
        },
        { status: 401 }
      );
    }

    const uploadForm = new FormData();
    uploadForm.append("image", file);

    const backendUrl = `${process.env.BASE_URL}/upload/image`;

    const response = await axios.post(backendUrl, uploadForm, {
      headers: {
         Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },

    }); 

  
 

    return NextResponse.json(response.data);
  } catch (error) {

    const errorResult = handleAxiosError(error);
    return NextResponse.json(errorResult);

  }
}