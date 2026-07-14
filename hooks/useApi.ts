import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

export const useApi = () => {
    const { logout } = useAuth();

    const fetcher = useCallback(async (url: string, options: RequestInit = {}) => {
        let response = await fetch(url, options);

        // 1. If we get a 401, try to refresh
        if (response.status === 401 && !url.includes('/api/auth/login')) {
            const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });

            if (refreshRes.ok) {
                
                response = await fetch(url, options);
            } else {
                
                logout(true);
                throw new Error("Session expired. Please login again.");
            }
        }

        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;  
    }, [logout]);

    return fetcher;
};