import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchFilters } from "@/components/BatchFilters";
import Link from "next/link";
import { Plus, SearchX } from "lucide-react";
import { format } from "date-fns";

interface BatchesPageProps {
  searchParams: { q?: string; base?: string };
}

export default async function BatchesPage({ searchParams }: BatchesPageProps) {
  const q = searchParams.q?.trim();
  const baseId = searchParams.base?.trim();

  const where: Prisma.BatchWhereInput = {};
  if (q) where.code = { contains: q };
  if (baseId) where.baseId = baseId;
  const hasFilters = Boolean(q || baseId);

  const [batches, bases, matchedBase] = await Promise.all([
    prisma.batch.findMany({
      where: hasFilters ? where : undefined,
      include: { base: true, events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.base.findMany({ orderBy: { createdAt: "desc" } }),
    baseId
      ? prisma.base.findUnique({ where: { id: baseId } })
      : Promise.resolve(null),
  ]);

  // base 参数指向已删除/不存在的基地时，视为无筛选条件以外的明确提示
  const invalidBase = Boolean(baseId && !matchedBase);

  const cardTitle = hasFilters
    ? `筛选结果（${batches.length}）`
    : "全部批次";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">批次列表</h1>
        <Link href="/batches/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-1.5 h-4 w-4" />
          新建批次
        </Link>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-lg">{cardTitle}</CardTitle>
          <BatchFilters
            bases={bases}
            initialQuery={q ?? ""}
            initialBaseId={baseId ?? ""}
          />
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            hasFilters ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <SearchX className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">没有匹配的批次</p>
                <p className="text-sm text-muted-foreground">
                  {invalidBase
                    ? "所选基地不存在或已删除，换个条件试试。"
                    : "没有批次符合当前的搜索/筛选条件，换个批次号或基地试试。"}
                </p>
                <Link
                  href="/batches"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  清除筛选条件
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                还没有批次，去
                <Link href="/batches/new" className="text-primary underline">
                  收货录入
                </Link>
                。
              </p>
            )
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>批次号</TableHead>
                  <TableHead>基地</TableHead>
                  <TableHead>采收日期</TableHead>
                  <TableHead>检测员</TableHead>
                  <TableHead className="text-right">环节数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <Link
                        href={`/batches/${batch.id}`}
                        className="font-mono font-medium hover:underline"
                      >
                        {batch.code}
                      </Link>
                    </TableCell>
                    <TableCell>{batch.base.name}</TableCell>
                    <TableCell>
                      {format(new Date(batch.harvestDate), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>{batch.inspector}</TableCell>
                    <TableCell className="text-right">
                      {batch.events.length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
