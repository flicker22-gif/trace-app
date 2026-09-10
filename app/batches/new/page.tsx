import { BatchForm } from "@/components/BatchForm";
import { prisma } from "@/lib/prisma";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default async function NewBatchPage() {
  const bases = await prisma.base.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">新建收货批次</h1>
      {bases.length === 0 ? (
        <Alert>
          <AlertDescription>
            还没有基地，请先<Link href="/bases/new" className="font-medium underline">新增基地</Link>。
          </AlertDescription>
        </Alert>
      ) : (
        <BatchForm bases={bases} />
      )}
    </div>
  );
}
