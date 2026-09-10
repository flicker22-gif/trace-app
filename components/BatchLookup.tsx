"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export function BatchLookup() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/batches?q=${encodeURIComponent(code.trim())}`);
      const batches = await res.json();

      if (!Array.isArray(batches) || batches.length === 0) {
        setError("未找到该批次，请检查批次号");
        return;
      }

      if (batches.length > 1) {
        router.push(`/batches?q=${encodeURIComponent(code.trim())}`);
      } else {
        router.push(`/batches/${batches[0].id}`);
      }
    } catch {
      setError("查询失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="batch-code">输入批次号</Label>
        <div className="flex gap-2">
          <Input
            id="batch-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="如：SGA-240910-01"
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !code.trim()}>
            <Search className="mr-1.5 h-4 w-4" />
            {loading ? "查询中..." : "查询"}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
