"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

const serviceFilters = [
  "Personal care",
  "Companionship",
  "Meal preparation",
  "Mobility support",
  "Medication reminders",
  "Transportation",
  "Overnight care",
  "Dementia care",
];

const skillFilters = [
  "Background checked",
  "CPR certified",
  "Driver's license",
  "First aid",
  "TB test",
  "Hoyer lift",
];

export function CareseekerSearch() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
        <div className="grid flex-1 gap-0 overflow-hidden rounded-[1.75rem] border border-[var(--tapat-color-gray-200)] bg-white shadow-float sm:rounded-full sm:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr_auto]">
          <SearchSelect
            icon={<MapPin className="h-5 w-5" />}
            label="Where"
            defaultValue="Brooklyn, NY - 11226"
            options={[
              "Brooklyn, NY - 11226",
              "New York, NY",
              "Los Angeles, CA",
              "Chicago, IL",
            ]}
          />
          <SearchSelect
            icon={<CalendarDays className="h-5 w-5" />}
            label="When"
            defaultValue="Monday, May 4 - ongoing"
            options={[
              "Monday, May 4 - ongoing",
              "Tuesday, May 5 - ongoing",
              "Wednesday, May 6 - ongoing",
              "Thursday, May 7 - ongoing",
            ]}
          />
          <SearchSelect
            icon={<Clock3 className="h-5 w-5" />}
            label="Time"
            defaultValue="Morning - 8 AM-12 PM"
            options={[
              "Morning - 8 AM-12 PM",
              "Afternoon - 12 PM-6 PM",
              "Evening - 6 PM-12 AM",
            ]}
          />
          <button
            type="button"
            className="m-3 inline-flex h-12 w-auto items-center justify-center gap-2 rounded-full bg-[var(--tapat-color-brand-purple-700)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--tapat-color-brand-deep-purple-800)] sm:col-span-2 lg:col-span-1"
          >
            <Search className="h-5 w-5" aria-hidden />
            <span className="inline sm:hidden lg:inline">Search</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[var(--tapat-color-gray-200)] bg-white px-5 text-sm font-semibold text-gray-950 shadow-float transition hover:border-violet-200 hover:bg-violet-50 sm:w-auto lg:h-16"
        >
          <SlidersHorizontal className="h-5 w-5" aria-hidden />
          Filters
          <span className="flex h-6 min-w-6 items-center  justify-center rounded-full bg-[var(--tapat-color-brand-purple-700)] px-1.5 text-xs text-white">
            4
          </span>
        </button>
      </div>

      <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  );
}

function SearchSelect({
  icon,
  label,
  defaultValue,
  options,
}: {
  icon: ReactNode;
  label: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="flex min-w-0 items-center gap-3 border-b border-[var(--tapat-color-gray-100)] px-3 py-3 last:border-b-0 sm:px-4 sm:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:border-r lg:[&:nth-child(2)]:border-r lg:[&:nth-child(3)]:border-r-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[var(--tapat-color-brand-purple-700)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-gray-500">
          {label}
        </span>
        <select
          defaultValue={defaultValue}
          className="mt-0.5 w-full min-w-0 truncate bg-transparent text-sm font-semibold text-gray-950 outline-none"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </span>
    </label>
  );
}

function FilterPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      description="4 applied"
    >
      <div className="max-h-[72vh] overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Keyword search"
            placeholder="Dementia, hoyer lift, evenings"
          />
          <Field label="Search by name" placeholder="First name or full name" />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-950">Pay rate</h3>
            <p className="text-sm text-gray-500">$24-$40 / hr</p>
          </div>
          <div className="mt-4 px-1">
            <div className="relative h-1 rounded-full bg-gray-200">
              <div className="absolute left-[18%] right-[20%] h-1 rounded-full bg-[var(--tapat-color-brand-purple-700)]" />
              <div className="absolute left-[18%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[var(--tapat-color-brand-purple-700)] bg-white" />
              <div className="absolute right-[20%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[var(--tapat-color-brand-purple-700)] bg-white" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>$12</span>
              <span>$50</span>
            </div>
          </div>
        </div>

        <ChipGroup title="Services" chips={serviceFilters} selectedCount={2} />
        <ChipGroup title="Skills" chips={skillFilters} selectedCount={2} />

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-gray-500 transition hover:text-gray-950"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Show 24 caregivers
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-950">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-lg border border-[var(--tapat-color-gray-200)] px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--tapat-color-brand-purple-700)] focus:ring-4 focus:ring-violet-100"
      />
    </label>
  );
}

function ChipGroup({
  title,
  chips,
  selectedCount,
}: {
  title: string;
  chips: string[];
  selectedCount: number;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
        <p className="text-sm text-gray-500">{selectedCount} selected</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip, index) => {
          const selected = index < selectedCount;

          return (
            <button
              key={chip}
              type="button"
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                selected
                  ? "border-violet-200 bg-violet-50 text-[var(--tapat-color-brand-purple-700)]"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
