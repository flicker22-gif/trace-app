"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import type { Base } from "@/lib/generated/prisma/client";

const batchSchema = z.object({
  baseId: z.string().min(1, "请选择基地"),
  harvestDate: z.string().min(1, "请选择采收日期"),
  inspector: z.string().min(1, "检测员不能为空"),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface BatchFormProps {
  bases: Base[];
}

export function BatchForm({ bases }: BatchFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
  });

  const onSubmit = async (data: BatchFormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      const batch = await res.json();
      router.push(`/batches/${batch.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新建收货批次</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>基地</Label>
            <Select onValueChange={(value) => setValue("baseId", value as string)}>
              <SelectTrigger>
                <SelectValue placeholder="选择基地" />
              </SelectTrigger>
              <SelectContent>
                {bases.map((base) => (
                  <SelectItem key={base.id} value={base.id}>
                    {base.name}（{base.code}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.baseId && (
              <p className="text-sm text-destructive">{errors.baseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvestDate">采收日期</Label>
            <Input id="harvestDate" type="date" {...register("harvestDate")} />
            {errors.harvestDate && (
              <p className="text-sm text-destructive">
                {errors.harvestDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspector">经手检测员</Label>
            <Input
              id="inspector"
              {...register("inspector")}
              placeholder="如：张三"
            />
            {errors.inspector && (
              <p className="text-sm text-destructive">
                {errors.inspector.message}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={loading || bases.length === 0}>
            {loading ? "保存中..." : "创建批次"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/batches")}
          >
            取消
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
