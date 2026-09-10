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
import { format } from "date-fns";

export default async function BatchesPage() {
  const batches = await prisma.batch.findMany({
    include: { base: true, events: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

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
        <CardHeader>
          <CardTitle className="text-lg">全部批次</CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              还没有批次，去<Link href="/batches/new" className="text-primary underline">收货录入</Link>。
            </p>
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
