'use client'
import { TabItemProps } from '@/interface';

export function TabItem({ label, isActive, onClick }: TabItemProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-[16px] cursor-pointer transition-colors relative ${
        isActive
          ? 'text-primary'
          : 'text-gray-600   '
      }`}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-100"></div>
      )}
    </button>
  );
};
