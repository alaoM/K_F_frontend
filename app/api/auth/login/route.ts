import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Sanitize the payload
        const payload = {
            email: body.email,
            password: body.password,
        };

        const response = await axios.post(
            `${process.env.BASE_URL}/auth/login`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        const backendData = response.data;

        // 2. MFA BRANCHING LOGIC
        // If the backend says MFA is required, we stop here and pass that info forward
        if (backendData.mfaRequired) {
             
            return NextResponse.json({
                success: true,
                mfaRequired: true,
                userId: backendData.userId
            }, { status: 200 });
        }

        // 3. STANDARD LOGIN BRANCHING
        // If we reach here, MFA is not enabled for this user.
        // We extract the tokens and user data.
        const { user, accessToken, refreshToken } = backendData;

       
        const frontendResponse = {
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isOnboarded: user.isOnboarded,
            },
            token: accessToken,
            refreshToken: refreshToken,
        };

        return NextResponse.json(frontendResponse, { status: 200 });

    } catch (error) {
        const axiosError = error as AxiosError<any>;
        console.error("Backend Auth Error:", axiosError.response?.data || axiosError.message);

        if (axiosError.response) {
            const status = axiosError.response.status;
            let message = axiosError.response.data?.message || "An error occurred during login";

            // Map specific errors for a better UI experience
            if (status === 401) message = "Invalid email or password";
            if (status === 403) message = "This account has been suspended";

            return NextResponse.json(
                { success: false, message },
                { status }
            );
        }

        return NextResponse.json(
            { success: false, message: "Authentication service is currently unreachable" },
            { status: 503 }
        );
    }
}