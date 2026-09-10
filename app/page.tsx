import { BatchLookup } from "@/components/BatchLookup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Package, Sprout, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const linkClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-auto flex-col gap-2 py-4"
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">果蔬批次溯源</h1>
        <p className="text-muted-foreground">
          收货录入、分拣发货、扫码/输码查整条链
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">查询批次</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchLookup />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/batches/new" className={linkClass}>
          <Sprout className="h-5 w-5 text-green-600" />
          <span>收货录入</span>
        </Link>
        <Link href="/batches" className={linkClass}>
          <Package className="h-5 w-5" />
          <span>批次列表</span>
        </Link>
        <Link href="/bases" className={linkClass}>
          <MapPin className="h-5 w-5" />
          <span>基地管理</span>
        </Link>
      </div>
    </div>
  );
}
