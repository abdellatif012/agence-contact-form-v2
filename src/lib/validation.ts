import { SubmissionInput } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSubmission(body: unknown): {
  data?: SubmissionInput;
  errors?: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (typeof body !== "object" || body === null) {
    return { errors: [{ field: "_", message: "Corps de requête invalide." }] };
  }

  const b = body as Record<string, unknown>;

  if (b.civility !== "MME" && b.civility !== "M") {
    errors.push({ field: "civility", message: "Merci de choisir une civilité." });
  }

  if (typeof b.lastName !== "string" || b.lastName.trim().length === 0) {
    errors.push({ field: "lastName", message: "Le nom est obligatoire." });
  }

  if (typeof b.firstName !== "string" || b.firstName.trim().length === 0) {
    errors.push({ field: "firstName", message: "Le prénom est obligatoire." });
  }

  if (typeof b.email !== "string" || !EMAIL_REGEX.test(b.email.trim())) {
    errors.push({ field: "email", message: "Adresse email invalide." });
  }

  if (typeof b.phone !== "string" || b.phone.trim().length < 6) {
    errors.push({ field: "phone", message: "Numéro de téléphone invalide." });
  }

  if (!["VISITE", "RAPPEL", "PHOTOS"].includes(b.requestType as string)) {
    errors.push({ field: "requestType", message: "Merci de choisir l'objet de la demande." });
  }

  if (typeof b.message !== "string" || b.message.trim().length === 0) {
    errors.push({ field: "message", message: "Le message est obligatoire." });
  }

  if (!Array.isArray(b.availabilities)) {
    errors.push({ field: "availabilities", message: "Format de disponibilités invalide." });
  } else {
    for (const slot of b.availabilities) {
      if (
        typeof slot !== "object" ||
        slot === null ||
        typeof (slot as Record<string, unknown>).day !== "string" ||
        typeof (slot as Record<string, unknown>).hour !== "number" ||
        typeof (slot as Record<string, unknown>).minute !== "number"
      ) {
        errors.push({ field: "availabilities", message: "Créneau de disponibilité invalide." });
        break;
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      civility: b.civility as "MME" | "M",
      lastName: (b.lastName as string).trim(),
      firstName: (b.firstName as string).trim(),
      email: (b.email as string).trim(),
      phone: (b.phone as string).trim(),
      requestType: b.requestType as SubmissionInput["requestType"],
      message: (b.message as string).trim(),
      availabilities: b.availabilities as SubmissionInput["availabilities"],
    },
  };
}
