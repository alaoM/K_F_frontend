import { AuthProvider } from "@/context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="w-full mx-auto">
        <Header />
        {children}
        <Footer />
      </div>
    </AuthProvider>
  );
}
