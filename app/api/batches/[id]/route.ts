export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      base: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!batch) {
    return NextResponse.json({ error: "批次不存在" }, { status: 404 });
  }

  return NextResponse.json(batch);
}
