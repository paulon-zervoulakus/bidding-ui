import React, { useState } from "react";
import { AuctionRoomDTO } from "../../../dto/auctionRoom";
import { SendBid } from "../../../hooks/signalRService";

interface Bid {
	bidder: string;
	amount: number;
	timestamp: string;
}

interface BidPanelProps {
	room: AuctionRoomDTO;
	currentPrice: number;
	bids: Bid[];
	isJoined: boolean;
}

const BidPanel: React.FC<BidPanelProps> = ({
	room,
	currentPrice,
	bids,
	isJoined,
}) => {
	const [bidAmount, setBidAmount] = useState<string>("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const minBid = currentPrice + 1;

	const handlePlaceBid = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const amount = parseFloat(bidAmount);
		if (isNaN(amount) || amount < minBid) {
			setError(`Minimum bid is ₱${minBid.toFixed(2)}`);
			return;
		}

		setSending(true);
		try {
			await SendBid(room.groupName, amount, "You");
			setBidAmount("");
		} catch {
			setError("Failed to place bid. Please try again.");
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Current Price Card */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
				<h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
					Current Price
				</h2>
				<div className="text-center mb-4">
					<span className="text-3xl sm:text-4xl font-bold text-indigo-600">
						₱{currentPrice.toFixed(2)}
					</span>
				</div>
				<div className="text-center text-sm text-gray-500">
					Minimum next bid: ₱{minBid.toFixed(2)}
				</div>
			</div>

			{/* Bid Form */}
			{isJoined && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
					<h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
						Place Your Bid
					</h2>
					<form onSubmit={handlePlaceBid} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Bid Amount (₱)
							</label>
							<input
								type="number"
								step="0.01"
								min={minBid}
								value={bidAmount}
								onChange={(e) => setBidAmount(e.target.value)}
								placeholder={`Min: ₱${minBid.toFixed(2)}`}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								required
							/>
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={sending}
							className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
						>
							{sending ? "Placing..." : "Place Bid"}
						</button>
					</form>
				</div>
			)}

			{/* Bid History */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
				<h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
					Bid History
				</h2>
				{bids.length === 0 ? (
					<p className="text-sm text-gray-500 text-center py-4">
						No bids yet. Be the first!
					</p>
				) : (
					<ul className="space-y-2 max-h-64 overflow-y-auto">
						{bids.map((bid, i) => (
							<li
								key={i}
								className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
							>
								<span className="font-medium text-gray-700">{bid.bidder}</span>
								<span className="font-bold text-indigo-600">
									₱{bid.amount.toFixed(2)}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default BidPanel;
