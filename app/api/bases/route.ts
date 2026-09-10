import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bases = await prisma.base.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bases);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "基地名称和代码不能为空" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();
    if (!/^[A-Z]{2,4}$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: "基地代码必须是 2-4 位大写字母" },
        { status: 400 }
      );
    }

    const base = await prisma.base.create({
      data: { name: name.trim(), code: normalizedCode },
    });

    return NextResponse.json(base, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "创建基地失败，可能代码或名称已存在" },
      { status: 500 }
    );
  }
}
