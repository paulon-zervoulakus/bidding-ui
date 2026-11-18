import { useEffect, useState } from "react";
import { RoomProductDTO } from "../../../dto/auctionRoom";
import { formatPrice, Phase, round2 } from "../../../helper/auctionRoom";

export const BidForm: React.FC<{
  product: RoomProductDTO;
  phase: Phase;
  canBid: boolean;
  onBid: (amount: number) => Promise<void>;
}> = ({ product, phase, canBid, onBid }) => {
  const increment = product.minimumBidIncrement;
  const minNext = round2(product.lastBidPrice + increment);

  const [amount, setAmount] = useState(minNext.toFixed(2));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to the new minimum whenever the product changes or someone outbids
  useEffect(() => {
    setAmount(minNext.toFixed(2));
    setError(null);
  }, [product.productId, minNext]);

  const quickAmounts = increment > 0 ? [0, 1, 2].map((k) => round2(minNext + k * increment)) : [];
  const disabled = !canBid || phase !== "live" || sending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || Math.round(value * 100) < Math.round(minNext * 100)) {
      setError(`Bid must be at least ${formatPrice(minNext)}.`);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onBid(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send bid.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Your bid <span className="text-gray-500 font-normal">(minimum {formatPrice(minNext)})</span>
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="number"
          min={minNext}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={disabled}
          className="shrink-0 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {sending ? "Sending..." : "Place bid"}
        </button>
      </div>

      {quickAmounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {quickAmounts.map((value) => (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => setAmount(value.toFixed(2))}
              className="px-2.5 py-1 text-xs rounded-full border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
            >
              {formatPrice(value)}
            </button>
          ))}
        </div>
      )}

      {phase !== "live" && (
        <p className="text-xs text-gray-500 mt-2">
          {phase === "upcoming" ? "Bidding hasn't started for this product." : "Bidding has ended for this product."}
        </p>
      )}
      {!canBid && phase === "live" && (
        <p className="text-xs text-gray-500 mt-2">Connecting to the room…</p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
};
