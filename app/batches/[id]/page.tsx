export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TraceTimeline } from "@/components/TraceTimeline";
import { EventForm } from "@/components/EventForm";
import { QRCode } from "@/components/QRCode";
import { InspectionAlert } from "@/components/InspectionAlert";
import { getLatestInspection } from "@/lib/inspection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";

interface BatchDetailPageProps {
  params: { id: string };
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const { id } = params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      base: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!batch) {
    notFound();
  }

  const latestInspection = getLatestInspection(batch.events);

  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const detailUrl = `${protocol}://${host}/batches/${batch.id}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/batches"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Link>
      </div>

      <h1 className="text-xl font-bold">批次详情</h1>

      {latestInspection?.inspectionResult === "FAIL" && (
        <InspectionAlert
          reason={latestInspection.inspectionReason}
          createdAt={latestInspection.createdAt}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">溯源链路</CardTitle>
            </CardHeader>
            <CardContent>
              <TraceTimeline batch={batch} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <QRCode url={detailUrl} label={batch.code} />
          <EventForm batchId={batch.id} />
        </div>
      </div>
    </div>
  );
}
