import { prisma } from "./prisma";

export async function generateBatchCode(
  baseCode: string,
  harvestDate: Date
): Promise<string> {
  const dateStr = formatHarvestDate(harvestDate);
  const prefix = `${baseCode}-${dateStr}-`;

  const count = await prisma.batch.count({
    where: {
      code: { startsWith: prefix },
    },
  });

  const seq = String(count + 1).padStart(2, "0");
  return `${prefix}${seq}`;
}

function formatHarvestDate(date: Date): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function parseHarvestDate(dateStr: string): Date | null {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(date.getTime())) return null;
  return date;
}
