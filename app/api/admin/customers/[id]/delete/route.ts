import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getAuthToken, handleAxiosError } from '@/helpers/__helper'


export async function PATCH(
  req: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
  const { reason } = await req.json()
  const token = await getAuthToken()
const { id } = await context.params;
  try {
    const res = await axios.patch(
      `${process.env.BASE_URL}/users/${id}/delete`,
      { reason },
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