"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ChevronIcon } from "./ChevronIcon";
import { DAYS, HOURS, MINUTES, REQUEST_TYPES } from "@/lib/types";
import type { AvailabilitySlotInput, Civility, RequestType } from "@/lib/types";

interface FormValues {
  civility: Civility;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  requestType: RequestType;
  message: string;
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const [slots, setSlots] = useState<AvailabilitySlotInput[]>([]);
  const [day, setDay] = useState<string>(DAYS[0]);
  const [hour, setHour] = useState<number>(7);
  const [minute, setMinute] = useState<number>(0);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function addSlot() {
    const candidate = { day, hour, minute };
    const alreadyExists = slots.some(
      (s) => s.day === candidate.day && s.hour === candidate.hour && s.minute === candidate.minute
    );

    if (alreadyExists) {
      setSlotsError("Ce créneau a déjà été ajouté.");
      return;
    }

    setSlotsError(null);
    setSlots((prev) => [...prev, candidate]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: FormValues) {
    if (slots.length === 0) {
      setSlotsError("Merci d'ajouter au moins une disponibilité.");
      return;
    }

    setSubmitState("loading");
    setServerError(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, availabilities: slots }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.errors?.[0]?.message ?? "Une erreur est survenue, merci de réessayer.";
        setServerError(message);
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
      reset();
      setSlots([]);
    } catch {
      setServerError("Impossible de contacter le serveur, merci de réessayer.");
      setSubmitState("error");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
      {/* Fond : photo d'intérieur fournie pour l'agence */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/55" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12"
        noValidate
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
          Contactez l&rsquo;agence
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Colonne gauche : coordonnées */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">
              Vos coordonnées
            </h2>

            <div className="mt-4 flex items-center gap-6">
              <RadioOption
                label="Mme"
                value="MME"
                name="civility"
                register={register}
              />
              <RadioOption label="M" value="M" name="civility" register={register} />
            </div>
            {errors.civility && <FieldError message="Merci de choisir une civilité." />}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <TextInput
                placeholder="Nom"
                error={!!errors.lastName}
                {...register("lastName", { required: true })}
              />
              <TextInput
                placeholder="Prénom"
                error={!!errors.firstName}
                {...register("firstName", { required: true })}
              />
            </div>
            {(errors.lastName || errors.firstName) && (
              <FieldError message="Le nom et le prénom sont obligatoires." />
            )}

            <div className="mt-3">
              <TextInput
                type="email"
                placeholder="Adresse mail"
                error={!!errors.email}
                {...register("email", {
                  required: true,
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                })}
              />
            </div>
            {errors.email && <FieldError message="Adresse email invalide." />}

            <div className="mt-3">
              <TextInput
                type="tel"
                placeholder="Téléphone"
                error={!!errors.phone}
                {...register("phone", { required: true, minLength: 6 })}
              />
            </div>
            {errors.phone && <FieldError message="Numéro de téléphone invalide." />}
          </div>

          {/* Colonne droite : message */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">
              Votre message
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {REQUEST_TYPES.map((rt) => (
                <RadioOption
                  key={rt.value}
                  label={rt.label}
                  value={rt.value}
                  name="requestType"
                  register={register}
                />
              ))}
            </div>
            {errors.requestType && (
              <FieldError message="Merci de choisir l'objet de votre demande." />
            )}

            <textarea
              placeholder="Votre message"
              rows={5}
              className={`mt-4 flex-1 min-h-[140px] resize-none rounded-2xl bg-white/95 px-5 py-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 ${
                errors.message ? "ring-2 ring-red-400" : "focus:ring-amber-400"
              }`}
              {...register("message", { required: true })}
            />
            {errors.message && <FieldError message="Le message est obligatoire." />}
          </div>
        </div>

        {/* Disponibilités */}
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">
            Disponibilités pour une visite
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SelectPill value={day} onChange={(v) => setDay(v)}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectPill>

            <SelectPill value={String(hour)} onChange={(v) => setHour(Number(v))} narrow>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}h
                </option>
              ))}
            </SelectPill>

            <SelectPill value={String(minute)} onChange={(v) => setMinute(Number(v))} narrow>
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}m
                </option>
              ))}
            </SelectPill>

            <button
              type="button"
              onClick={addSlot}
              className="rounded-full bg-[#3b2a5c] px-5 py-2.5 text-xs font-bold uppercase leading-tight text-white shadow-md transition hover:bg-[#4a3672] cursor-pointer"
            >
              Ajouter
              <br />
              dispo
            </button>
          </div>

          {slotsError && <FieldError message={slotsError} />}

          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              {slots.length === 0 && (
                <p className="text-sm text-white/70">Aucune disponibilité ajoutée pour l&rsquo;instant.</p>
              )}
              {slots.map((slot, index) => (
                <div
                  key={`${slot.day}-${slot.hour}-${slot.minute}-${index}`}
                  className="flex w-fit items-center justify-between gap-3 rounded-md bg-white/85 px-4 py-2 text-sm text-gray-700"
                >
                  <span>
                    {slot.day} à {slot.hour}h{String(slot.minute).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSlot(index)}
                    aria-label="Supprimer cette disponibilité"
                    className="text-gray-500 transition hover:text-gray-800 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="submit"
                disabled={submitState === "loading"}
                className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-10 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:from-amber-500 hover:to-amber-600 disabled:opacity-60 cursor-pointer"
              >
                {submitState === "loading" ? "Envoi..." : "Envoyer"}
              </button>
              {submitState === "success" && (
                <p className="text-sm font-medium text-emerald-300">
                  Votre demande a bien été envoyée, merci !
                </p>
              )}
              {submitState === "error" && serverError && (
                <p className="text-sm font-medium text-red-300">{serverError}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="mt-1 text-xs font-medium text-red-300">{message}</p>;
}

function TextInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full rounded-full bg-white/95 px-5 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 ${
        error ? "ring-2 ring-red-400" : "focus:ring-amber-400"
      }`}
    />
  );
}

function RadioOption({
  label,
  value,
  name,
  register,
}: {
  label: string;
  value: string;
  name: "civility" | "requestType";
  register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
      <input
        type="radio"
        value={value}
        className="h-3.5 w-3.5 cursor-pointer accent-white"
        {...register(name, { required: true })}
      />
      {label}
    </label>
  );
}

function SelectPill({
  value,
  onChange,
  children,
  narrow,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className={`relative ${narrow ? "w-20" : "w-32"}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-full bg-white/95 px-4 py-2.5 pr-8 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
      >
        {children}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-2.5 w-3 -translate-y-1/2 text-gray-500" />
    </div>
  );
}
