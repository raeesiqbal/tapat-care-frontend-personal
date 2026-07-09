"use client";

import { ToastContainer, toast } from "react-toastify";

export const FORM_ERROR_TOAST_MESSAGE = "Please remove form errors";

export function notifyFormErrors() {
  toast.error(FORM_ERROR_TOAST_MESSAGE);
}

export function ToastProvider() {
  return (
    <ToastContainer
      autoClose={4000}
      closeOnClick={false}
      draggable
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      position="top-right"
      theme="light"
    />
  );
}
