"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  DollarSign,
  Star,
  UsersRound,
} from "lucide-react";

import { caregiverReviews, caregiverSchedule } from "@/features/dashboard/data";
import type {
  CaregiverReview,
  CaregiverScheduleItem,
  DashboardUser,
} from "@/features/dashboard/types";

type CaregiverDashboardProps = {
  user: DashboardUser;
};

const stats = [
  {
    id: "clients",
    label: "Active clients",
    value: "4",
    hint: "2 visits today",
    icon: UsersRound,
  },
  {
    id: "hours",
    label: "Hours this week",
    value: "28",
    hint: "12 scheduled next",
    icon: Clock3,
  },
  {
    id: "earnings",
    label: "Earnings this month",
    value: "$1,840",
    hint: "Up 8% from last month",
    icon: DollarSign,
  },
  {
    id: "rating",
    label: "Avg. rating",
    value: "4.9",
    hint: "Based on recent reviews",
    icon: Star,
  },
];

export function CaregiverDashboard({ user }: CaregiverDashboardProps) {
  return (
    <main className="bg-white">
      <div className="mx-auto w-full max-w-[1360px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
        <section>
          <p className="text-sm font-semibold uppercase tracking-normal text-[var(--tapat-color-brand-purple-700)]">
            Welcome back, {user.firstName || "Sarah"}
          </p>
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-heading-1 text-black">
                Your care dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
                Track today&apos;s schedule, active clients, recent feedback, and weekly
                care activity from one place.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-[var(--tapat-color-brand-purple-700)] transition hover:bg-white"
            >
              <CalendarDays className="h-4 w-4" aria-hidden />
              Open calendar
            </button>
          </div>
        </section>

        <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.id}
                className="rounded-lg bg-[#f7f7f7] p-5 ring-1 ring-transparent"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase text-gray-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-heading-3 text-black">
                      {stat.value}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[var(--tapat-color-brand-purple-700)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-500">{stat.hint}</p>
              </article>
            );
          })}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <SchedulePanel />
          <AvailabilityPanel />
        </div>

        <section className="mt-6">
          <ReviewsPanel />
        </section>
      </div>
    </main>
  );
}

function SchedulePanel() {
  return (
    <section className="rounded-lg border border-[var(--tapat-color-gray-200)] bg-white p-5 shadow-[var(--tapat-shadow-card)] sm:p-6">
      <PanelHeader title="Today's schedule" action="Full calendar" />

      <div className="mt-5 divide-y divide-[var(--tapat-color-gray-100)]">
        {caregiverSchedule.map((item) => (
          <ScheduleRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function ScheduleRow({ item }: { item: CaregiverScheduleItem }) {
  const isAvailable = item.status === "available";

  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center">
      <p className="text-sm font-semibold text-gray-950">{item.time}</p>
      <div className="min-w-0">
        <p
          className={`flex items-center gap-2 text-sm font-semibold ${
            isAvailable ? "text-gray-500" : "text-gray-950"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isAvailable ? "bg-gray-200" : "bg-[var(--tapat-color-brand-purple-700)]"
            }`}
          />
          {item.client}
        </p>
        {!isAvailable ? (
          <p className="mt-1 text-sm text-gray-500">
            {item.service} - {item.location}
          </p>
        ) : null}
      </div>
      <span
        className={`w-fit rounded-lg px-3 py-2 text-sm font-medium ${
          isAvailable
            ? "text-[var(--tapat-color-brand-purple-700)]"
            : "bg-gray-50 text-gray-500"
        }`}
      >
        {item.duration}
      </span>
    </div>
  );
}

function AvailabilityPanel() {
  return (
    <aside className="rounded-lg border border-violet-100 bg-violet-50 p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase text-[var(--tapat-color-brand-purple-700)]">
        Availability
      </p>
      <h2 className="mt-3 text-heading-3 text-black">
        Two open windows this week
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        Keep availability current so families can request shifts that match your
        preferred schedule.
      </p>
      <div className="mt-5 grid gap-3">
        {["Wednesday, 10 AM-2 PM", "Friday, 4 PM-8 PM"].map((slot) => (
          <div
            key={slot}
            className="rounded-lg border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800"
          >
            {slot}
          </div>
        ))}
      </div>
    </aside>
  );
}

function ReviewsPanel() {
  return (
    <section className="rounded-lg border border-[var(--tapat-color-gray-200)] bg-white p-5 shadow-[var(--tapat-shadow-card)] sm:p-6">
      <PanelHeader title="Recent reviews" action="See all" />

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {caregiverReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: CaregiverReview }) {
  return (
    <article className="rounded-lg border border-[var(--tapat-color-gray-100)] bg-white p-4">
      <div className="flex items-center gap-1 text-[var(--tapat-color-brand-purple-700)]">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < review.rating ? "fill-current" : "fill-gray-200 text-gray-200"}`}
            aria-hidden
          />
        ))}
      </div>
      <p className="mt-3 font-semibold text-gray-950">{review.family}</p>
      <p className="mt-2 text-sm leading-6 text-gray-500">{review.quote}</p>
      <p className="mt-3 text-sm text-gray-400">{review.age}</p>
    </article>
  );
}

function PanelHeader({ title, action }: { title: string; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-heading-5 text-black">{title}</h2>
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tapat-color-brand-purple-700)] transition hover:text-[var(--tapat-color-brand-deep-purple-800)]"
      >
        {action}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
