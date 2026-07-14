"use client"
import React, { useEffect, useState } from 'react';
import { User, MessageSquare, Facebook, Twitter, Linkedin, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/helpers/functions';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export default function BlogDetailPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);
    
    const [commentData, setCommentData] = useState({
        name: '',
        email: '',
        content: ''
    });
    const [submittingComment, setSubmittingComment] = useState(false);

    // Sync user info to comment form
    useEffect(() => {
        if (user) {
            setCommentData(prev => ({
                ...prev,
                name: user.fullName || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentData.name || !commentData.email || !commentData.content) {
            return toast.error("Please fill in all required fields");
        }
        
        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/blog/slug/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Comment submitted successfully!");
                // Update local post state to show new comment immediately
                if (post) {
                    const newComment = {
                        ...data,
                        createdAt: new Date().toISOString() // Fallback if backend doesn't return it
                    };
                    setPost({
                        ...post,
                        comments: [newComment, ...(post.comments || [])]
                    });
                }
                setCommentData(prev => ({ ...prev, content: '' }));
            } else {
                toast.error(data.message || "Failed to submit comment");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setSubmittingComment(false);
        }
    };

    const dummypost = {
        title: "The Future of Sustainable Fashion in Digital Marketplaces",
        author: "Spacing Tech",
        date: "May 16, 2026",
        comments: 12,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        content: `
            <p className="text-gray-600 leading-relaxed mb-6">
                Sustainable fashion is no longer just a trend; it's a necessity. As we move further into 2026, the digital marketplace landscape is evolving to prioritize eco-friendly brands and transparent supply chains. Consumers are increasingly demanding accountability from the brands they support.
            </p>
        `,
        tags: ["Fashion", "Sustainability", "Digital", "Tech"],
    };

    const dummyrecentPosts = [
        { title: "Top 10 Fashion Trends for Summer 2026", date: "May 14, 2026", image: "https://images.unsplash.com/photo-1523381235208-2592a89034d8?w=500&auto=format&fit=crop" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current post
                const res = await fetch(`/api/blog/slug/${slug}`);
                const data = await res.json();

                if (data && data.title) {
                    setPost({
                        title: data.title,
                        author: data.author?.fullName || 'Admin',
                        date: formatDate(data.createdAt),
                        comments: data.comments || [],
                        image: data.featuredImage || "/blog/placeholder.jpg",
                        content: data.content,
                        tags: data.tags || []
                    });
                } else {
                    setPost(dummypost);
                }

                // Fetch recent posts for sidebar
                const recentRes = await fetch('/api/blog');
                const recentData = await recentRes.json();
                const mappedRecent = (Array.isArray(recentData) ? recentData : recentData.data || []).map((p: any) => ({
                    title: p.title,
                    slug: p.slug,
                    date: formatDate(p.createdAt),
                    image: p.featuredImage || "/blog/placeholder.jpg"
                }));
                setRecentPosts(mappedRecent.length > 0 ? mappedRecent.slice(0, 3) : dummyrecentPosts);
            } catch (err) {
                console.error(err);
                setPost(dummypost);
                setRecentPosts(dummyrecentPosts);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-[#f6c947] rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-black text-[#243e6b] uppercase">Post Not Found</h1>
                <Link href="/blog" className="text-[#f6c947] font-bold uppercase tracking-widest text-xs border-b border-[#f6c947]">Back to Blog</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white font-poppins">
            {/* Breadcrumb */}
            <div className="bg-gray-50 py-4 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <nav className="flex text-xs font-bold uppercase tracking-widest text-gray-400">
                        <Link href="/" className="hover:text-[#f6c947] transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/blog" className="hover:text-[#f6c947] transition-colors">Blog</Link>
                        <span className="mx-2 text-gray-200">/</span>
                        <span className="text-gray-800 truncate max-w-[200px] md:max-w-none">{post.title}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        <article>
                            {/* Featured Image */}
                            <div className="relative aspect-[16/9] overflow-hidden mb-8 group">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Overlay for better text readability */}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500"></div>

                                <div className="absolute top-6 left-6 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                                    {post.date}
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-6 mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-[#f6c947]" />
                                    <span>By {post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={14} className="text-[#f6c947]" />
                                    <span>{Array.isArray(post.comments) ? post.comments.length : post.comments} Comments</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-[#222222] mb-8 leading-tight">
                                {post.title}
                            </h1>

                            {/* Content */}
                            <div
                                className="prose prose-lg max-w-none mb-12"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-10 pt-10 border-t border-gray-100">
                                {post.tags.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-4 py-1.5 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-[#f6c947] hover:text-white transition-all cursor-pointer border border-gray-100"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Share */}
                            <div className="flex items-center gap-4 py-8 border-t border-b border-gray-100 mb-12">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#222222]">Share:</span>
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 flex items-center justify-center border border-gray-100 hover:bg-[#f6c947] hover:text-white hover:border-[#f6c947] transition-all"><Facebook size={16} /></button>
                                    <button className="w-10 h-10 flex items-center justify-center border border-gray-100 hover:bg-[#f6c947] hover:text-white hover:border-[#f6c947] transition-all"><Twitter size={16} /></button>
                                    <button className="w-10 h-10 flex items-center justify-center border border-gray-100 hover:bg-[#f6c947] hover:text-white hover:border-[#f6c947] transition-all"><Linkedin size={16} /></button>
                                    <button className="w-10 h-10 flex items-center justify-center border border-gray-100 hover:bg-[#f6c947] hover:text-white hover:border-[#f6c947] transition-all"><Link2 size={16} /></button>
                                </div>
                            </div>

                            {/* Comments Section (Simplified) */}
                            <div className="mb-16">
                                <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-[#222222] mb-10 pb-4 border-b-2 border-gray-100 inline-block">
                                    Comments ({post.comments?.length || 0})
                                </h3>
                                <div className="space-y-8">
                                    {Array.isArray(post.comments) && post.comments.map((comment: any, index: number) => (
                                        <div key={comment.id || index} className="flex gap-6">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-gray-400">
                                                {comment.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#222222]">{comment.name}</h4>
                                                    <span className="text-[10px] font-bold text-gray-300">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!post.comments || post.comments.length === 0) && (
                                        <p className="text-gray-400 text-sm italic uppercase tracking-widest font-bold">No comments yet. Be the first to share your thoughts!</p>
                                    )}
                                </div>
                            </div>

                            {/* Comment Form */}
                            <div className="bg-gray-50 p-10 rounded-sm">
                                <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-[#222222] mb-10">Leave a comment</h3>
                                <form className="space-y-6" onSubmit={handleCommentSubmit}>
                                    {!user && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Name *</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-6 py-4 bg-white border border-gray-100 outline-none focus:border-[#f6c947] transition-colors text-sm" 
                                                    placeholder="Your Name"
                                                    value={commentData.name}
                                                    onChange={(e) => setCommentData({ ...commentData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email address *</label>
                                                <input 
                                                    type="email" 
                                                    className="w-full px-6 py-4 bg-white border border-gray-100 outline-none focus:border-[#f6c947] transition-colors text-sm" 
                                                    placeholder="Your Email"
                                                    value={commentData.email}
                                                    onChange={(e) => setCommentData({ ...commentData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {user && (
                                        <div className="mb-6">
                                            <p className="text-xs text-gray-500 italic">
                                                Commenting as <span className="font-bold text-[#222222]">{user.fullName || user.email}</span>
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message *</label>
                                        <textarea 
                                            rows={5} 
                                            className="w-full px-6 py-4 bg-white border border-gray-100 outline-none focus:border-[#f6c947] transition-colors text-sm" 
                                            placeholder="Your Message"
                                            value={commentData.content}
                                            onChange={(e) => setCommentData({ ...commentData, content: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={submittingComment}
                                        className="bg-[#222222] text-white px-12 py-4 uppercase text-xs font-bold tracking-[0.25em] hover:bg-[#f6c947] transition-colors disabled:opacity-50"
                                    >
                                        {submittingComment ? "Submitting..." : "Post Comment"}
                                    </button>
                                </form>
                            </div>
                        </article>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <aside className="sticky top-24 space-y-12">
                            {/* Recent Posts */}
                            <div className="p-8 border border-gray-100 rounded-sm">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#222222] mb-8">Recent Posts</h4>
                                <div className="space-y-8">
                                    {recentPosts.map((post, index) => (
                                        <Link key={index} href={`/blog/${post.slug}`} className="flex gap-4 group cursor-pointer">
                                            <div className="w-20 h-20 overflow-hidden flex-shrink-0">
                                                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="text-[13px] font-bold text-[#222222] leading-tight group-hover:text-[#f6c947] transition-colors line-clamp-2">
                                                    {post.title}
                                                </h5>
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{post.date}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Categories (Placeholder) */}
                            <div className="p-8 border border-gray-100 rounded-sm">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#222222] mb-6">Categories</h4>
                                <ul className="space-y-4">
                                    {["Fashion", "Technology", "Lifestyle", "Business", "Sustainability"].map((cat, i) => (
                                        <li key={i} className="flex justify-between items-center group cursor-pointer">
                                            <span className="text-sm text-gray-500 group-hover:text-[#f6c947] transition-colors">{cat}</span>
                                            <span className="text-[10px] font-bold text-gray-300">({Math.floor(Math.random() * 20) + 5})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}
