import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

// GET One Product
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const response = await axios.get(
      `${process.env.BASE_URL}/products/${id}`,
      
    );

    return NextResponse.json(response.data);
  } catch (e) {
   handleAxiosError(e)
  }
}

// PATCH: Update Product
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const token = await getAuthToken();
    const body = await request.json();

    const response = await axios.patch(
      `${process.env.BASE_URL}/products/${id}`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
     handleAxiosError(error)
  }
}

// DELETE: Remove Product
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const token = await getAuthToken();

    await axios.delete(
      `${process.env.BASE_URL}/products/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
      handleAxiosError(error)
  }
}
