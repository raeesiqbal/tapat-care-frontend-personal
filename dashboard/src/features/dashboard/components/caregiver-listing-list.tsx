"use client";

import { useCallback, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { CaregiverListingCard } from "@/features/dashboard/components/caregiver-listing-card";
import type {
  CaregiverListing,
  CaregiverListingPage,
} from "@/features/dashboard/types";

type CaregiverListingListProps = {
  initialPage: CaregiverListingPage;
};

export function CaregiverListingList({ initialPage }: CaregiverListingListProps) {
  const [caregivers, setCaregivers] = useState<CaregiverListing[]>(
    initialPage.caregivers,
  );
  const [nextOffset, setNextOffset] = useState(initialPage.nextOffset);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMore = useCallback(async () => {
    if (nextOffset === null) {
      return;
    }

    setErrorMessage("");

    try {
      const response = await fetch(`/dashboard/caregivers?offset=${nextOffset}`, {
        headers: {
          Accept: "application/json",
        },
      });
      const page = (await response.json()) as CaregiverListingPage & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(page.message || "We could not load caregivers.");
      }

      setCaregivers((currentCaregivers) => [
        ...currentCaregivers,
        ...page.caregivers,
      ]);
      setNextOffset(page.nextOffset);
      setHasMore(page.hasMore);
    } catch (error) {
      setHasMore(false);
      setErrorMessage(
        error instanceof Error ? error.message : "We could not load caregivers.",
      );
    }
  }, [nextOffset]);

  if (caregivers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-violet-200 bg-white p-6 text-sm text-gray-500">
        No caregivers are available right now.
      </div>
    );
  }

  return (
    <>
      <InfiniteScroll
        className="grid gap-5 overflow-visible"
        dataLength={caregivers.length}
        hasMore={hasMore}
        loader={
          <p className="py-2 text-center text-sm text-gray-500">
            Loading more caregivers...
          </p>
        }
        next={loadMore}
      >
        {caregivers.map((caregiver) => (
          <CaregiverListingCard
            key={caregiver.id}
            caregiver={caregiver}
            href={`/dashboard/caregiver/${caregiver.id}`}
          />
        ))}
      </InfiniteScroll>

      {errorMessage ? (
        <p className="mt-4 text-sm font-medium text-red-600">{errorMessage}</p>
      ) : null}
    </>
  );
}
