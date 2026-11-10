import React, { useContext, useEffect, useState } from "react";
import { AuctionRoomDTO, RoomProductDTO } from "../../../dto/auctionRoom";
import { ProductDTO } from "../../../dto/product";
import { CreateAuctionRoom } from "../../../hooks/useAuctionRooms";
import { GetAvailableProducts } from "../../../hooks/useProducts";
import { UserContext } from "../../../context/userContextProvider";
import { RoomStatusEnum } from "../../../dto/common";

interface CreateRoomFormProps {
	room?: AuctionRoomDTO | null;
	onClose: () => void;
	onSuccess: (room: AuctionRoomDTO) => void;
}

// DTO times are ISO strings; <input type="datetime-local"> needs local "YYYY-MM-DDTHH:mm"
const pad = (n: number) => String(n).padStart(2, "0");
const toInput = (iso: string) => {
	const d = new Date(iso);
	if (!iso || isNaN(d.getTime())) return "";
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromInput = (value: string) => {
	const d = new Date(value);
	return !value || isNaN(d.getTime()) ? "" : d.toISOString();
};

const inputClass =
	"w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ room, onClose, onSuccess }) => {
	const context = useContext(UserContext);
	const user = context?.user;
	const canCreate = user?.role === 3 || user?.role === 4;

	// Single source of truth: seeded from `room` when editing, so inputs stay editable
	const [formData, setFormData] = useState<AuctionRoomDTO>(
		room
			? { ...room, roomProducts: room.roomProducts ?? [] }
			: {
					id: 0,
					groupName: "",
					title: "",
					description: "",
					status: RoomStatusEnum.active,
					createdAt: "",
					memberCount: 1,
					productCount: 0,
					roomProducts: [],
			  }
	);
	const [products, setProducts] = useState<ProductDTO[]>([]);
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		GetAvailableProducts().then(setProducts).catch(() => setProducts([]));
	}, []);

	if (!canCreate) {
		return null;
	}

	const roomProducts = formData.roomProducts ?? [];
	const pickableProducts = products.filter(
		(p) => !roomProducts.some((rp) => rp.productId === p.id)
	);
	// Rows already saved in the room may not be in the "available" list
	const productTitle = (productId: number) =>
		products.find((p) => p.id === productId)?.title ?? `Product #${productId}`;

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const addRoomProduct = (p: ProductDTO) => {
		const now = new Date();
		const item: RoomProductDTO = {
			id: 0,
			productId: Number(p.id),
			lastBidPrice: Number(p.price),
			startingBidPrice: Number(p.price),
			minimumBidIncrement: 1,
			startingBidTime: now.toISOString(),
			endBidTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
			productDetails: p
		};
		setFormData((prev) => ({ ...prev, roomProducts: [...(prev.roomProducts ?? []), item] }));
	};

	const updateRoomProduct = (
		productId: number,
		patch: Partial<RoomProductDTO>
	) => {
		setFormData((prev) => ({
			...prev,
			roomProducts: (prev.roomProducts ?? []).map((rp) =>
				rp.productId === productId
					? { ...rp, ...patch }
					: rp
			),
		}));
	};

	const removeRoomProduct = (productId: number) => {
		setFormData((prev) => ({
			...prev,
			roomProduct: (prev.roomProducts ?? []).filter((rp) => rp.productId !== productId),
		}));
	};

	const validateRoomProducts = (): string | null => {
		for (const rp of roomProducts) {
			const name = productTitle(rp.productId);
			if (!(rp.startingBidPrice > 0)) return `${name}: starting bid must be greater than 0.`;
			if (!(rp.minimumBidIncrement > 0)) return `${name}: minimum bid must be greater than 0.`;
			const start = new Date(rp.startingBidTime).getTime();
			const end = new Date(rp.endBidTime).getTime();
			if (isNaN(start) || isNaN(end)) return `${name}: set a start and end time.`;
			if (end <= start) return `${name}: end time must be after the start time.`;
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const validationError = validateRoomProducts();
		if (validationError) {
			setError(validationError);
			return;
		}
		// Build the request explicitly so the products are part of it
		const payload:AuctionRoomDTO = {
			id: formData.id,
			groupName: formData.groupName,
			title: formData.title,
			description: formData.description,
			status: formData.status,
			roomProducts: roomProducts.map((rp) => ({
				productId: rp.productDetails?.id ?? 0,
				startingBidPrice: rp.startingBidPrice,
				lastBidPrice: rp.lastBidPrice,
				minimumBidIncrement: rp.minimumBidIncrement,
				startingBidTime: rp.startingBidTime,
				endBidTime: rp.endBidTime,
				productDetails: rp.productDetails
			})),
		};

		setLoading(true);
		try {
			const success = await CreateAuctionRoom(payload);
			if (success) {
				onSuccess(payload);
				onClose();
			} else {
				setError("Failed to save room. Please try again.");
			}
		} catch {
			setError("Failed to save room. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	const createNewProduct = async () => {
		window.open("/products/create", "_blank", "noopener,noreferrer");
		return;
	}
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
			<div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-bold text-gray-900">{room ? "Edit" : "Create"} Auction Room</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Auction Room Name
						</label>
						<input
							type="text"
							name="groupName"
							value={formData.groupName}
							onChange={handleChange}
							placeholder="e.g. luxury-watches-2024"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Title
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="e.g. Vintage Rolex Collection"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description ?? ""}
							onChange={handleChange}
							placeholder="Describe what is being auctioned..."
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
						/>
					</div>

					{/* Room products */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="text-sm font-medium text-gray-700">
								Room Products{" "}
								<span className="text-gray-400 font-normal">({roomProducts.length})</span>
							</label>
							<button
								type="button"
								onClick={() => setIsPickerOpen(true)}
								className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
							>
								+ Add product
							</button>
						</div>

						{roomProducts.length === 0 ? (
							<p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-4 text-center">
								No products added yet.
							</p>
						) : (
							<ul className="space-y-3">
								{roomProducts.map((rp) => (
									<li key={rp.productId} className="rounded-lg border border-gray-200 p-3 min-w-0">
										<div className="flex items-center justify-between gap-3 mb-2">
											<p className="text-sm font-semibold text-gray-900 truncate">
												{rp.productDetails.title}
											</p>
											<button
												type="button"
												onClick={() => removeRoomProduct(rp.productId)}
												className="shrink-0 text-sm text-red-600 hover:text-red-700"
											>
												Remove
											</button>
										</div>
										<div className="grid grid-cols-2 gap-2">
											<label className="text-xs text-gray-600">
												Starting bid
												<input
													type="number"
													step="0.01"
													value={rp.startingBidPrice ?? ""}
													onChange={(e) => {
														const value = e.target.value;

														updateRoomProduct(rp.productId, {
															startingBidPrice: value === "" ? 0 : Number(value),
															lastBidPrice: value === "" ? 0 : Number(value),
														});
													}}
													className={inputClass}
												/>
											</label>
											<label className="text-xs text-gray-600">
												Min bid increment
												<input
													type="number"
													min="0"
													step="0.01"
													value={rp.minimumBidIncrement}
													onChange={(e) =>
														updateRoomProduct(rp.productId, { minimumBidIncrement: Number(e.target.value) })
													}
													className={inputClass}
												/>
											</label>
											<label className="text-xs text-gray-600">
												Starts
												<input
													type="datetime-local"
													value={toInput(rp.startingBidTime)}
													onChange={(e) =>
														updateRoomProduct(rp.productId, { startingBidTime: fromInput(e.target.value) })
													}
													className={inputClass}
												/>
											</label>
											<label className="text-xs text-gray-600">
												Ends
												<input
													type="datetime-local"
													value={toInput(rp.endBidTime)}
													onChange={(e) =>
														updateRoomProduct(rp.productId, { endBidTime: fromInput(e.target.value) })
													}
													className={inputClass}
												/>
											</label>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
							{error}
						</div>
					)}

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
							className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
						>
							{loading ? "Saving..." : room ? "Save" : "Create Room"}
						</button>
					</div>
				</form>
			</div>

			{/* Product picker dialog (sibling of the card so it isn't clipped by its scroll area) */}
			{isPickerOpen && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 sm:p-6">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-sm sm:max-w-md p-6 max-h-[80vh] flex flex-col">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold text-gray-900">Add Products</h3>
							<button
								type="button"
								onClick={() => setIsPickerOpen(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								✕
							</button>
						</div>

						{pickableProducts.length === 0 ? (
							<p className="text-sm text-gray-500 text-center py-6">
								{products.length === 0 ? "No available products." : "All available products are already added."}
							</p>
						) : (
							<ul className="flex-1 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-200">
								{pickableProducts.map((p) => (
									<li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 min-w-0">
										<div className="min-w-0">
											<p className="text-sm text-gray-900 truncate">{p.title}</p>
											<p className="text-xs text-gray-500">${p.price}</p>
										</div>
										<button
											type="button"
											onClick={() => addRoomProduct(p)}
											className="shrink-0 px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
										>
											Add
										</button>
									</li>
								))}
							</ul>
						)}
						<div className="flex gap-3 pt-4">
							<button
								type="button"
								onClick={() => createNewProduct()}
								className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
							>
								+ Create New Product
							</button>
							<button
								type="button"
								onClick={() => setIsPickerOpen(false)}
								className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
								>
								Done
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default CreateRoomForm;