"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/helpers/functions';

export default function BlogListClient() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const mockPosts = [
        {
            title: "The Future of Sustainable Fashion in Digital Marketplaces",
            slug: "the-future-of-sustainable-fashion",
            excerpt: "Sustainable fashion is no longer just a trend; it's a necessity. As we move further into 2026...",
            date: "May 16, 2026",
            author: "fkstores",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
            category: "Sustainability"
        },
        {
            title: "Top 10 Fashion Trends for Summer 2026",
            slug: "top-10-fashion-trends",
            excerpt: "Discover the must-have styles and colors that will dominate the fashion scene this summer...",
            date: "May 14, 2026",
            author: "Admin",
            image: "https://images.unsplash.com/photo-1523381235208-2592a89034d8?w=1000&auto=format&fit=crop",
            category: "Fashion"
        }
    ];

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch('/api/blog');
                const data = await res.json();
                const realPosts = (Array.isArray(data) ? data : data.data || []).map((p: any) => ({
                    title: p.title,
                    slug: p.slug,
                    excerpt: p.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
                    date: formatDate(p.createdAt),
                    author: p.author?.fullName || 'Admin',
                    image: p.featuredImage || "/blog/placeholder.jpg",
                    category: p.tags?.[0] || 'General',
                    comments: p.comments?.length || 0
                }));
                // Merge real and mock (real first)
                setPosts([...realPosts, ...mockPosts]);
            } catch (err) {
                console.error(err);
                setPosts(mockPosts);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);


    return (
        <main className="min-h-screen bg-white font-poppins">
            {/* Header / Title Section */}
            <section className="bg-gray-50 py-24 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold text-[#222222] mb-6">Our Blog</h1>
                    <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                        <Link href="/" className="hover:text-[#f6c947] transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-gray-800">Blog</span>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
                        {posts.map((post, index) => (
                            <article key={index} className="group">
                                <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden mb-8">
                                    <Image
                                        fill
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Overlay for better text readability */}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500"></div>

                                    <div className="absolute top-6 left-6 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                                        {post.date}
                                    </div>
                                    <div className="absolute bottom-6 right-6 bg-[#f6c947] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                                        {post.category}
                                    </div>
                                </Link>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-300">
                                        <span>By {post.author}</span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                        <span>{post.comments} Comments</span>
                                    </div>
                                    <h2 className="text-2xl font-playfair font-bold text-[#222222] group-hover:text-[#f6c947] transition-colors leading-tight">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h2>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-[#222222] border-b-2 border-[#222222] pb-1 hover:text-[#f6c947] hover:border-[#f6c947] transition-all"
                                    >
                                        Read More
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-20 flex justify-center gap-2">
                        {[1, 2, 3].map((page) => (
                            <button
                                key={page}
                                className={`w-12 h-12 flex items-center justify-center border text-[11px] font-bold transition-all ${page === 1
                                    ? 'bg-[#222222] text-white border-[#222222]'
                                    : 'border-gray-100 text-gray-400 hover:border-[#222222] hover:text-[#222222]'
                                    }`}
                            >
                                {page.toString().padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
