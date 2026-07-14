import DashboardLayout from "../components/DashboardComponents/DashboardLayout";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className="min-h-screen bg-[#f9fafb] text-gray-900">
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
 
  );
}