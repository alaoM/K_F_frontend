import DashboardLayout from "../components/DashboardComponents/DashboardLayout";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthProvider>
  );
}