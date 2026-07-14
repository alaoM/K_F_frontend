import Link from 'next/link'
import React from 'react'
import PriceSlider from './PriceSlider'

const Categories = () => {
    return (
        <div className='space-y-6'>

            <h2 className='font-semibold text-md'>Categories</h2>
            <div className='flex flex-col gap-4 w-full pb-10 border-b border-[#e2e2e2]'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-md text-gray-500'>
                        <input type="checkbox" className='w-4 h- accent-[#f6c947] border-[#e2e2e2] rounded-xl' />
                        <span >All</span>
                    </div>
                    <span className=' text-gray-500'>(12)</span>
                </div>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-md text-gray-500'>
                        <input type="checkbox" className='w-4 h- accent-[#f6c947] border-[#e2e2e2] rounded-xl' />
                        <span >Egyptian Abaya</span>
                    </div>
                    <span className=' text-gray-500'>(12)</span>
                </div>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-md text-gray-500'>
                        <input type="checkbox" className='w-4 h- accent-[#f6c947] border-[#e2e2e2] rounded-xl' />
                        <span >London Abaya</span>
                    </div>
                    <span className=' text-gray-500'>(12)</span>
                </div>


            </div>

            <div className='border-b border-[#e2e2e2] pb-8 space-y-4'>
                <h2 className='font-semibold text-md'>Filter</h2>
                <p>23 products</p>
            </div>

            <div className='border-b border-[#e2e2e2] pb-8 space-y-4'>
               <PriceSlider/>
            </div>

        </div>
    )
}

export default Categories