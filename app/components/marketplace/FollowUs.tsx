import React from 'react';
import { Instagram } from 'lucide-react';

export default function FollowUs() {
    const images = [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539109132384-36255677a235?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1475184444157-7cdf96f86641?w=500&auto=format&fit=crop"
    ];

    return (
        <section className="py-24 font-poppins">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-playfair font-bold text-[#222222] mb-2">#FollowUs</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400">On Instagram</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {images.map((img, i) => (
                        <div key={i} className="aspect-square relative group overflow-hidden cursor-pointer">
                            <img 
                                src={img} 
                                alt={`Instagram ${i}`} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#222222] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <Instagram size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
