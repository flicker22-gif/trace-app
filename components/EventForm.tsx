"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { value: "SORTING", label: "分拣" },
  { value: "SHIPPING", label: "发货" },
  { value: "INSPECTION", label: "质检" },
  { value: "OTHER", label: "其他" },
];

const eventSchema = z
  .object({
    type: z.string().min(1, "请选择事件类型"),
    operator: z.string().min(1, "操作人不能为空"),
    note: z.string().optional(),
    inspectionResult: z.string().optional(),
    inspectionReason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "INSPECTION") return;
    if (data.inspectionResult !== "PASS" && data.inspectionResult !== "FAIL") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inspectionResult"],
        message: "请选择质检结论：合格或不合格",
      });
    }
    if (data.inspectionResult === "FAIL" && !data.inspectionReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["inspectionReason"],
        message: "不合格时必须填写原因",
      });
    }
  });

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  batchId: string;
  onSuccess?: () => void;
}

export function EventForm({ batchId, onSuccess }: EventFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const type = watch("type");
  const inspectionResult = watch("inspectionResult");
  const isInspection = type === "INSPECTION";
  const isFailed = isInspection && inspectionResult === "FAIL";

  const onSubmit = async (data: EventFormData) => {
    setLoading(true);
    setError(null);

    const payload: EventFormData = {
      type: data.type,
      operator: data.operator,
      note: data.note,
      inspectionResult: undefined,
      inspectionReason: undefined,
    };
    if (data.type === "INSPECTION") {
      payload.inspectionResult = data.inspectionResult;
      if (data.inspectionResult === "FAIL") {
        payload.inspectionReason = data.inspectionReason;
      }
    }

    try {
      const res = await fetch(`/api/batches/${batchId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加环节记录</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>事件类型</Label>
            <Select
              value={type ?? null}
              onValueChange={(value) =>
                setValue("type", value ?? "", { shouldValidate: false })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择事件类型" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((eventType) => (
                  <SelectItem key={eventType.value} value={eventType.value}>
                    {eventType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {isInspection && (
            <div className="space-y-4 rounded-lg border bg-muted/40 p-3">
              <div className="space-y-2">
                <Label>质检结论</Label>
                <Select
                  value={inspectionResult ?? null}
                  onValueChange={(value) =>
                    setValue("inspectionResult", value ?? "", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      isFailed && "border-destructive text-destructive"
                    )}
                  >
                    <SelectValue>
                      {(value: string | null) =>
                        value === "PASS"
                          ? "合格"
                          : value === "FAIL"
                            ? "不合格"
                            : "选择合格 / 不合格"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASS">合格</SelectItem>
                    <SelectItem value="FAIL">不合格</SelectItem>
                  </SelectContent>
                </Select>
                {errors.inspectionResult && (
                  <p className="text-sm text-destructive">
                    {errors.inspectionResult.message}
                  </p>
                )}
              </div>

              {isFailed && (
                <div className="space-y-2">
                  <Label htmlFor="inspectionReason">不合格原因</Label>
                  <Textarea
                    id="inspectionReason"
                    {...register("inspectionReason")}
                    placeholder="如：农残超标、外观腐烂率超 5%"
                    aria-invalid={Boolean(errors.inspectionReason)}
                  />
                  {errors.inspectionReason && (
                    <p className="text-sm text-destructive">
                      {errors.inspectionReason.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="operator">操作人</Label>
            <Input
              id="operator"
              {...register("operator")}
              placeholder="如：李四"
            />
            {errors.operator && (
              <p className="text-sm text-destructive">
                {errors.operator.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">备注（可选）</Label>
            <Input
              id="note"
              {...register("note")}
              placeholder="如：分拣 50 箱，发往朝阳市场"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "保存中..." : "添加记录"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
