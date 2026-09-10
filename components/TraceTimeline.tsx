"use client";

import { useEffect, useState } from "react";
import { Batch, Base, Event } from "@/lib/generated/prisma/client";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Truck,
  PackageCheck,
  ClipboardCheck,
  CircleDot,
  Sprout,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const EVENT_LABELS: Record<string, string> = {
  SORTING: "分拣",
  SHIPPING: "发货",
  INSPECTION: "质检",
  OTHER: "其他",
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  SORTING: <PackageCheck className="h-4 w-4" />,
  SHIPPING: <Truck className="h-4 w-4" />,
  INSPECTION: <ClipboardCheck className="h-4 w-4" />,
  OTHER: <CircleDot className="h-4 w-4" />,
};

type BatchWithRelations = Batch & {
  base: Base;
  events: Event[];
};

interface TraceTimelineProps {
  batch: BatchWithRelations;
}

export function TraceTimeline({ batch }: TraceTimelineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = [
    {
      id: "harvest",
      type: "采收收货",
      operator: batch.inspector,
      note: `${batch.base.name}（${batch.base.code}）采收`,
      createdAt: batch.createdAt,
      inspectionResult: undefined,
      inspectionReason: undefined,
      icon: <Sprout className="h-4 w-4 text-green-600" />,
    },
    ...batch.events.map((event) => ({
      id: event.id,
      type: EVENT_LABELS[event.type] || event.type,
      operator: event.operator,
      note: event.note || undefined,
      createdAt: event.createdAt,
      inspectionResult: event.inspectionResult,
      inspectionReason: event.inspectionReason,
      icon: EVENT_ICONS[event.type] || <CircleDot className="h-4 w-4" />,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          批次信息
        </h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">批次号</dt>
            <dd className="font-mono font-medium">{batch.code}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">基地</dt>
            <dd>{batch.base.name}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">采收日期</dt>
            <dd>
              {mounted
                ? format(new Date(batch.harvestDate), "yyyy-MM-dd")
                : batch.harvestDate.toString()}
            </dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-muted-foreground">检测员</dt>
            <dd>{batch.inspector}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          溯源时间线
        </h3>
        <div className="relative space-y-0">
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border bg-background",
                    item.inspectionResult === "FAIL" &&
                      "border-destructive text-destructive"
                  )}
                >
                  {item.icon}
                </div>
                {index < items.length - 1 && (
                  <div className="my-1 h-full min-h-[2rem] w-px bg-border" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.type}</span>
                  {item.inspectionResult === "PASS" && (
                    <Badge variant="success">合格</Badge>
                  )}
                  {item.inspectionResult === "FAIL" && (
                    <Badge variant="destructive">不合格</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {mounted
                      ? format(
                          new Date(item.createdAt),
                          "MM-dd HH:mm",
                          { locale: zhCN }
                        )
                      : item.createdAt.toString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  操作人：{item.operator}
                </p>
                {item.inspectionResult === "FAIL" && item.inspectionReason && (
                  <p className="mt-1 text-sm text-destructive">
                    不合格原因：{item.inspectionReason}
                  </p>
                )}
                {item.note && (
                  <p className="mt-1 text-sm">{item.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
