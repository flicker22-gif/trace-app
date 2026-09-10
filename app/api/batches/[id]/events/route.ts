export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EVENT_TYPES = ["SORTING", "SHIPPING", "INSPECTION", "OTHER"];

const EVENT_LABELS: Record<string, string> = {
  SORTING: "分拣",
  SHIPPING: "发货",
  INSPECTION: "质检",
  OTHER: "其他",
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: batchId } = params;
    const body = await request.json();
    const { type, operator, note } = body;

    if (!type || !operator) {
      return NextResponse.json(
        { error: "事件类型和操作人不能为空" },
        { status: 400 }
      );
    }

    if (!EVENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `事件类型无效，可选：${Object.keys(EVENT_LABELS).join(", ")}` },
        { status: 400 }
      );
    }

    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return NextResponse.json({ error: "批次不存在" }, { status: 404 });
    }

    const event = await prisma.event.create({
      data: {
        batchId,
        type,
        operator: operator.trim(),
        note: note?.trim() || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "创建事件失败" }, { status: 500 });
  }
}
