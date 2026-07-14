"use client"

import { EyeIcon, Heart, StarHalfIcon, StarIcon } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"

const TABS = ["Jackets", "Jeans", "Pants", "Shirts", "T-shirts"]

const PRODUCTS = {
    "T-shirts": [
        {
            id: 1,
            name: "Flowy shirt",
            price: 25,
            oldPrice: 32,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 2,
            name: "Denim overshirt",
            price: 55,
            oldPrice: 75,
            image1: "/slides/cat2.jpg",
            image2: "/slides/cat3.jpg",
        },
        {
            id: 3,
            name: "Linen shirt",
            price: 20,
            oldPrice: 30,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 4,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat3.jpg",
            image2: "/slides/home1-banner-2.jpg",
        },
        {
            id: 5,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat1.jpg",
            image2: "/slides/home1-banner-2.jpg",
        },
        {
            id: 6,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/home7-bigbanner1.jpg",
            image2: "/slides/cat3.jpg",
        },
    ],
    "Jeans": [
        {
            id: 1,
            name: "Flowy shirt",
            price: 25,
            oldPrice: 32,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 2,
            name: "Denim overshirt",
            price: 55,
            oldPrice: 75,
            image1: "/slides/cat2.jpg",
            image2: "/slides/cat3.jpg",
        },
        {
            id: 3,
            name: "Linen shirt",
            price: 20,
            oldPrice: 30,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 4,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat3.jpg",
            image2: "/slides/home1-banner-2.jpg",
        },
        {
            id: 5,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat1.jpg",
            image2: "/slides/home1-banner-2.jpg",
        },
        {
            id: 6,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/home7-bigbanner1.jpg",
            image2: "/slides/cat3.jpg",
        },
    ],
    "Shirts": [
        {
            id: 1,
            name: "Flowy shirt",
            price: 25,
            oldPrice: 32,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 2,
            name: "Denim overshirt",
            price: 55,
            oldPrice: 75,
            image1: "/slides/cat2.jpg",
            image2: "/slides/cat3.jpg",
        },
        {
            id: 3,
            name: "Linen shirt",
            price: 20,
            oldPrice: 30,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 4,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat3.jpg",
            image2: "/slides/home1-banner-2.jpg",
        },
        {
            id: 5,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat1.jpg",
            image2: "/slides/home1-banner-2.jpg",
        },
        {
            id: 6,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/home7-bigbanner1.jpg",
            image2: "/slides/cat3.jpg",
        },
    ],
    "Pants": [
        {
            id: 1,
            name: "Flowy shirt",
            price: 25,
            oldPrice: 32,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 2,
            name: "Denim overshirt",
            price: 55,
            oldPrice: 75,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 3,
            name: "Linen shirt",
            price: 20,
            oldPrice: 30,
            image1: "/slides/home1-banner-2.jpg",
            image2: "/slides/cat1.jpg",
        },
        {
            id: 4,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat2.jpg",
            image2: "/slides/cat3.jpg",
        },
        {
            id: 5,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat2.jpg",
            image2: "/slides/cat3.jpg",
        },
        {
            id: 6,
            name: "Print t-shirt",
            price: 20,
            oldPrice: 25,
            image1: "/slides/cat2.jpg",
            image2: "/slides/cat3.jpg",
        },
    ]

}

const FashionProducts = () => {
    const [activeTab, setActiveTab] = useState("T-shirts")
    const scrollRef = useRef(null)

    const scroll = direction => {
        if (!scrollRef.current) return
        scrollRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        })
    }

    return (
        <section className="py-20 bg-[#faf7f2]">
            <div className="w-full mx-auto px-20">

                {/* Header */}

                <div className="flex flex-col items-center justify-center mb-10">
                    <p className="text-center  uppercase text-[16px] text-[#8c6b42] font-600 border-b-2 border-[#8c6b42] leading-tight">Clothes</p>
                    <h2 className="text-[50px] text=[#333333] font-[--font-playfair] mt-5 font-600 transform-none leading-none"> Fashion product</h2>
                </div>


                {/* Tabs */}
                <div className="flex justify-center gap-6 mb-17.5 overflow-x-auto border-b-2 border-[#e2e2e2]">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-16 font-600 uppercase tracking-wide pb-1  transition p ${activeTab === tab
                                ? "border-b-2 border-yellow-500 text-yellow-600"
                                : ""
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Scroll buttons */}
                <div className="relative">
                    <button
                        onClick={() => scroll("left")}
                        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow items-center justify-center"
                    >
                        ←
                    </button>

                    <button
                        onClick={() => scroll("right")}
                        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow items-center justify-center"
                    >
                        →
                    </button>

                    {/* Products */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
                    >
                        {PRODUCTS[activeTab]?.map(product => (
                            <div
                                key={product.id}
                                className="min-w-90 bg-white"
                            >
                                {/* Image */}
                                <div className="relative h-[460px] bg-[#f2eee9] flex items-center justify-center overflow-hidden group">
                                    <span className="absolute top-5 left-5 z-20 text-[10px] uppercase bg-[#9c7c5b] text-white px-3 py-1">
                                        New
                                    </span>

                                    {/* Base image */}
                                    <Image
                                        height={500}
                                        width={450}
                                        src={product.image1}
                                        alt={product.name}
                                        className="absolute inset-0 h-full w-full object-cover
               transition-all duration-500 ease-out
               group-hover:opacity-0 group-hover:scale-105"
                                    />

                                    {/* Hover image with blur */}
                                    <Image
                                        height={500}
                                        width={450}
                                        src={product.image2}
                                        alt={product.name}
                                        className="absolute inset-0 h-full w-full object-cover
               opacity-0 blur-sm scale-110
               transition-all duration-700 ease-out
               group-hover:opacity-100 group-hover:blur-0 group-hover:scale-100"
                                    />
                                </div>


                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-sm font-medium mb-2 p-2">
                                        {product.name}
                                    </h3>


                                    <div className="flex items-center justify-between">


                                        <div className="flex items-center gap-2 text-sm px-2 pb-1">
                                            <span className="text-yellow-600 font-semibold">
                                                ${product.price.toFixed(2)}
                                            </span>
                                            <span className="line-through text-gray-400">
                                                ${product.oldPrice.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex">
                                            <StarIcon size={16} fill="text-yellow-600" />
                                            <StarIcon size={16} fill="text-yellow-600" />
                                            <StarIcon size={16} fill="text-yellow-600" />
                                            <StarIcon size={16} fill="text-yellow-600" />
                                            <StarIcon size={16} />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex gap-2">
                                            <Heart size={16} />
                                            <EyeIcon size={16} />

                                        </div>


                                        <button className="mt-3 text-xs uppercase tracking-wide text-gray-600 hover:text-black underline">
                                            Add to cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* View all */}
                <div className="flex justify-center mt-10">
                    <button className="px-6 py-2 text-xs uppercase tracking-widest bg-yellow-400 text-black hover:bg-yellow-500 transition">
                        View all
                    </button>
                </div>

            </div>
        </section>
    )
}

export default FashionProducts
