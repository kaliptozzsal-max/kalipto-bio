"use client";

import { AnimatePresence, m } from "framer-motion";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "@/components/ui/Icon";
import {
  CONTACT_LIMITS,
  EMPTY_CONTACT,
  validateContact,
  validateContactField,
  type ContactField,
  type ContactFieldErrors,
  type ContactInput,
} from "@/lib/contact-schema";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const fields = [
  {
    name: "name",
    label: "Name",
    type: "text",
    placeholder: "Your name",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    name: "subject",
    label: "Subject",
    type: "text",
    placeholder: "What is this about?",
    autoComplete: "off",
  },
] as const;

const inputBase =
  "w-full rounded-2xl border bg-void-900/60 px-4 py-3 text-[0.9375rem] text-ink " +
  "placeholder:text-ink-faint transition-[border-color,box-shadow] duration-300 " +
  "focus:outline-none focus-visible:outline-none";

const inputOk =
  "border-hairline focus-visible:border-electric-400/70 focus-visible:ring-2 focus-visible:ring-electric-500/25";
const inputBad =
  "border-red-400/60 focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-400/25";

export function ContactForm() {
  const formId = useId();
  const [values, setValues] = useState<ContactInput>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  const update =
    (field: ContactField) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      // Clear the error as soon as the user starts correcting it.
      setErrors((current) =>
        current[field] ? { ...current, [field]: undefined } : current,
      );
    };

  /** Validate one field on blur so problems surface early, not only on submit. */
  const validateOnBlur = (field: ContactField) => () => {
    const error = validateContactField(field, values[field]);
    if (error) setErrors((current) => ({ ...current, [field]: error }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const result = validateContact(values);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setStatus("error");
      setFeedback("Please fix the highlighted fields and try again.");

      const firstKey = Object.keys(result.fieldErrors)[0];
      if (firstKey) document.getElementById(`${formId}-${firstKey}`)?.focus();
      return;
    }

    setStatus("submitting");
    setErrors({});
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        fieldErrors?: ContactFieldErrors;
      };

      if (!response.ok) {
        setStatus("error");
        setErrors(payload.fieldErrors ?? {});
        setFeedback(
          payload.message ??
            "Something went wrong sending your message. Please try again.",
        );
        return;
      }

      setStatus("success");
      setValues(EMPTY_CONTACT);
      setFeedback(payload.message ?? "Message received. I'll reply soon.");
    } catch {
      setStatus("error");
      setFeedback("Network error. Please check your connection and try again.");
    }
  }

  const isSubmitting = status === "submitting";

  /* ---------------------------- success state ---------------------------- */
  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-5 py-10 text-center"
      >
        <m.span
          className="grid size-16 place-items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <m.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.14, duration: 0.32, ease: easeOut }}
          >
            <CheckCircleIcon className="size-8" />
          </m.span>
        </m.span>

        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: easeOut }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-[1.0625rem] font-semibold text-ink">Thank you</p>
          <p className="max-w-sm text-[0.875rem] leading-relaxed text-ink-muted">
            {feedback}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.4 }}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setStatus("idle");
              setFeedback("");
            }}
          >
            Send another message
          </Button>
        </m.div>
      </div>
    );
  }

  /* ------------------------------- the form ------------------------------ */
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot — hidden from people, catches naive bots */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${formId}-company`}>Company</label>
        <input
          id={`${formId}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company ?? ""}
          onChange={update("company")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.name];
          const inputId = `${formId}-${field.name}`;

          return (
            <div
              key={field.name}
              className={cn(
                "flex flex-col gap-2",
                field.name === "subject" && "sm:col-span-2",
              )}
            >
              <label
                htmlFor={inputId}
                className="text-[0.75rem] font-medium tracking-[0.08em] text-ink-muted uppercase"
              >
                {field.label}
                <span aria-hidden="true" className="ml-1 text-electric-400">
                  *
                </span>
              </label>
              <input
                id={inputId}
                name={field.name}
                type={field.type}
                required
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={update(field.name)}
                onBlur={validateOnBlur(field.name)}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={cn(inputBase, error ? inputBad : inputOk)}
              />
              <AnimatePresence>
                {error ? (
                  <m.p
                    id={`${inputId}-error`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: easeOut }}
                    className="flex items-center gap-1.5 text-[0.75rem] text-red-300"
                  >
                    <AlertIcon className="size-3.5 shrink-0" />
                    {error}
                  </m.p>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${formId}-message`}
          className="text-[0.75rem] font-medium tracking-[0.08em] text-ink-muted uppercase"
        >
          Message
          <span aria-hidden="true" className="ml-1 text-electric-400">
            *
          </span>
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          rows={6}
          placeholder="Tell me what you're working on."
          value={values.message}
          onChange={update("message")}
          onBlur={validateOnBlur("message")}
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={
            errors.message ? `${formId}-message-error` : `${formId}-message-hint`
          }
          className={cn(
            inputBase,
            "resize-y",
            errors.message ? inputBad : inputOk,
          )}
        />
        {errors.message ? (
          <p
            id={`${formId}-message-error`}
            className="flex items-center gap-1.5 text-[0.75rem] text-red-300"
          >
            <AlertIcon className="size-3.5 shrink-0" />
            {errors.message}
          </p>
        ) : (
          <p
            id={`${formId}-message-hint`}
            className="text-[0.75rem] text-ink-faint"
          >
            {values.message.trim().length}/{CONTACT_LIMITS.message.max}{" "}
            characters — {CONTACT_LIMITS.message.min} minimum.
          </p>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          iconRight={
            isSubmitting ? (
              <SpinnerIcon className="animate-spin-slow" />
            ) : (
              <ArrowRightIcon />
            )
          }
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>

        <p className="text-[0.75rem] leading-relaxed text-ink-faint">
          Your details are only used to reply to this message.
        </p>
      </div>

      {/* Live region for failures; success replaces the whole form above. */}
      <div aria-live="polite" role="status">
        <AnimatePresence>
          {feedback && status === "error" ? (
            <m.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="flex items-start gap-2.5 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[0.8125rem] text-red-100"
            >
              <AlertIcon className="mt-px size-4 shrink-0" />
              {feedback}
            </m.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
