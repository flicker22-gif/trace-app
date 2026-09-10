import { prisma } from "@/lib/prisma";
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
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function BasesPage() {
  const bases = await prisma.base.findMany({
    orderBy: { createdAt: "desc" },
    include: { batches: { select: { id: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">基地管理</h1>
        <Link
          href="/bases/new"
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          新增基地
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">常用基地</CardTitle>
        </CardHeader>
        <CardContent>
          {bases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              还没有基地，先
              <Link href="/bases/new" className="text-primary underline">
                新增一个
              </Link>。
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>基地名称</TableHead>
                  <TableHead>代码</TableHead>
                  <TableHead className="text-right">批次数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bases.map((base) => (
                  <TableRow key={base.id}>
                    <TableCell className="font-medium">{base.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {base.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">{base.batches.length}</TableCell>
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
