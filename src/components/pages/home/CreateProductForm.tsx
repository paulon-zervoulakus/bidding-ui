import React, { useContext, useEffect, useState } from "react";
import { ProductDTO } from "../../../dto/product";
import { ConditionEnum } from "../../../dto/common";
import { CreateNewProduct, GetProductCategories } from "../../../hooks/useProducts";
import { UserContext } from "../../../context/userContextProvider";
import { CategoryDTO } from "../../../dto/common";

interface CreateProductFormProps {
	onClose: () => void;
	onSuccess: () => void;
}

const inputClass =
	"w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

// Order categories so sub-categories follow their parent, with a depth for indentation
const flattenCategories = (
	cats: CategoryDTO[],
	parentId: number | null = null,
	depth = 0
): { cat: CategoryDTO; depth: number }[] =>
	cats
		.filter((c) => (c.parentCategoryId ?? null) === parentId)
		.flatMap((c) => [{ cat: c, depth }, ...flattenCategories(cats, c.id, depth + 1)]);

// Numeric TS enums also contain reverse-mapping keys; keep only the names
const conditionOptions = Object.entries(ConditionEnum).filter(([k]) => isNaN(Number(k))) as [
	string,
	ConditionEnum
][];

const CreateProductForm: React.FC<CreateProductFormProps> = ({ onClose, onSuccess }) => {
	const context = useContext(UserContext);
	const user = context?.user;
	const canCreate = user?.role === 3 || user?.role === 4;

	// Numbers are kept as strings while typing, converted on submit
	const [form, setForm] = useState({
		title: "",
		description: "",
		price: "",
		quantity: "1",
		sku: "",
		condition: ConditionEnum.new,
		productCategory: [],
		isSerializable: false,
		serialNumbers: "",
	});
	const [categories, setCategories] = useState<CategoryDTO[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		GetProductCategories().then(setCategories).catch(() => setCategories([]));
	}, []);

	if (!canCreate) {
		return null;
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const price = Number(form.price);
		const quantity = Number(form.quantity);
		const serials = form.isSerializable
			? form.serialNumbers.split("\n").map((s) => s.trim()).filter(Boolean)
			: [];

		if (!(price >= 0) || form.price === "") return setError("Enter a valid price.");
		if (price > 99999999.99) return setError("Price is too large.");
		if (!Number.isInteger(quantity) || quantity < 1) return setError("Quantity must be a whole number of at least 1.");

		if (serials.length > 0) {
			if (serials.length !== quantity)
				return setError(`Quantity is ${quantity} but ${serials.length} serial number(s) were entered.`);
			if (new Set(serials).size !== serials.length)
				return setError("Serial numbers must be unique.");
		}

		const payload: ProductDTO = {
			title: form.title.trim(),
			description: form.description.trim(),
			price: form.price,
			quantity: form.quantity,
			sku: form.sku.trim(),
			condition: form.condition,
			productCategory: [],
		};

		setLoading(true);
		try {
			const success = await CreateNewProduct(payload);
			if (success) {
				onSuccess();
				onClose();
			} else {
				setError("Failed to create product. Please try again.");
			}
		} catch {
			setError("Failed to create product. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
			<div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-bold text-gray-900">Create Product</h2>
					<button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
						<input
							type="text"
							name="title"
							value={form.title}
							onChange={handleChange}
							maxLength={255}
							placeholder="e.g. Vintage Rolex Submariner"
							className={inputClass}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea
							name="description"
							value={form.description}
							onChange={handleChange}
							maxLength={1024}
							rows={3}
							placeholder="Describe the product..."
							className={inputClass}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
							<input
								type="number"
								name="price"
								value={form.price}
								onChange={handleChange}
								min="0"
								step="0.01"
								placeholder="0.00"
								className={inputClass}
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
							<input
								type="number"
								name="quantity"
								value={form.quantity}
								onChange={handleChange}
								min="1"
								step="1"
								className={inputClass}
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
							<input
								type="text"
								name="sku"
								value={form.sku}
								onChange={handleChange}
								maxLength={32}
								placeholder="Optional"
								className={inputClass}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
							<select
								name="productCondition"
								value={form.condition}
								onChange={handleChange}
								className={inputClass}
							>
								{conditionOptions.map(([name, value]) => (
									<option key={name} value={value}>
										{name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
						<select
							multiple
							name="productCategoryId"
							value={form.productCategory}
							onChange={handleChange}
							className={inputClass}
						>
							<option value="">Select a category...</option>
							{flattenCategories(categories).map(({ cat, depth }) => (
								<option key={cat.id} value={cat.id}>
									{"\u00A0\u00A0".repeat(depth)}
									{depth > 0 ? "↳ " : ""}
									{cat.categoryName}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="flex items-center gap-2 text-sm text-gray-700">
							<input
								type="checkbox"
								checked={form.isSerializable}
								onChange={(e) => setForm((prev) => ({ ...prev, isSerializable: e.target.checked }))}
								className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
							/>
							Track serial numbers per unit
						</label>

						{form.isSerializable && (
							<div className="mt-2">
								<textarea
									name="serialNumbers"
									value={form.serialNumbers}
									onChange={handleChange}
									rows={4}
									placeholder="One serial number per line"
									className={`${inputClass} font-mono`}
								/>
								<p className="text-xs text-gray-500 mt-1">
									If entered, the count must match the quantity.
								</p>
							</div>
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
							{loading ? "Creating..." : "Create Product"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateProductForm;