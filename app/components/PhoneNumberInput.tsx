"use client";

import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
 

interface PhoneNumberInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  defaultCountry?: string;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
 
  value,
  onChange,
  error,
  defaultCountry = "NG",
}) => {
  return (
    <div className="w-full">
      
      <div
        className={`
          relative flex items-center
          rounded-lg border bg-white p-3
          ${error ? "border-red-500" : "border-gray-300"}
          focus-within:border-primary-500
          focus-within:ring-1
          focus-within:ring-primary-500
        `}
      >
        {/* Left Icon */}
       {/*  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
          <Phone size={18} />
        </div> */}

        <PhoneInput
          international
          defaultCountry={defaultCountry as any}
          value={value}
          onChange={(val) => onChange(val || "")}
          className="w-full"
          inputClass="
            w-full bg-transparent
            py-2 pl-10 pr-3
            text-sm placeholder-gray-400
            focus:outline-none
          "
          countrySelectProps={{
            className: `
              bg-transparent border-0 pl-3 pr-1 m-5
              text-sm text-gray-700
              focus:outline-none
            `,
          }}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};