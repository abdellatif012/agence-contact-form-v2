import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissions, saveSubmission } from "@/lib/db";
import { validateSubmission } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ field: "_", message: "JSON invalide." }] },
      { status: 400 }
    );
  }

  const { data, errors } = validateSubmission(body);

  if (errors || !data) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const record = saveSubmission(data);
    return NextResponse.json({ id: record.id }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la demande", error);
    return NextResponse.json(
      { errors: [{ field: "_", message: "Erreur serveur lors de l'enregistrement." }] },
      { status: 500 }
    );
  }
}

export async function GET() {
  const submissions = getAllSubmissions();
  return NextResponse.json(submissions);
}
