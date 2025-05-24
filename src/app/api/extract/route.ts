import { NextRequest } from "next/server";
import pdfParse from "pdf-parse";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer); // <-- Pass a Buffer, not a file path!
    return Response.json({
      numPages: data.numpages,
      text: data.text.slice(0, 1000),
    });
  } catch (err) {
    console.error("PDF Parse Error:", err);
    return Response.json({ error: (err as Error).toString() }, { status: 500 });
  }
}

export function GET() {
  return Response.json({ status: "ok" });
}