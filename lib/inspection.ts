import type { Event } from "@/lib/generated/prisma/client";

type InspectionEvent = Pick<
  Event,
  "type" | "inspectionResult" | "inspectionReason" | "createdAt"
>;

/**
 * 取批次最近一次带结论的质检事件。
 * 一个批次可能质检多次，以 createdAt 最新的一次为准；
 * 老数据（inspectionResult 为空）视为未质检，不参与判定。
 */
export function getLatestInspection<TEvt extends InspectionEvent>(
  events: TEvt[]
): TEvt | null {
  let latest: TEvt | null = null;
  for (const event of events) {
    if (
      event.type === "INSPECTION" &&
      (event.inspectionResult === "PASS" ||
        event.inspectionResult === "FAIL") &&
      (!latest || event.createdAt > latest.createdAt)
    ) {
      latest = event;
    }
  }
  return latest;
}
