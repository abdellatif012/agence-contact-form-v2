import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { SubmissionInput } from "./types";

// Stockage des données dans un simple fichier JSON (data/submissions.json).
//
// Pourquoi un fichier JSON plutôt qu'une "vraie" base SQL ?
// Les librairies SQLite pour Node.js (better-sqlite3, node:sqlite...)
// nécessitent soit un module natif compilé pour la plateforme exacte de
// l'utilisateur (souvent indisponible pour certaines versions de Node sur
// Windows sans Visual Studio Build Tools), soit une version récente de
// Node.js. Pour garantir que ce projet s'installe et tourne instantanément
// sur N'IMPORTE QUELLE machine (Windows/Mac/Linux, peu importe la version
// de Node >= 18), on utilise ici un stockage fichier fait à la main avec
// les modules natifs `fs` et `crypto` — aucune dépendance externe, aucune
// compilation, ça fonctionne partout.
//
// Le code est volontairement écrit comme une petite couche d'accès aux
// données ("repository"), avec des fonctions claires (getAllSubmissions,
// saveSubmission), pour qu'on puisse facilement la remplacer plus tard par
// une vraie base SQL (Postgres, MySQL...) sans toucher au reste du projet :
// seul ce fichier serait à réécrire.

export interface AvailabilitySlotRecord {
  day: string;
  hour: number;
  minute: number;
}

export interface SubmissionRecord {
  id: string;
  civility: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  requestType: string;
  message: string;
  createdAt: string;
  availabilities: AvailabilitySlotRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "submissions.json");

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "[]", "utf-8");
  }
}

function readAll(): SubmissionRecord[] {
  ensureDataFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw) as SubmissionRecord[];
  } catch {
    // Fichier corrompu ou vide : on repart d'une liste propre plutôt que de planter.
    return [];
  }
}

function writeAll(records: SubmissionRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");
}

export function getAllSubmissions(): SubmissionRecord[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveSubmission(data: SubmissionInput): SubmissionRecord {
  const record: SubmissionRecord = {
    id: randomUUID(),
    civility: data.civility,
    lastName: data.lastName,
    firstName: data.firstName,
    email: data.email,
    phone: data.phone,
    requestType: data.requestType,
    message: data.message,
    createdAt: new Date().toISOString(),
    availabilities: data.availabilities.map((slot) => ({
      day: slot.day,
      hour: slot.hour,
      minute: slot.minute,
    })),
  };

  const records = readAll();
  records.push(record);
  writeAll(records);

  return record;
}
