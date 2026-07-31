/**
 * Contact form validation, shared verbatim by the client form and the API
 * route so the two can never drift. Server-side validation is authoritative.
 *
 * Hand-rolled rather than schema-library based: the rules are a handful of
 * length checks plus one pattern, and keeping it dependency-free removes a
 * sizeable chunk from the client bundle.
 */

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot. Real users never see or fill this. */
  company?: string;
};

export type ContactField = keyof ContactInput;

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { min: 5, max: 254 },
  subject: { min: 3, max: 120 },
  message: { min: 20, max: 4000 },
  company: { max: 200 },
} as const;

/**
 * Deliberately conservative: one @, a dot-separated domain, no whitespace.
 * Linear-time, so it cannot be used as a ReDoS vector on the server.
 */
const EMAIL_PATTERN = /^[^\s@,;:<>()[\]\\"]+@[^\s@.]+(\.[^\s@.]+)+$/;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type ContactValidation =
  | { ok: true; data: ContactInput }
  | { ok: false; fieldErrors: ContactFieldErrors };

/** Validates a single field. Returns `undefined` when the value is acceptable. */
export function validateContactField(
  field: ContactField,
  rawValue: unknown,
): string | undefined {
  const value = readString(rawValue);

  switch (field) {
    case "name": {
      const { min, max } = CONTACT_LIMITS.name;
      if (value.length === 0) return "Please enter your name.";
      if (value.length < min)
        return `Please enter at least ${min} characters.`;
      if (value.length > max)
        return `That name is a little long (${max} characters max).`;
      return undefined;
    }

    case "email": {
      const { max } = CONTACT_LIMITS.email;
      if (value.length === 0) return "An email address is required.";
      if (value.length > max) return "That email address is too long.";
      if (!EMAIL_PATTERN.test(value))
        return "Please enter a valid email address.";
      return undefined;
    }

    case "subject": {
      const { min, max } = CONTACT_LIMITS.subject;
      if (value.length === 0) return "Please add a short subject.";
      if (value.length < min) return `Please add at least ${min} characters.`;
      if (value.length > max)
        return `Subject is limited to ${max} characters.`;
      return undefined;
    }

    case "message": {
      const { min, max } = CONTACT_LIMITS.message;
      if (value.length === 0) return "Please write a message.";
      if (value.length < min)
        return `Tell me a bit more — at least ${min} characters.`;
      if (value.length > max)
        return `Message is limited to ${max} characters.`;
      return undefined;
    }

    case "company":
      // Never surfaced to users; length-capped only so a bot cannot post a
      // megabyte through the honeypot.
      return value.length > CONTACT_LIMITS.company.max
        ? "Invalid value."
        : undefined;

    default:
      return undefined;
  }
}

/** Validates the whole payload. Safe to call with untrusted input. */
export function validateContact(input: unknown): ContactValidation {
  const source: Record<string, unknown> =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const fieldErrors: ContactFieldErrors = {};
  const fields: readonly ContactField[] = [
    "name",
    "email",
    "subject",
    "message",
    "company",
  ];

  for (const field of fields) {
    const error = validateContactField(field, source[field]);
    if (error) fieldErrors[field] = error;
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: {
      name: readString(source.name),
      email: readString(source.email),
      subject: readString(source.subject),
      message: readString(source.message),
      company: readString(source.company),
    },
  };
}

export const EMPTY_CONTACT: ContactInput = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: "",
};
