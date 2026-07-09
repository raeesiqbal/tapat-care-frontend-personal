"use client";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { TextField as Field } from "@tapat-care/ui-primitives";
import {
  forgotPasswordAction,
  type PasswordResetState,
} from "../actions/password-reset-actions";
import { validateForgotPasswordEmail } from "../validation/forgot-password-validation";

const initialState: PasswordResetState = {
  status: "idle",
  message: "",
};

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const hasHandledSuccessRef = useRef(false);
  const lastServerErrorMessageRef = useRef("");
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  useEffect(() => {
    if (isPending) {
      hasHandledSuccessRef.current = false;
      return;
    }

    if (state.status !== "success") {
      hasHandledSuccessRef.current = false;
      return;
    }

    if (hasHandledSuccessRef.current) {
      return;
    }

    hasHandledSuccessRef.current = true;

    if (state.message) {
      toast.success(state.message);
    }

    setEmail("");
    setEmailError(undefined);
  }, [isPending, state.message, state.status]);

  useEffect(() => {
    if (isPending) {
      lastServerErrorMessageRef.current = "";
      return;
    }

    if (state.status !== "error" || !state.message) {
      return;
    }

    if (lastServerErrorMessageRef.current === state.message) {
      return;
    }

    lastServerErrorMessageRef.current = state.message;

    if (!emailError) {
      setEmailError(state.message);
    }

    if (state.message !== emailError) {
      toast.error(state.message);
    }
  }, [emailError, isPending, state.message, state.status]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const nextEmailError = validateForgotPasswordEmail(normalizedEmail);

    if (nextEmailError) {
      setEmailError(nextEmailError);
      toast.error(nextEmailError);
      return;
    }

    setEmailError(undefined);

    const formData = new FormData();
    formData.append("email", normalizedEmail);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        <Field
          label="Email address"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          required
          value={email}
          error={emailError}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) {
              setEmailError(undefined);
            }
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || Boolean(emailError)}
        className="inline-flex w-full h-12 mt-6 items-center justify-center rounded-[8px] bg-primary px-6 text-[15px] font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send reset link"}
      </button>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary transition hover:text-primary-hover"
          >
            Back to login
          </Link>
        </p>
      </div>
    </form>
  );
}
