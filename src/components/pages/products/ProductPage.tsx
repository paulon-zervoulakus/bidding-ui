import { useEffect, useMemo, useState } from "react";
import { ProductDTO, ProductListDTO } from "../../../dto/product";
import { ConditionEnum, CategoryDTO } from "../../../dto/common";
import { formatPrice } from "../../../helper/auctionRoom";
import { GetAvailableProductsByUser, CreateNewProduct, GetProductCategories } from "../../../hooks/useProducts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setProducts, setCategories } from "../../../store/product/productsSlice";

export const conditionOptions = [
	{ value: ConditionEnum.new, label: "New" },
	{ value: ConditionEnum.openBox, label: "Open Box" },
	{ value: ConditionEnum.refurbished, label: "Refurbished" },
	{ value: ConditionEnum.usedLikeNew, label: "Used Like New" },
	{ value: ConditionEnum.usedGood, label: "Used Good" },
	{ value: ConditionEnum.usedAcceptable, label: "Used Acceptable" },
	{ value: ConditionEnum.partsOut, label: "Parts Out" },
];

const conditionBadge: Partial<Record<ConditionEnum, string>> = {
	[ConditionEnum.new]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
	[ConditionEnum.openBox]: "bg-sky-50 text-sky-700 ring-sky-600/20",
	[ConditionEnum.refurbished]: "bg-violet-50 text-violet-700 ring-violet-600/20",
	[ConditionEnum.usedLikeNew]: "bg-blue-50 text-blue-700 ring-blue-600/20",
	[ConditionEnum.usedGood]: "bg-blue-50 text-blue-700 ring-blue-600/20",
	[ConditionEnum.usedAcceptable]: "bg-amber-50 text-amber-700 ring-amber-600/20",
	[ConditionEnum.partsOut]: "bg-red-50 text-red-700 ring-red-600/20",
};

const emptyForm = {
	id: 0,
	title: "",
	description: "",
	price: "",
	quantity: "1",
	sku: "",
	productCondition: ConditionEnum.new,
} as ProductDTO;

const inputClass =
	"block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

type Message = { type: "success" | "error"; text: string };

export const ProductPage: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { products } = useSelector((state: RootState) => state.product);

	const [categoriesOptions, setCategoriesOptions] = useState<CategoryDTO[]>([]);
	const [productForm, setProductForm] = useState<ProductDTO>(emptyForm);
	const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [message, setMessage] = useState<Message | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [search, setSearch] = useState("");

	const refreshProducts = () =>
		GetAvailableProductsByUser((data: ProductListDTO) => {
			dispatch(setProducts(data.products || []));
		});

	useEffect(() => {
		refreshProducts();
	}, []);

	useEffect(() => {
		GetProductCategories().then((cats) => {
			setCategoriesOptions(cats);
			dispatch(setCategories(cats));
		});
	}, []);

	// Auto-dismiss toast
	useEffect(() => {
		if (!message) return;
		const t = setTimeout(() => setMessage(null), 4000);
		return () => clearTimeout(t);
	}, [message]);

	const filteredProducts = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return products || [];
		return (products || []).filter(
			(p) => p.title?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
		);
	}, [products, search]);

	const openCreate = () => {
		setEditingProduct(null);
		setProductForm(emptyForm);
		setIsModalOpen(true);
	};

	const openEdit = (product: ProductDTO) => {
		setEditingProduct(product);
		setProductForm({ ...product });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingProduct(null);
		setProductForm(emptyForm);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage(null);

		try {
			await CreateNewProduct(editingProduct ? { ...editingProduct, ...productForm } : productForm);
			refreshProducts();
			setMessage({
				type: "success",
				text: editingProduct ? "Product updated successfully" : "Product created successfully",
			});
			closeModal();
		} catch (err) {
			console.error("Product CRUD error", err);
			setMessage({ type: "error", text: "Failed to process product request." });
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (productId: number) => {
		if (!window.confirm("Are you sure you want to delete this product?")) return;
		setIsLoading(true);
		try {
			const res = await fetch(`${__API_URL__}/api/Product/delete/`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ productId }),
			});
			if (!res.ok) throw new Error("Delete failed");

			refreshProducts();
			setMessage({ type: "success", text: "Product deleted successfully" });
		} catch (err) {
			console.error("Product delete error", err);
			setMessage({ type: "error", text: "Failed to delete product." });
		} finally {
			setIsLoading(false);
		}
	};
	console.log(filteredProducts)
	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Page header */}
			<div className="sm:flex sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-gray-900">Products</h1>
					<p className="mt-1 text-sm text-gray-500">Manage the products you list for auction.</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:mt-0"
				>
					<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
					</svg>
					New product
				</button>
			</div>

			{/* Toast / alert */}
			{message && (
				<div
					role="status"
					className={`mt-6 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
						message.type === "success"
							? "border-emerald-200 bg-emerald-50 text-emerald-800"
							: "border-red-200 bg-red-50 text-red-800"
					}`}
				>
					<span>{message.text}</span>
					<button
						type="button"
						onClick={() => setMessage(null)}
						className="text-current opacity-60 hover:opacity-100"
						aria-label="Dismiss"
					>
						✕
					</button>
				</div>
			)}

			{/* Table card */}
			<div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
					<input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by title or SKU"
						className={`${inputClass} max-w-xs`}
					/>
					<div className="flex items-center gap-3 text-sm text-gray-500">
						{isLoading && (
							<span
								className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"
								aria-label="Loading"
							/>
						)}
						<span>{filteredProducts.length} items</span>
					</div>
				</div>

				{filteredProducts.length === 0 ? (
					<div className="px-6 py-16 text-center">
						<p className="text-sm font-medium text-gray-900">
							{search ? "No matching products" : "No products yet"}
						</p>
						<p className="mt-1 text-sm text-gray-500">
							{search ? "Try a different search term." : "Create your first product to get started."}
						</p>
						{!search && (
							<button
								type="button"
								onClick={openCreate}
								className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
							>
								New product
							</button>
						)}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[720px] text-left text-sm">
							<thead className="bg-gray-50 text-xs font-medium text-gray-500">
								<tr>
									<th className="px-4 py-3">Product</th>
									<th className="px-4 py-3">Price</th>
									<th className="px-4 py-3">Qty</th>
									<th className="px-4 py-3">Condition</th>
									<th className="px-4 py-3">SKU</th>
									<th className="px-4 py-3 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{filteredProducts.map((product) => (
									<tr key={product.id} className="transition-colors hover:bg-gray-50">
										<td className="max-w-xs px-4 py-3">
											<div className="font-medium text-gray-900">{product.title}</div>
											{product.description && (
												<div className="truncate text-gray-500">{product.description}</div>
											)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
											{formatPrice(Number(product.price))}
										</td>
										<td className="px-4 py-3 text-gray-600">{product.quantity}</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
													conditionBadge[product.productCondition as ConditionEnum] ||
													"bg-gray-50 text-gray-700 ring-gray-600/20"
												}`}
											>
												{conditionOptions.find((opt) => opt.value === product.productCondition)?.label ||
													product.productCondition}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-600">{product.sku || "—"}</td>
										<td className="px-4 py-3">
											<div className="flex justify-end gap-1">
												<button
													type="button"
													onClick={() => openEdit(product)}
													className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
												>
													Edit
												</button>
												<button
													type="button"
													onClick={() => handleDelete(product.id!)}
													className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<ProductFormModal
				open={isModalOpen}
				isEdit={!!editingProduct}
				productForm={productForm}
				setProductForm={setProductForm}
				categoriesOptions={categoriesOptions}
				isLoading={isLoading}
				onClose={closeModal}
				onSubmit={handleSubmit}
			/>
		</div>
	);
};

interface ProductFormModalProps {
	open: boolean;
	isEdit: boolean;
	productForm: ProductDTO;
	setProductForm: React.Dispatch<React.SetStateAction<ProductDTO>>;
	categoriesOptions: CategoryDTO[];
	isLoading: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
}

const Field: React.FC<{ label: string; htmlFor: string; required?: boolean; children: React.ReactNode }> = ({
	label,
	htmlFor,
	required,
	children,
}) => (
	<div>
		<label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
			{label} {required && <span className="text-red-500">*</span>}
		</label>
		{children}
	</div>
);

const ProductFormModal: React.FC<ProductFormModalProps> = ({
	open,
	isEdit,
	productForm,
	setProductForm,
	categoriesOptions,
	isLoading,
	onClose,
	onSubmit,
}) => {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setProductForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const cat = categoriesOptions.find((c) => String(c.id) === e.target.value);
		// Assumes productCategory is CategoryDTO[]; adjust if the API expects a different shape
		setProductForm((prev) => ({ ...prev, productCategory: cat ? [cat] : [] } as ProductDTO));
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
			onMouseDown={(e) => e.target === e.currentTarget && onClose()}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="product-modal-title"
				className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
			>
				<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
					<h2 id="product-modal-title" className="text-lg font-semibold text-gray-900">
						{isEdit ? "Edit product" : "New product"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
						aria-label="Close"
					>
						✕
					</button>
				</div>

				<form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
					<div className="space-y-4 overflow-y-auto px-6 py-5">
						<Field label="Title" htmlFor="title" required>
							<input
								type="text"
								id="title"
								name="title"
								value={productForm.title}
								onChange={handleInputChange}
								className={inputClass}
								required
							/>
						</Field>

						<Field label="Description" htmlFor="description">
							<textarea
								id="description"
								name="description"
								value={productForm.description || ""}
								onChange={handleInputChange}
								className={`${inputClass} resize-none`}
								rows={3}
							/>
						</Field>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Field label="Price (₱)" htmlFor="price" required>
								<input
									type="number"
									id="price"
									name="price"
									value={productForm.price || ""}
									onChange={handleInputChange}
									className={inputClass}
									min={0}
									step="0.01"
									required
								/>
							</Field>
							<Field label="Quantity" htmlFor="quantity">
								<input
									type="number"
									id="quantity"
									name="quantity"
									value={productForm.quantity || "1"}
									onChange={handleInputChange}
									className={inputClass}
									min={1}
								/>
							</Field>
							<Field label="SKU" htmlFor="sku">
								<input
									type="text"
									id="sku"
									name="sku"
									value={productForm.sku || ""}
									onChange={handleInputChange}
									className={inputClass}
								/>
							</Field>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field label="Condition" htmlFor="condition" required>
								<select
									id="condition"
									name="condition"
									value={productForm.productCondition || ConditionEnum.new}
									onChange={handleInputChange}
									className={inputClass}
								>
									{conditionOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</Field>
							<Field label="Category" htmlFor="category">
								<select
									id="category"
									name="category"
									value={productForm.productCategory?.[0]?.id || ""}
									onChange={handleCategoryChange}
									className={inputClass}
								>
									<option value="">Select a category</option>
									{categoriesOptions.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.categoryName}
										</option>
									))}
								</select>
							</Field>
						</div>
					</div>

					<div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isLoading ? "Saving…" : isEdit ? "Save changes" : "Create product"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};