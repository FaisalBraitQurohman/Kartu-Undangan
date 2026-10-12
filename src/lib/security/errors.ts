import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof AppError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError)
    return Response.json(
      {
        error: "Data belum lengkap atau format tidak valid.",
        details: error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
    return Response.json(
      { error: "Data tersebut sudah digunakan. Silakan periksa kembali." },
      { status: 409 },
    );
  Sentry.captureException(error);
  console.error(
    "UndangKita: operasi gagal",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    { error: "Layanan sedang tidak tersedia. Silakan coba lagi nanti." },
    { status: 503 },
  );
}
