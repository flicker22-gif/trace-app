import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBatchCode } from "@/lib/batch-code";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const batches = await prisma.batch.findMany({
    where: q ? { code: { contains: q } } : undefined,
    include: {
      base: true,
      events: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(batches);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseId, harvestDate, inspector } = body;

    if (!baseId || !harvestDate || !inspector) {
      return NextResponse.json(
        { error: "基地、采收日期和检测员不能为空" },
        { status: 400 }
      );
    }

    const base = await prisma.base.findUnique({ where: { id: baseId } });
    if (!base) {
      return NextResponse.json({ error: "基地不存在" }, { status: 404 });
    }

    const date = new Date(harvestDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "采收日期格式错误" },
        { status: 400 }
      );
    }

    const code = await generateBatchCode(base.code, date);

    const batch = await prisma.batch.create({
      data: {
        code,
        baseId,
        harvestDate: date,
        inspector: inspector.trim(),
      },
      include: { base: true },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "创建批次失败" }, { status: 500 });
  }
}
