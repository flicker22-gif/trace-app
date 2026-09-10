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
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const baseSchema = z.object({
  name: z.string().min(1, "基地名称不能为空"),
  code: z
    .string()
    .min(2, "至少 2 位")
    .max(4, "最多 4 位")
    .regex(/^[A-Za-z]+$/, "只能包含字母"),
});

type BaseFormData = z.infer<typeof baseSchema>;

export function BaseForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BaseFormData>({
    resolver: zodResolver(baseSchema),
  });

  const onSubmit = async (data: BaseFormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      router.push("/bases");
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
        <CardTitle>新增基地</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">基地名称</Label>
            <Input id="name" {...register("name")} placeholder="如：寿光 A 区" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">基地代码</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="2-4 位字母，如 SGA"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/bases")}
          >
            取消
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
