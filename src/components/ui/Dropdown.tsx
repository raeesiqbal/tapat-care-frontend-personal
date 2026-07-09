'use client'
import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { CustomDropdownProps } from '@/interface';


export  function CustomDropdown({ onChange, value }: CustomDropdownProps = {}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(value || "Select Option");

  const options = [
    "Family Member",
    "Caregiver",
    "Healthcare Professional",
    "Other",
  ];

  return (
    <div className="relative w-full ">
      {/* Left icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Image src="/assets/icons/select.svg" alt="Select Icon" width={20} height={20} />
      </div>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full pl-12 pr-10 py-3 border  h-[62px] border-gray-300 rounded-[16px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white flex justify-between items-center"
      >
        <div className="flex items-center space-x-1">
          <span className="text-gray-900">I'm a</span>
          <span className="text-gray-500 italic">{selected}</span>
        </div>
        <ChevronDown className="text-gray-400 w-5 h-5" />
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-[16px] shadow-lg z-10">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                setSelected(option);
                setOpen(false);
                if (onChange) onChange(option);
              }}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-500"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
