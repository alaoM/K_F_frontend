import React from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

export default function FollowUs() {
    const images = [
        "/img/insta/home16-insta-1.jpg",
        "/img/insta/home16-insta-2.jpg",
        "/img/insta/home16-insta-3.jpg",
        "/img/insta/home16-insta-4.jpg",
        "/img/insta/home16-insta-5.jpg",
        "/img/insta/home16-insta-6.jpg"
    ];

    return (
        <section className="py-16 font-sans bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <span className="text-[#f6c947] text-[10px] font-bold uppercase tracking-[0.4em] mb-1 block">
                        Social Feed
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-tight">
                        #FollowUs
                    </h2>
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 mt-1">
                        Follow @fkstores On Instagram
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {images.map((img, i) => (
                        <div key={i} className="aspect-square relative group overflow-hidden bg-[#111111] border border-gray-100 cursor-pointer">
                            <Image
                                src={img}
                                alt={`Instagram post ${i + 1}`}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-90"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="w-10 h-10 bg-[#f6c947] text-[#111111] flex items-center justify-center transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 shadow-md">
                                    <Instagram size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
