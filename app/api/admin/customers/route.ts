import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuthToken, handleAxiosError } from "@/helpers/__helper";

 
export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken();
    const { searchParams } = new URL(req.url);

    const response = await axios.get(
      `${process.env.BASE_URL}/users`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: searchParams.get('page'),
          limit: searchParams.get('limit'),
          search: searchParams.get('search'),
          role: searchParams.get('role'),
          status: searchParams.get('status'),
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return handleAxiosError(error);
  }
}

// UPDATE SETTINGS
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const action = searchParams.get('action');
  const id = searchParams.get('id');

  if (!id || !action) {
    return NextResponse.json(
      { message: 'Missing id or action' },
      { status: 400 }
    );
  }

  try {
    const token = await getAuthToken();

    let response;

    if (action === 'delete') {
      response = await axios.delete(
        `${process.env.BASE_URL}/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      response = await axios.patch(
        `${process.env.BASE_URL}/users/${id}/${action}`,
        {}, // no request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    return handleAxiosError(error);
  }
}