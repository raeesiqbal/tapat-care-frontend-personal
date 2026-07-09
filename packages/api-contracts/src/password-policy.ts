export type PasswordChecks = {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
};

export type PasswordRequirementId = keyof PasswordChecks;

export type PasswordRequirement = {
  id: PasswordRequirementId;
  label: string;
  errorText: string;
  test: (password: string) => boolean;
};

export type PasswordEvaluation = {
  checks: PasswordChecks;
  passedChecks: number;
  isValid: boolean;
  strength: "weak" | "medium" | "strong";
  score: 1 | 3 | 4;
  label: string;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 12 characters",
    errorText: "at least 12 characters long",
    test: (password) => password.length >= 12,
  },
  {
    id: "lowercase",
    label: "At least 1 lowercase letter",
    errorText: "at least one lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    label: "At least 1 uppercase letter",
    errorText: "at least one uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "At least 1 number",
    errorText: "at least one number",
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: "special",
    label: "At least 1 special character",
    errorText: "at least one special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function evaluatePassword(password: string): PasswordEvaluation {
  const checks = PASSWORD_REQUIREMENTS.reduce(
    (result, requirement) => ({
      ...result,
      [requirement.id]: requirement.test(password),
    }),
    {} as PasswordChecks,
  );

  const passedChecks = Object.values(checks).filter(Boolean).length;

  let strength: "weak" | "medium" | "strong" = "weak";
  let score: 1 | 3 | 4 = 1;
  let label = "Weak";

  if (passedChecks >= 5) {
    strength = "strong";
    score = 4;
    label = "Strong";
  } else if (passedChecks >= 3) {
    strength = "medium";
    score = 3;
    label = "Good";
  }

  return {
    checks,
    passedChecks,
    isValid: Object.values(checks).every(Boolean),
    strength,
    score,
    label,
  };
}

export function validatePassword(password: string): string | null {
  const result = evaluatePassword(password);

  if (result.isValid) {
    return null;
  }

  const missingRequirements = PASSWORD_REQUIREMENTS.filter(
    (requirement) => !result.checks[requirement.id],
  ).map((requirement) => requirement.errorText);

  if (missingRequirements.length === 1) {
    return `Password is missing ${missingRequirements[0]}.`;
  }

  const lastRequirement = missingRequirements.at(-1);
  const remainingRequirements = missingRequirements.slice(0, -1);

  return `Password must include ${remainingRequirements.join(", ")}, and ${lastRequirement}.`;
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): string | null {
  if (password && confirmPassword && password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}
