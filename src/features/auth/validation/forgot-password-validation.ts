const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateForgotPasswordEmail(email: string): string | null {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return "Email is required.";
  }

  return EMAIL_PATTERN.test(normalizedEmail)
    ? null
    : "Enter a valid email address.";
}
