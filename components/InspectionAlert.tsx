import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";

interface InspectionAlertProps {
  reason: string | null;
  createdAt: Date | string;
}

export function InspectionAlert({ reason, createdAt }: InspectionAlertProps) {
  const time = format(new Date(createdAt), "yyyy-MM-dd HH:mm");

  return (
    <Alert
      variant="destructive"
      className="border-destructive/40 bg-destructive/10 py-3"
    >
      <ShieldX className="size-5" />
      <AlertTitle className="text-base">质检不合格</AlertTitle>
      <AlertDescription className="text-destructive/90">
        最近一次质检（{time}）判定为不合格
        {reason ? `，原因：${reason}` : ""}。请暂停发货并核实处置。
      </AlertDescription>
    </Alert>
  );
}
