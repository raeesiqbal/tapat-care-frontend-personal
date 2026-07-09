"use client";
import { TabItemProps } from "@/interface";

export function TabItem({ label, isActive, onClick }: TabItemProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-[16px] font-medium cursor-pointer transition-colors relative ${
        isActive ? "text-primary" : "text-gray-600   "
      }`}
    >
      {label}
    </button>
  );
}
