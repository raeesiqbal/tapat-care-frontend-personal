import Link from "next/link";

type OnboardingFooterProps = {
  previousPath?: string | null;
  submitLabel: string;
  isPending?: boolean;
  helperText?: string;
  submitDisabled?: boolean;
};

export function OnboardingFooter({
  previousPath,
  submitLabel,
  isPending,
  helperText,
  submitDisabled,
}: OnboardingFooterProps) {
  return (
    <div className="mt-10 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {previousPath ? (
          <Link
            href={previousPath}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
          >
            Back
          </Link>
        ) : null}
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {helperText ? (
          <p className="text-sm font-medium text-gray-500">{helperText}</p>
        ) : null}
        <button
          type="submit"
          disabled={isPending || submitDisabled}
          className="inline-flex h-12 min-w-[168px] items-center justify-center rounded-[8px] bg-primary px-6 text-[15px] font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
