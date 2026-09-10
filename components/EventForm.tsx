"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const EVENT_TYPES = [
  { value: "SORTING", label: "分拣" },
  { value: "SHIPPING", label: "发货" },
  { value: "INSPECTION", label: "质检" },
  { value: "OTHER", label: "其他" },
];

const eventSchema = z.object({
  type: z.string().min(1, "请选择事件类型"),
  operator: z.string().min(1, "操作人不能为空"),
  note: z.string().optional(),
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
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/batches/${batchId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
            <Select onValueChange={(value) => setValue("type", value as string)}>
              <SelectTrigger>
                <SelectValue placeholder="选择事件类型" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

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
