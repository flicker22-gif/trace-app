"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Base } from "@/lib/generated/prisma/client";

interface BatchFiltersProps {
  bases: Pick<Base, "id" | "name" | "code">[];
  initialQuery?: string;
  initialBaseId?: string;
}

const ALL_BASES = "__all__";

export function BatchFilters({
  bases,
  initialQuery = "",
  initialBaseId = "",
}: BatchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 始终保存 URL 中最新的 base，避免防抖回调闭包读到过期值
  const baseRef = useRef(initialBaseId);

  // 浏览器前进/后退时，同步 URL 里的条件到表单
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    const urlBase = searchParams.get("base") ?? "";
    setQuery(urlQuery);
    baseRef.current = urlBase;
  }, [searchParams]);

  const commit = (nextQuery: string, nextBaseId: string) => {
    baseRef.current = nextBaseId;
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextBaseId) params.set("base", nextBaseId);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      commit(value, baseRef.current);
    }, 350);
  };

  const handleBaseChange = (value: string | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commit(query, !value || value === ALL_BASES ? "" : value);
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    commit("", "");
  };

  const hasFilters = Boolean(
    (searchParams.get("q") ?? "").trim() || searchParams.get("base")
  );

  const labelForBase = (value: string | null) => {
    if (!value || value === ALL_BASES) return "全部基地";
    const base = bases.find((b) => b.id === value);
    return base ? `${base.name}（${base.code}）` : "未知基地";
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="按批次号搜索"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="搜索批次号"
          className="pl-8"
        />
      </div>

      <Select
        value={initialBaseId || ALL_BASES}
        onValueChange={handleBaseChange}
      >
        <SelectTrigger aria-label="按基地筛选" className="w-44">
          <SelectValue>{(value: string | null) => labelForBase(value)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_BASES}>全部基地</SelectItem>
          {bases.map((base) => (
            <SelectItem key={base.id} value={base.id}>
              {base.name}（{base.code}）
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          <X className="size-3.5" />
          清除筛选
        </Button>
      )}
    </div>
  );
}
