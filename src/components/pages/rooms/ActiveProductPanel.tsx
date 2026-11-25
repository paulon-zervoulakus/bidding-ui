import { useState } from "react";
import { AuctionBidDTO, RoomProductDTO } from "../../../dto/auctionRoom";
import { bidThresholdCountdown as tc, formatPrice, getPhase, productTitle } from "../../../helper/auctionRoom";
import { formatRemaining, parseUtc } from "../../../helper/isoString";
import { FlashWrap } from "../../wrapper/FlashWrap";
import { BidForm } from "./BidForm";
import { PhaseBadge } from "./PhaseBadge";

export const ActiveProductPanel: React.FC<{
  product: RoomProductDTO;
  now: number;
  canBid: boolean;
  bids: AuctionBidDTO[];
  onBid: (amount: number) => Promise<void>;
}> = ({ product, now, canBid, bids, onBid }) => {
  const phase = getPhase(product, now);
  const startMs = parseUtc(product.startingBidTime).getTime();
  const endMs = parseUtc(product.endBidTime).getTime();
  const remainingMs = (phase === "live" ? endMs : startMs) - now;
  const isUrgent = phase === "live" && remainingMs <= 30_000;
  const isCritical = phase === "live" && remainingMs <= 30_000;

  // console.log(isUrgent, isCritical, remainingMs, tc.urgent * 1000, tc.critical * 1000);

  const INITIAL_BIDS = 5;
  const MAX_BIDS = 20;
  // inside the component
  const [showAll, setShowAll] = useState(false);
  const visibleBids = bids.slice(0, showAll ? MAX_BIDS : INITIAL_BIDS);
  const hasMore = bids.length > INITIAL_BIDS;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Now bidding
          </p>
          <h2 className="text-xl font-bold text-gray-900 truncate">{productTitle(product)}</h2>
          {product.productDetails?.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">
              {product.productDetails.description}
            </p>
          )}
        </div>
        <PhaseBadge phase={phase} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <div className="rounded-lg bg-indigo-50 p-4">
          <p className="text-xs text-indigo-700">Last bid</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1"><FlashWrap value={formatPrice(product.lastBidPrice)} /></p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Starting bid</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(product.startingBidPrice)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Min. increment</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(product.minimumBidIncrement)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
        <div>
          <p className="text-gray-500">Starts</p>
          <p className="font-medium text-gray-800">{parseUtc(product.startingBidTime).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Ends</p>
          <p className="font-medium text-gray-800">{parseUtc(product.endBidTime).toLocaleString()}</p>
        </div>
      </div>

      {phase !== "ended" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p
            className={`text-sm font-semibold ${
              phase === "live"
                ? isCritical
                  ? "text-red-600 animate-heartbeat"
                  : isUrgent
                    ? "text-red-600"
                    : "text-green-700"
                : "text-amber-700"
            }`}
          >
            {phase === "live" ? "Ends in " : "Starts in "}
            <span className="font-mono tabular-nums">
              {formatRemaining(remainingMs)}
            </span>
          </p>
          {phase === "live" && product.endBidTimeExtended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              ⏱ Extended
            </span>
          )}
        </div>
      )}

      <BidForm product={product} phase={phase} canBid={canBid} onBid={onBid} />

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent bids</h3>
        {bids.length === 0 ? (
          <p className="text-sm text-gray-400">No bids yet.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {visibleBids.map((bid, i) => (
                <li key={`${bid.timestamp}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <span className="block truncate text-gray-700">{bid.bidder}</span>
                    <time dateTime={new Date(bid.timestamp ?? "").toISOString()} className="block text-xs text-gray-400">
                      {new Date(bid.timestamp ?? "").toLocaleString()}
                    </time>
                  </div>
                  <span className="shrink-0 font-semibold text-indigo-600">{formatPrice(bid.amount)}</span>
                </li>
              ))}
            </ul>
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {showAll ? "Show less" : `Show more (${Math.min(bids.length, MAX_BIDS) - INITIAL_BIDS})`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};
