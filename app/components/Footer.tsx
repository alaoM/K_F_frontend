"use client"
import { Facebook, Twitter, Instagram, Youtube, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const recentPosts = [
        { title: "Future of Sustainable Fashion", slug: "future-of-sustainable-fashion", date: "May 16, 2026" },
        { title: "Summer Trends 2026", slug: "summer-trends-2026", date: "May 14, 2026" },
    ];

    const handleSubscribe = async () => {
        if (!email) return toast.error("Please enter an email address");
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Subscribed successfully!");
                setEmail("");
            } else {
                toast.error(data.message || "Subscription failed");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-white border-t border-gray-200 font-sans">
            {/* Newsletter */}
            <div className="border-b border-gray-200 bg-gray-50">
                <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-[#222222]">
                            Join Our Newsletter
                        </h3>
                        <p className="text-gray-400 mt-1 text-xs uppercase tracking-widest font-bold">
                            Get 20% off on your first purchase
                        </p>
                    </div>

                    <div className="w-full max-w-xl">
                        <div className="flex border border-gray-300 focus-within:border-[#222222] transition-colors rounded-none">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email.."
                                className="flex-1 px-5 py-3 outline-none text-xs font-medium bg-white rounded-none"
                                disabled={isSubmitting}
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={isSubmitting}
                                className="bg-[#222222] text-white px-8 uppercase text-xs font-bold tracking-[0.2em] hover:bg-[#f6c947] hover:text-[#222222] transition-colors disabled:opacity-50 rounded-none"
                            >
                                {isSubmitting ? "..." : "Subscribe"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Footer */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Logo & Follow Us */}
                    <div className="space-y-6">
                        <Link href="/">
                            <Image src="/logo.png" alt="F&K logo" width={180} height={60} className="object-contain" />
                        </Link>
                        <p className="text-gray-500 text-xs leading-relaxed font-medium">
                            Premium fashion and lifestyle marketplace. Discover curated collections from top verified digital storefronts.
                        </p>
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222]">Follow Us</h4>
                            <div className="flex gap-2">
                                <SocialIcon icon={<Facebook size={14} />} />
                                <SocialIcon icon={<Twitter size={14} />} />
                                <SocialIcon icon={<Instagram size={14} />} />
                                <SocialIcon icon={<Youtube size={14} />} />
                            </div>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className="lg:pl-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] mb-6">Shop</h4>
                        <ul className="space-y-3">
                            <li><FooterLink label="Shops" href="/shops" /></li>
                            <li><FooterLink label="Categories" href="/collections" /></li>
                            <li><FooterLink label="Blogs" href="/blog" /></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] mb-6">Company</h4>
                        <ul className="space-y-3">
                            <li><FooterLink label="Sell on F&K" href="/onboarding/become-a-seller" /></li>
                            <li><FooterLink label="About Us" href="/about" /></li>
                            <li><FooterLink label="Contact Us" href="/contact" /></li>
                            <li><FooterLink label="Privacy Policy" href="/privacy" /></li>
                            <li><FooterLink label="Terms & Conditions" href="/terms" /></li>
                        </ul>
                    </div>

                    {/* Blogpost Section */}
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] mb-6">Latest Blog</h4>
                        <div className="space-y-4">
                            {recentPosts.map((post, index) => (
                                <Link key={index} href={`/blog/${post.slug}`} className="group block">
                                    <h5 className="text-xs font-bold text-[#222222] group-hover:text-[#f6c947] transition-colors line-clamp-2 leading-tight mb-1">
                                        {post.title}
                                    </h5>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{post.date}</span>
                                </Link>
                            ))}
                            <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#222222] hover:text-[#f6c947] transition-colors pt-1">
                                View All Posts <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#f5f5f5] py-6 border-t border-gray-200">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <p>© {new Date().getFullYear()} F&K Fashion Hub. All Rights Reserved.</p>
                    <p>Powered by <span className="text-[#222222]">Xeeneey</span></p>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ label, href = "#" }: { label: string; href?: string }) {
    return (
        <Link href={href} className="text-xs text-gray-600 hover:text-[#f6c947] transition-colors font-medium uppercase tracking-wider">
            {label}
        </Link>
    );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <div className="w-8 h-8 border border-gray-200 flex items-center justify-center text-[#222222] hover:bg-[#222222] hover:text-[#f6c947] hover:border-[#222222] transition-all cursor-pointer rounded-none">
            {icon}
        </div>
    );
}
