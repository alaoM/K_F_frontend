import Link from 'next/link'
import React from 'react'
import PriceSlider from './PriceSlider'

const Categories = () => {
    return (
        <div className='space-y-6'>

            <h2 className='font-bold text-xs uppercase tracking-wider text-[#111111]'>Categories</h2>
            <div className='flex flex-col gap-4 w-full pb-10 border-b border-gray-200'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-xs text-gray-700'>
                        <input type="checkbox" className='w-4 h-4 accent-[#f6c947] border-gray-300 rounded-none' />
                        <span>All</span>
                    </div>
                    <span className='text-xs text-gray-400'>(12)</span>
                </div>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-xs text-gray-700'>
                        <input type="checkbox" className='w-4 h-4 accent-[#f6c947] border-gray-300 rounded-none' />
                        <span>Egyptian Abaya</span>
                    </div>
                    <span className='text-xs text-gray-400'>(12)</span>
                </div>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-xs text-gray-700'>
                        <input type="checkbox" className='w-4 h-4 accent-[#f6c947] border-gray-300 rounded-none' />
                        <span>London Abaya</span>
                    </div>
                    <span className='text-xs text-gray-400'>(12)</span>
                </div>
            </div>

            <div className='border-b border-gray-200 pb-8 space-y-4'>
                <h2 className='font-bold text-xs uppercase tracking-wider text-[#111111]'>Filter</h2>
                <p className="text-xs text-gray-500">23 products</p>
            </div>

            <div className='border-b border-gray-200 pb-8 space-y-4'>
               <PriceSlider/>
            </div>

        </div>
    )
}

export default Categories