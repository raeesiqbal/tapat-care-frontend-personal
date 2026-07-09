"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isOnboardingStepId, type OnboardingStepId } from "../types";
import { ONBOARDING_DRAFT_STORAGE_PREFIX } from "../constants";

type StepValues = Record<string, string>;

type DraftState = {
  valuesByStep: Partial<Record<OnboardingStepId, StepValues>>;
  savedValuesByStep: Partial<Record<OnboardingStepId, StepValues>>;
};

type OnboardingDraftContextValue = {
  flowId: string;
  hydrated: boolean;
  valuesByStep: Partial<Record<OnboardingStepId, StepValues>>;
  savedValuesByStep: Partial<Record<OnboardingStepId, StepValues>>;
  setStepValues: (stepId: OnboardingStepId, values: StepValues) => void;
  setStepFieldValue: (
    stepId: OnboardingStepId,
    field: string,
    value: string,
  ) => void;
  markStepSaved: (stepId: OnboardingStepId, values?: StepValues) => void;
  hasSavedSnapshot: (stepId: OnboardingStepId) => boolean;
  isStepDirty: (stepId: OnboardingStepId, values?: StepValues) => boolean;
  clearStep: (stepId: OnboardingStepId) => void;
  clearAll: () => void;
};

const STORAGE_PREFIX = ONBOARDING_DRAFT_STORAGE_PREFIX;
const ACCOUNT_SENSITIVE_FIELDS = new Set(["password", "confirmPassword"]);

const OnboardingDraftContext =
  createContext<OnboardingDraftContextValue | null>(null);

function normalizeStepValues(values?: StepValues): StepValues {
  if (!values) {
    return {};
  }

  return Object.entries(values).reduce<StepValues>((result, [key, value]) => {
    result[key] =
      value && typeof value === "object"
        ? JSON.stringify(value)
        : String(value ?? "");
    return result;
  }, {});
}

function sanitizeStepValues(
  stepId: OnboardingStepId,
  values?: StepValues,
): StepValues {
  const normalizedValues = normalizeStepValues(values);

  if (stepId !== "account") {
    return normalizedValues;
  }

  return Object.entries(normalizedValues).reduce<StepValues>(
    (result, [key, value]) => {
      if (!ACCOUNT_SENSITIVE_FIELDS.has(key)) {
        result[key] = value;
      }
      return result;
    },
    {},
  );
}

function sanitizeDraftState(input: DraftState): DraftState {
  const valuesByStep = (
    Object.keys(input.valuesByStep) as OnboardingStepId[]
  ).reduce<DraftState["valuesByStep"]>((result, stepId) => {
    result[stepId] = sanitizeStepValues(stepId, input.valuesByStep[stepId]);
    return result;
  }, {});

  const savedValuesByStep = (
    Object.keys(input.savedValuesByStep) as OnboardingStepId[]
  ).reduce<DraftState["savedValuesByStep"]>((result, stepId) => {
    result[stepId] = sanitizeStepValues(
      stepId,
      input.savedValuesByStep[stepId],
    );
    return result;
  }, {});

  return { valuesByStep, savedValuesByStep };
}

function stepValuesEqual(left?: StepValues, right?: StepValues) {
  const leftValues = normalizeStepValues(left);
  const rightValues = normalizeStepValues(right);
  const keys = new Set([
    ...Object.keys(leftValues),
    ...Object.keys(rightValues),
  ]);

  for (const key of keys) {
    if ((leftValues[key] ?? "") !== (rightValues[key] ?? "")) {
      return false;
    }
  }

  return true;
}

function isDraftState(value: unknown): value is DraftState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DraftState>;
  return (
    typeof candidate.valuesByStep === "object" &&
    candidate.valuesByStep !== null &&
    typeof candidate.savedValuesByStep === "object" &&
    candidate.savedValuesByStep !== null
  );
}

function getInitialDraftState(): DraftState {
  return {
    valuesByStep: {},
    savedValuesByStep: {},
  };
}

function isEmptyVerificationDraft(values?: StepValues) {
  const normalized = normalizeStepValues(values);
  const phone = normalized.phone ?? "";
  const phoneVerified = normalized.phoneVerified ?? "false";
  const keys = Object.keys(normalized);

  return keys.length > 0 && !phone && phoneVerified === "false";
}

function hasMeaningfulStepValues(
  stepId: OnboardingStepId,
  values?: StepValues,
) {
  if (!values) {
    return false;
  }

  if (stepId === "verification") {
    return !isEmptyVerificationDraft(values);
  }

  return Object.values(normalizeStepValues(values)).some((value) => {
    const trimmedValue = value.trim();
    return (
      trimmedValue !== "" &&
      trimmedValue !== "[]" &&
      trimmedValue !== "{}"
    );
  });
}

function buildVerificationStepValues(phone?: string, phoneVerified?: boolean) {
  const normalizedPhone = String(phone ?? "").trim();

  if (!normalizedPhone && !phoneVerified) {
    return null;
  }

  return sanitizeStepValues("verification", {
    phone: normalizedPhone,
    phoneVerified: phoneVerified ? "true" : "false",
  });
}

export function OnboardingDraftProvider({
  flowId,
  children,
}: {
  flowId: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<DraftState>(getInitialDraftState);
  const [hydrated, setHydrated] = useState(false);
  const hasFetchedResumeRef = useRef(false);
  const storageKey = `${STORAGE_PREFIX}:${flowId}`;

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);

      if (!raw) {
        setState(getInitialDraftState());
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (isDraftState(parsed)) {
        setState(
          sanitizeDraftState({
            valuesByStep: parsed.valuesByStep,
            savedValuesByStep: parsed.savedValuesByStep,
          }),
        );
      } else {
        setState(getInitialDraftState());
      }
    } catch {
      setState(getInitialDraftState());
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
  }, [hydrated, state, storageKey]);

  useEffect(() => {
    if (
      !hydrated ||
      !["provider", "careseeker"].includes(flowId) ||
      hasFetchedResumeRef.current
    ) {
      return;
    }

    hasFetchedResumeRef.current = true;
    let isActive = true;

    async function hydrateFromBackend() {
      try {
        const searchParams = new URLSearchParams({ flow: flowId });
        const response = await fetch(
          `/api/onboarding/resume-state?${searchParams.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok || !isActive) {
          return;
        }

        const payload = (await response.json()) as {
          data?: {
            phone?: string;
            phone_verified?: boolean;
            values_by_step?: Record<string, Record<string, string>>;
            saved_steps?: string[];
          };
        };

        const valuesByStepPayload = payload.data?.values_by_step ?? {};
        const savedSteps = payload.data?.saved_steps ?? [];
        const savedStepIds = new Set(
          savedSteps.filter((stepId): stepId is OnboardingStepId =>
            isOnboardingStepId(stepId),
          ),
        );
        const verificationValues = buildVerificationStepValues(
          payload.data?.phone,
          payload.data?.phone_verified,
        );

        setState((current) => {
          const nextValuesByStep: DraftState["valuesByStep"] = {
            ...current.valuesByStep,
          };
          const nextSavedValuesByStep: DraftState["savedValuesByStep"] = {
            ...current.savedValuesByStep,
          };

          Object.entries(valuesByStepPayload).forEach(([stepId, values]) => {
            if (!isOnboardingStepId(stepId)) {
              return;
            }

            const backendValues = sanitizeStepValues(stepId, values);
            const currentValues = nextValuesByStep[stepId];
            const currentSavedValues = nextSavedValuesByStep[stepId];
            const hasLocalDraft = hasMeaningfulStepValues(
              stepId,
              currentValues,
            );
            const isCleanLocalSnapshot = Boolean(currentSavedValues) &&
              stepValuesEqual(currentValues, currentSavedValues);

            if (!hasLocalDraft || isCleanLocalSnapshot) {
              nextValuesByStep[stepId] = backendValues;
            }

            if (savedStepIds.has(stepId)) {
              nextSavedValuesByStep[stepId] = backendValues;
            }
          });

          if (
            verificationValues &&
            !hasMeaningfulStepValues(
              "verification",
              nextValuesByStep.verification,
            )
          ) {
            nextValuesByStep.verification = verificationValues;
          }

          savedStepIds.forEach((stepId) => {
            if (!nextSavedValuesByStep[stepId]) {
              nextSavedValuesByStep[stepId] = sanitizeStepValues(
                stepId,
                nextValuesByStep[stepId] ?? {},
              );
            }
          });

          if (
            verificationValues &&
            verificationValues.phoneVerified === "true" &&
            !hasMeaningfulStepValues(
              "verification",
              nextSavedValuesByStep.verification,
            )
          ) {
            nextSavedValuesByStep.verification = verificationValues;
          }

          return {
            valuesByStep: nextValuesByStep,
            savedValuesByStep: nextSavedValuesByStep,
          };
        });
      } catch {
        // Resume hydration is optional; keep local draft state if unavailable.
      }
    }

    hydrateFromBackend();

    return () => {
      isActive = false;
    };
  }, [flowId, hydrated]);

  const setStepValues = useCallback(
    (stepId: OnboardingStepId, values: StepValues) => {
      const normalized = sanitizeStepValues(stepId, values);
      setState((current) => {
        const currentValues = sanitizeStepValues(
          stepId,
          current.valuesByStep[stepId],
        );

        if (stepValuesEqual(currentValues, normalized)) {
          return current;
        }

        return {
          ...current,
          valuesByStep: {
            ...current.valuesByStep,
            [stepId]: normalized,
          },
        };
      });
    },
    [],
  );

  const setStepFieldValue = useCallback(
    (stepId: OnboardingStepId, field: string, value: string) => {
      if (stepId === "account" && ACCOUNT_SENSITIVE_FIELDS.has(field)) {
        return;
      }

      setState((current) => {
        const existing = sanitizeStepValues(
          stepId,
          current.valuesByStep[stepId],
        );

        if ((existing[field] ?? "") === value) {
          return current;
        }

        return {
          ...current,
          valuesByStep: {
            ...current.valuesByStep,
            [stepId]: {
              ...existing,
              [field]: value,
            },
          },
        };
      });
    },
    [],
  );

  const markStepSaved = useCallback(
    (stepId: OnboardingStepId, values?: StepValues) => {
      setState((current) => {
        const sourceValues = values
          ? sanitizeStepValues(stepId, values)
          : sanitizeStepValues(stepId, current.valuesByStep[stepId]);
        const currentSavedValues = sanitizeStepValues(
          stepId,
          current.savedValuesByStep[stepId],
        );
        const currentStepValues = sanitizeStepValues(
          stepId,
          current.valuesByStep[stepId],
        );

        if (
          stepValuesEqual(sourceValues, currentSavedValues) &&
          stepValuesEqual(sourceValues, currentStepValues)
        ) {
          return current;
        }

        return {
          ...current,
          valuesByStep: {
            ...current.valuesByStep,
            [stepId]: sourceValues,
          },
          savedValuesByStep: {
            ...current.savedValuesByStep,
            [stepId]: sourceValues,
          },
        };
      });
    },
    [],
  );

  const hasSavedSnapshot = useCallback(
    (stepId: OnboardingStepId) => Boolean(state.savedValuesByStep[stepId]),
    [state.savedValuesByStep],
  );

  const isStepDirty = useCallback(
    (stepId: OnboardingStepId, values?: StepValues) => {
      const currentValues = values
        ? normalizeStepValues(values)
        : normalizeStepValues(state.valuesByStep[stepId]);
      const savedValues = normalizeStepValues(state.savedValuesByStep[stepId]);

      if (!state.savedValuesByStep[stepId]) {
        return true;
      }

      return !stepValuesEqual(currentValues, savedValues);
    },
    [state.savedValuesByStep, state.valuesByStep],
  );

  const clearStep = useCallback((stepId: OnboardingStepId) => {
    setState((current) => {
      const nextValuesByStep = { ...current.valuesByStep };
      const nextSavedValuesByStep = { ...current.savedValuesByStep };
      delete nextValuesByStep[stepId];
      delete nextSavedValuesByStep[stepId];

      return {
        valuesByStep: nextValuesByStep,
        savedValuesByStep: nextSavedValuesByStep,
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState(getInitialDraftState());
  }, []);

  const contextValue = useMemo<OnboardingDraftContextValue>(
    () => ({
      flowId,
      hydrated,
      valuesByStep: state.valuesByStep,
      savedValuesByStep: state.savedValuesByStep,
      setStepValues,
      setStepFieldValue,
      markStepSaved,
      hasSavedSnapshot,
      isStepDirty,
      clearStep,
      clearAll,
    }),
    [
      clearAll,
      clearStep,
      flowId,
      hasSavedSnapshot,
      hydrated,
      isStepDirty,
      markStepSaved,
      setStepFieldValue,
      setStepValues,
      state.savedValuesByStep,
      state.valuesByStep,
    ],
  );

  return (
    <OnboardingDraftContext.Provider value={contextValue}>
      {children}
    </OnboardingDraftContext.Provider>
  );
}

export function useOnboardingDraft() {
  const context = useContext(OnboardingDraftContext);

  if (!context) {
    throw new Error(
      "useOnboardingDraft must be used within an OnboardingDraftProvider.",
    );
  }

  return context;
}
