import { AuctionBidDTO, RoomProductDTO } from "../../../dto/auctionRoom";
import { formatPrice, getPhase, productTitle } from "../../../helper/auctionRoom";
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
        <p className={`mt-3 text-sm font-semibold ${phase === "live" ? "text-green-700" : "text-amber-700"}`}>
          {phase === "live" ? "Ends in " : "Starts in "}
          <span className="font-mono tabular-nums">
            {formatRemaining((phase === "live" ? endMs : startMs) - now)}
          </span>
        </p>
      )}

      <BidForm product={product} phase={phase} canBid={canBid} onBid={onBid} />

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent bids</h3>
        {bids.length === 0 ? (
          <p className="text-sm text-gray-400">No bids yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {bids.slice(0, 5).map((bid, i) => (
              <li key={`${bid.timestamp}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="truncate text-gray-700">{bid.bidder}</span>
                <span className="shrink-0 font-semibold text-indigo-600">{formatPrice(bid.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
