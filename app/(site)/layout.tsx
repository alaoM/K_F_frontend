import { AuthProvider } from "@/context/AuthContext";
// import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

async function getCategories() {
  try {
    const baseUrl = process.env.BASE_URL || "https://api.fkstores.com";
    const res = await fetch(`${baseUrl}/categories`, {
      next: { revalidate: 300, tags: ['categories'] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : json?.data || [];
  } catch (err) {
    console.error("Failed to fetch layout categories on server:", err);
    return [];
  }
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <AuthProvider>
      <div className="w-full mx-auto">
        {/* <Header /> */}
        <Navbar initialCategories={categories} />
        {children}
        <Footer />
      </div>
    </AuthProvider>
  );
}

