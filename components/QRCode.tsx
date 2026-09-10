"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeProps {
  url: string;
  label?: string;
}

export function QRCode({ url, label }: QRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCodeLib.toDataURL(url, { width: 240, margin: 2 })
      .then(setDataUrl)
      .catch(console.error);
  }, [url]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${label || "qrcode"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="批次二维码"
          className="h-48 w-48 rounded-md border object-contain"
        />
      ) : (
        <div className="flex h-48 w-48 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
          生成中...
        </div>
      )}
      {label && (
        <p className="text-center text-sm font-medium">{label}</p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={!dataUrl}
      >
        <Download className="mr-1.5 h-4 w-4" />
        下载二维码
      </Button>
    </div>
  );
}
