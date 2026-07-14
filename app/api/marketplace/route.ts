import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleAxiosError } from "@/helpers/__helper";

export async function GET(request: NextRequest) {
    try {
       
        const { searchParams } = new URL(request.url);
        
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const location = searchParams.get("location");
        const sortBy = searchParams.get("sortBy");
        const limit = searchParams.get("limit");
        const offset = searchParams.get("offset");

        
        const queryParams = {
            ...(search && { search }),
            ...(category && { category }),
            ...(minPrice && { minPrice: Number(minPrice) }),
            ...(maxPrice && { maxPrice: Number(maxPrice) }),
            ...(location && { location }),
            ...(sortBy && { sortBy }),
            ...(limit && { limit: Number(limit) }),
            ...(offset && { offset: Number(offset) }),
        };

        // 3. Call the NestJS backend
        const response = await axios.get(`${process.env.BASE_URL}/products`, {
         params: queryParams,
            headers: {
                "Content-Type": "application/json",
            }
        });


        // 4. Return the data to the frontend
        return NextResponse.json(response.data);
        
    } catch (error) {
         
        return handleAxiosError(error);
    }
}