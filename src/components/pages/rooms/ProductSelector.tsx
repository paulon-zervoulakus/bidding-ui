import { RoomProductDTO } from "../../../dto/auctionRoom";
import { formatPrice, getPhase, productTitle } from "../../../helper/auctionRoom";
import { FlashWrap } from "../../wrapper/FlashWrap";
import { PhaseBadge } from "./PhaseBadge";

export const ProductSelector: React.FC<{
  products: RoomProductDTO[];
  activeProductId: number | null;
  now: number;
  onSelect: (productId: number) => void;
}> = ({ products, activeProductId, now, onSelect }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-3">Auction products</h2>

    {products.length === 0 ? (
      <p className="text-sm text-gray-500">No products have been added to this room yet.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((rp) => {
          const selected = rp.productId === activeProductId;
          return (
            <button
              key={rp.productId}
              type="button"
              onClick={() => onSelect(rp.productId)}
              aria-pressed={selected}
              className={`min-w-0 text-left rounded-lg border p-4 transition-colors ${
                selected
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 truncate">{productTitle(rp)}</p>
                <PhaseBadge phase={getPhase(rp, now)} />
              </div>
              <p className="text-xl font-bold text-indigo-600 mt-2">
                <FlashWrap value={formatPrice(rp.lastBidPrice)} />
              </p>
              <p className="text-xs text-gray-500">Last bid</p>
            </button>
          );
        })}
      </div>
    )}
  </section>
);