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
        <section className="py-10 bg-[#f9f9f9] font-sans border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-[#f6c947] text-[10px] font-bold uppercase tracking-[0.4em] mb-1 block">Editorial</span>
                        <h2 className="text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-tight">Latest Stories</h2>
                    </div>
                    <Link href="/blog" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#222222] border-b-2 border-[#222222] pb-1 hover:text-[#f6c947] hover:border-[#f6c947] transition-all">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posts.map((post, index) => (
                        <div key={index} className="bg-white group rounded-none border border-gray-200 hover:border-[#222222] transition-all duration-300 overflow-hidden flex flex-col">
                            <Link href={`/blog/${post.slug}`} className="block relative h-40 md:h-44 overflow-hidden">
                                <Image
                                    fill
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3 bg-[#222222] text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-none">
                                    {post.date}
                                </div>
                            </Link>
                            <div className="p-5 flex flex-col flex-1 justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wide mb-2 group-hover:text-[#f6c947] transition-colors line-clamp-1">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal mb-4">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <Link href={`/blog/${post.slug}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#222222] flex items-center gap-2 group/link">
                                    Read Article
                                    <span className="w-4 h-[1.5px] bg-[#222222] transition-all group-hover/link:w-7 group-hover/link:bg-[#f6c947]"></span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
