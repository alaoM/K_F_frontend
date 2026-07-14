import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
    title: string;
    slug: string;
    date: string;
    image: string;
    excerpt: string;
}

export default function BlogSection({ posts }: { posts: BlogPost[] }) {
    return (
        <section className="py-24 bg-[#f9f9f9] font-poppins">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="text-left">
                        <span className="text-[#f6c947] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Editorial</span>
                        <h2 className="text-4xl font-playfair font-bold text-[#222222]">Latest From Blog</h2>
                    </div>
                    <Link href="/blog" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] border-b-2 border-[#222222] pb-1 hover:text-[#f6c947] hover:border-[#f6c947] transition-all">
                        View All Stories
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <div key={index} className="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                            <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                                <Image
                                fill
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                    {post.date}
                                </div>
                            </Link>
                            <div className="p-8">
                                <h3 className="text-lg font-bold text-[#222222] mb-4 group-hover:text-[#f6c947] transition-colors line-clamp-2 leading-tight">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </h3>
                                <p className="text-xs text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">
                                    {post.excerpt}
                                </p>
                                <Link href={`/blog/${post.slug}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#222222] flex items-center gap-2 group/link">
                                    Read More
                                    <span className="w-4 h-[1px] bg-[#222222] transition-all group-hover/link:w-8 group-hover/link:bg-[#f6c947]"></span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
