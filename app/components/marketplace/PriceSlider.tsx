'use client';
import { useState } from "react";

const PriceSlider = () => {
  const minPrice = 0;
  const maxPrice = 89;

  const [minVal, setMinVal] = useState(minPrice);
  const [maxVal, setMaxVal] = useState(maxPrice);

  const handleMinChange = (e:any) => {
    const value = Math.min(Number(e.target.value), maxVal - 1);
    setMinVal(value);
  };

  const handleMaxChange = (e:any) => {
    const value = Math.max(Number(e.target.value), minVal + 1);
    setMaxVal(value);
  };

  const resetValues = () => {
    setMinVal(minPrice);
    setMaxVal(maxPrice);
  };

  const minPercent = ((minVal - minPrice) / (maxPrice - minPrice)) * 100;
  const maxPercent = ((maxVal - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div className="w-full ">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-gray-800">Price</h3>
        <button
          onClick={resetValues}
          className="text-sm text-gray-500 hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Highest Price */}
      <p className="text-sm text-gray-500 mb-4">
        The highest price is ${maxPrice.toFixed(2)}
      </p>

      {/* Slider */}
      <div className="relative w-full h-6">

        {/* Slider Track */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-300"></div>

        {/* Active Range */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-black rounded"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        ></div>  

        {/* Min Range */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={minVal}
          onChange={handleMinChange}
          className="absolute w-full top-1/2 transform -translate-y-1/2 appearance-none pointer-events-none"
          style={{ zIndex: minVal > maxPrice - 100 ? "5" : undefined }}
        />

        {/* Max Range */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute w-full top-1/2 transform -translate-y-1/2 appearance-none pointer-events-none"
        />

        {/* Thumb styling */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            pointer-events: all;
            width: 14px;
            height: 14px;
            background: black;
            border-radius: 50%;
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            pointer-events: all;
            width: 16px;
            height: 16px;
            background: black;
            border-radius: 20%;
            cursor: pointer;
          }
        `}</style>
      </div>

      {/* Inputs */}
      <div className="flex items-center gap-2 mt-4">
        
        <div className="flex items-center border border-[#e2e2e2] rounded-lg px-3 py-2 w-full">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            value={minVal}
            onChange={(e) => handleMinChange(e)}
            className="w-full outline-none ml-1"
          />
        </div>

        <span className="text-gray-400">-</span>

        <div className="flex items-center border border-[#e2e2e2] rounded-lg px-3 py-2 w-full">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            value={maxVal}
            onChange={(e) => handleMaxChange(e)}
            className="w-full outline-none ml-1"
          />
        </div>

      </div>
    </div>
  );
}

export default PriceSlider;