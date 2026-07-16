"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import type { DashboardUser } from "@/features/dashboard/types";
import { updateDashboardProfilePhoto } from "@/features/settings/profile/actions";

type ProfilePhotoCardProps = {
  user: DashboardUser;
};

const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getClientFileError(file: File) {
  if (!ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
    return "Upload a JPG, PNG, WebP, or GIF image.";
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
    return "Profile photo must be 5 MB or smaller.";
  }

  return null;
}

export function ProfilePhotoCard({ user }: ProfilePhotoCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState(user.picture);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function clearObjectPreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function openFilePicker() {
    if (isPending) {
      return;
    }

    inputRef.current?.click();
  }

  async function uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const result = await updateDashboardProfilePhoto(undefined, formData);

    if (result.status === "success") {
      clearObjectPreview();
      setPreviewSrc(result.picture ?? null);
      toast.success(result.message);
      router.refresh();
      return;
    }

    clearObjectPreview();
    setPreviewSrc(user.picture);
    toast.error(result.message);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || isPending) {
      return;
    }

    const fileError = getClientFileError(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewSrc(objectUrl);
    setIsPending(true);
    uploadProfilePhoto(file)
      .catch(() => {
        clearObjectPreview();
        setPreviewSrc(user.picture);
        toast.error("We could not update your profile photo.");
      })
      .finally(() => setIsPending(false));
  }

  return (
    <section className="mt-12 mb-12">
      <div className="flex flex-wrap items-start gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isPending}
            className="group relative flex h-28 w-28 overflow-hidden rounded-full bg-gray-100 text-gray-950 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tapat-color-brand-purple-700)] focus-visible:ring-offset-2 disabled:cursor-wait"
            aria-label="Update profile photo"
          >
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt={`${user.fullName} profile photo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-black text-3xl font-semibold text-white">
                {user.initials}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black opacity-0 transition group-hover:opacity-70 group-focus-visible:opacity-100">
              {isPending ? (
                <Loader2
                  className="h-9 w-9 animate-spin text-white"
                  aria-hidden
                />
              ) : (
                <Camera className="h-9 w-9 text-white" aria-hidden />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={openFilePicker}
            disabled={isPending}
            className="absolute bottom-0 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-950 shadow-sm transition hover:border-[var(--tapat-color-brand-purple-700)] hover:text-[var(--tapat-color-brand-purple-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tapat-color-brand-purple-700)] focus-visible:ring-offset-2 disabled:cursor-wait"
            aria-label="Choose profile photo"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Camera className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>

        <div className="min-w-[220px] flex-1">
          <p className="truncate text-heading-4 text-gray-950">
            {user.fullName}
          </p>
          <p className="mt-2 truncate text-sm text-gray-600">{user.email}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
      />
    </section>
  );
}
