import { getAuthToken, handleAxiosError } from "@/helpers/__helper"
import axios from "axios"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  _req: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
  const token = await getAuthToken()
const { id } = await context.params;
  try {
    const res = await axios.patch(
      `${process.env.BASE_URL}/users/${id}/restore`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return NextResponse.json(res.data)
  } catch (err) {
    return handleAxiosError(err)
  }
}