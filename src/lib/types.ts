export type Civility = "MME" | "M";

export type RequestType = "VISITE" | "RAPPEL" | "PHOTOS";

export interface AvailabilitySlotInput {
  day: string;
  hour: number;
  minute: number;
}

export interface SubmissionInput {
  civility: Civility;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  requestType: RequestType;
  message: string;
  availabilities: AvailabilitySlotInput[];
}

export const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const MINUTES = [0, 15, 30, 45];

export const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: "VISITE", label: "Demande de visite" },
  { value: "RAPPEL", label: "Être rappelé.e" },
  { value: "PHOTOS", label: "Plus de photos" },
];
