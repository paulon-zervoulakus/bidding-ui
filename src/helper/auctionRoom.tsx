import { RoomProductDTO } from "../dto/auctionRoom";
import { parseUtc } from "./isoString";

export type ChatMessage = { user: string; message: string };

export const formatPrice = (price: number) =>
  `₱${price.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const productTitle = (rp: RoomProductDTO) =>
  rp.productDetails?.title ?? `Product #${rp.productId}`;

export const getPhase = (rp: RoomProductDTO, now: number): Phase => {
  const start = parseUtc(rp.startingBidTime).getTime();
  const end = parseUtc(rp.endBidTime).getTime();
  if (now < start) return "upcoming";
  if (now < end) return "live";
  return "ended";
};
export type Phase = "upcoming" | "live" | "ended";
export const phaseStyle: Record<Phase, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-amber-100 text-amber-700" },
  live: { label: "Live", className: "bg-green-100 text-green-700" },
  ended: { label: "Ended", className: "bg-gray-100 text-gray-600" },
};

export const extractHubExceptionMessage = (message: string): string => {
  const prefix = "HubException: ";
  const index = message.indexOf(prefix);
  if (index === -1) return message;

  return message.substring(index + prefix.length).trim();
};