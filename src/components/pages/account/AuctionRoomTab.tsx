import { useEffect, useMemo, useState } from "react";
import { AuctionRoomDTO, RoomProductDTO } from "../../../dto/auctionRoom";
import { ProductDTO, ProductListDTO } from "../../../dto/product";
import { RoomStatusEnum, RoomVisibilityEnum, CategoryDTO } from "../../../dto/common";
import { formatPrice } from "../../../helper/auctionRoom";
import { GetAuctionRooms, CreateAuctionRoom, SubscribeAuctionRoom, UnsubscribeAuctionRoom, GetManageAuctionRooms } from "../../../hooks/useAuctionRooms";
import { GetAvailableProductsByUser, GetProductCategories } from "../../../hooks/useProducts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setAuctionRooms, updateAuctionRoom } from "../../../store/bidding/biddingSlice";

const statusBadge: Partial<Record<RoomStatusEnum, string>> = {
    [RoomStatusEnum.inActive]: "bg-gray-50 text-gray-700 ring-gray-600/20",
    [RoomStatusEnum.active]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    [RoomStatusEnum.closed]: "bg-sky-50 text-sky-700 ring-sky-600/20",
    [RoomStatusEnum.cancelled]: "bg-red-50 text-red-700 ring-red-600/20",
    [RoomStatusEnum.ended]: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

const visibilityLabels: Record<RoomVisibilityEnum, string> = {
    [RoomVisibilityEnum.private]: "Private",
    [RoomVisibilityEnum.public]: "Public",
};

const emptyRoomForm = {
    id: 0,
    groupName: "",
    title: "",
    description: "",
    status: RoomStatusEnum.active,
    visibility: RoomVisibilityEnum.private,
    createdAt: "",
    memberCount: 0,
    productCount: 0,
    roomProducts: [],
} as AuctionRoomDTO;

const inputClass =
    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

type Message = { type: "success" | "error"; text: string };

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

export const AuctionRoomTab: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { rooms } = useSelector((state: RootState) => state.bidding);

    const [categoriesOptions, setCategoriesOptions] = useState<CategoryDTO[]>([]);
    const [manageProducts, setManageProducts] = useState<ProductListDTO>({});
    const [roomForm, setRoomForm] = useState<AuctionRoomDTO>(emptyRoomForm);
    const [editingRoom, setEditingRoom] = useState<AuctionRoomDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");

    const refreshRooms = () =>
        GetAuctionRooms(async (data) => {
            dispatch(setAuctionRooms(data));
        });

    useEffect(() => {
        refreshRooms();
    }, []);

    useEffect(() => {
        GetAvailableProductsByUser((data) => setManageProducts(data));
        GetProductCategories().then((cats) => setCategoriesOptions(cats));
    }, []);

    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(t);
    }, [message]);

    const filteredRooms = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rooms || [];
        return (rooms || []).filter(
            (r) => r.title?.toLowerCase().includes(q) || r.groupName?.toLowerCase().includes(q)
        );
    }, [rooms, search]);

    const openCreate = () => {
        setEditingRoom(null);
        setRoomForm(emptyRoomForm);
        setIsModalOpen(true);
    };

    const openEdit = (room: AuctionRoomDTO) => {
        setEditingRoom(room);
        setRoomForm({ ...room, roomProducts: room.roomProducts ?? [] });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
        setRoomForm(emptyRoomForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const payload: AuctionRoomDTO = {
                id: roomForm.id,
                groupName: roomForm.groupName,
                title: roomForm.title,
                description: roomForm.description,
                status: roomForm.status,
                visibility: roomForm.visibility,
                roomProducts: roomForm.roomProducts?.map((rp) => ({
                    productId: rp.productDetails?.id ?? 0,
                    startingBidPrice: rp.startingBidPrice,
                    lastBidPrice: rp.lastBidPrice,
                    minimumBidIncrement: rp.minimumBidIncrement,
                    startingBidTime: rp.startingBidTime,
                    endBidTime: rp.endBidTime,
                    productDetails: rp.productDetails
                })),
            };

            const success = await CreateAuctionRoom(payload);
            if (success) {
                refreshRooms();
                setMessage({
                    type: "success",
                    text: editingRoom ? "Auction room updated successfully" : "Auction room created successfully",
                });
                closeModal();
            } else {
                setMessage({ type: "error", text: "Failed to save auction room. Please try again." });
            }
        } catch (err) {
            console.error("Auction room CRUD error", err);
            setMessage({ type: "error", text: "Failed to process auction room request." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (roomId: number) => {
        if (!window.confirm("Are you sure you want to delete this auction room?")) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${__API_URL__}/api/AuctionRooms/delete/${roomId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Delete failed");

            refreshRooms();
            setMessage({ type: "success", text: "Auction room deleted successfully" });
        } catch (err) {
            console.error("Auction room delete error", err);
            setMessage({ type: "error", text: "Failed to delete auction room." });
        } finally {
            setIsLoading(false);
        }
    };

    const pickableProducts = useMemo(() => {
        const taken = new Set(
            roomForm.roomProducts?.map((rp) => rp.productId).filter((productId): productId is number => productId !== undefined)
        );
        return manageProducts.products?.filter((p) => p.id !== undefined && !taken.has(p?.id)) ?? [];
    }, [manageProducts.products, roomForm.roomProducts]);

    const productTitle = (productId: number) =>
        manageProducts.products?.find((p) => p.id === productId)?.title ?? `Product #${productId}`;

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
        setRoomForm((prev) => ({ ...prev, roomProducts: [...(prev.roomProducts ?? []), item] }));
    };

    const updateRoomProduct = (
        productId: number,
        patch: Partial<RoomProductDTO>
    ) => {
        setRoomForm((prev) => ({
            ...prev,
            roomProducts: (prev.roomProducts ?? []).map((rp) =>
                rp.productId === productId
                    ? { ...rp, ...patch }
                    : rp
            ),
        }));
    };

    const removeRoomProduct = (productId: number) => {
        setRoomForm((prev) => ({
            ...prev,
            roomProducts: (prev.roomProducts ?? []).filter((rp) => rp.productId !== productId),
        }));
    };

    const validateRoomProducts = (): string | null => {
        for (const rp of roomForm.roomProducts ?? []) {
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

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Auction Rooms</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your auction rooms and products.</p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:mt-0"
                >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    New Auction Room
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
                        placeholder="Search by title or group name"
                        className={`${inputClass} max-w-xs`}
                    />
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{filteredRooms.length} items</span>
                    </div>
                </div>

                {filteredRooms.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <p className="text-sm font-medium text-gray-900">
                            {search ? "No matching auction rooms" : "No auction rooms yet"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {search ? "Try a different search term." : "Create your first auction room to get started."}
                        </p>
                        {!search && (
                            <button
                                type="button"
                                onClick={openCreate}
                                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                            >
                                New Auction Room
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Room</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Visibility</th>
                                    <th className="px-4 py-3">Products</th>
                                    <th className="px-4 py-3">Members</th>
                                    <th className="px-4 py-3">Created</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRooms.map((room) => (
                                    <tr key={room.id} className="transition-colors hover:bg-gray-50">
                                        <td className="max-w-xs px-4 py-3">
                                            <div className="font-medium text-gray-900">{room.title}</div>
                                            <div className="truncate text-gray-500 text-xs">{room.groupName}</div>
                                            {room.description && (
                                                <div className="truncate text-gray-400 text-xs mt-1">{room.description}</div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                    statusBadge[room.status] || "bg-gray-50 text-gray-700 ring-gray-600/20"
                                                }}`}
                                            >
                                                {RoomStatusEnum[room.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                    room.visibility === RoomVisibilityEnum.public
                                                        ? "bg-sky-50 text-sky-700 ring-sky-600/20"
                                                        : "bg-gray-50 text-gray-700 ring-gray-600/20"
                                                }}`}
                                            >
                                                {visibilityLabels[room.visibility]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{room.roomProducts?.length ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-600">{room.memberCount ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(room)}
                                                    className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(room.id!)}
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

            <AuctionRoomFormModal
                open={isModalOpen}
                isEdit={!!editingRoom}
                roomForm={roomForm}
                setRoomForm={setRoomForm}
                categoriesOptions={categoriesOptions}
                manageProducts={manageProducts}
                pickableProducts={pickableProducts}
                isLoading={isLoading}
                onClose={closeModal}
                onSubmit={handleSubmit}
                addRoomProduct={addRoomProduct}
                updateRoomProduct={updateRoomProduct}
                removeRoomProduct={removeRoomProduct}
                validateRoomProducts={validateRoomProducts}
                productTitle={productTitle}
                toInput={toInput}
                fromInput={fromInput}
            />
        </div>
    );
};

interface AuctionRoomFormModalProps {
    open: boolean;
    isEdit: boolean;
    roomForm: AuctionRoomDTO;
    setRoomForm: React.Dispatch<React.SetStateAction<AuctionRoomDTO>>;
    categoriesOptions: CategoryDTO[];
    manageProducts: ProductListDTO;
    pickableProducts: ProductDTO[];
    isLoading: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    addRoomProduct: (p: ProductDTO) => void;
    updateRoomProduct: (productId: number, patch: Partial<RoomProductDTO>) => void;
    removeRoomProduct: (productId: number) => void;
    validateRoomProducts: () => string | null;
    productTitle: (productId: number) => string;
    toInput: (iso: string) => string;
    fromInput: (value: string) => string;
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

const AuctionRoomFormModal: React.FC<AuctionRoomFormModalProps> = ({
    open,
    isEdit,
    roomForm,
    setRoomForm,
    categoriesOptions,
    manageProducts,
    pickableProducts,
    isLoading,
    onClose,
    onSubmit,
    addRoomProduct,
    updateRoomProduct,
    removeRoomProduct,
    validateRoomProducts,
    productTitle,
    toInput,
    fromInput,
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setRoomForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRoomForm((prev) => ({ ...prev, visibility: Number(e.target.value) as RoomVisibilityEnum }));
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRoomForm((prev) => ({ ...prev, status: Number(e.target.value) as RoomStatusEnum }));
    };

    const handleSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validateRoomProducts();
        if (validationError) {
            setError(validationError);
            return;
        }
        await onSubmit(e);
    };

    const visibilityValues = Object.values(RoomVisibilityEnum).filter(
        (v): v is RoomVisibilityEnum => typeof v === "number"
    );

    const statusValues = Object.values(RoomStatusEnum).filter(
        (v): v is RoomStatusEnum => typeof v === "number"
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="room-modal-title"
                className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 id="room-modal-title" className="text-lg font-semibold text-gray-900">
                        {isEdit ? "Edit Auction Room" : "Create Auction Room"}
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

                <form onSubmit={handleSubmitWrapper} className="flex min-h-0 flex-1 flex-col">
                    <div className="space-y-4 overflow-y-auto px-6 py-5">
                        <Field label="Group Name (URL slug)" htmlFor="groupName" required>
                            <input
                                type="text"
                                id="groupName"
                                name="groupName"
                                value={roomForm.groupName}
                                onChange={handleInputChange}
                                placeholder="e.g. luxury-watches-2024"
                                className={inputClass}
                                required
                            />
                        </Field>

                        <Field label="Title" htmlFor="title" required>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={roomForm.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Vintage Rolex Collection"
                                className={inputClass}
                                required
                            />
                        </Field>

                        <Field label="Description" htmlFor="description">
                            <textarea
                                id="description"
                                name="description"
                                value={roomForm.description ?? ""}
                                onChange={handleInputChange}
                                placeholder="Describe the auction room..."
                                rows={3}
                                className={`${inputClass} resize-none`}
                            >
                            </textarea>
                        </Field>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Status" htmlFor="status" required>
                                <select
                                    id="status"
                                    name="status"
                                    value={roomForm.status}
                                    onChange={handleStatusChange}
                                    className={inputClass}
                                >
                                    {statusValues.map((value) => (
                                        <option key={value} value={value}>
                                            {RoomStatusEnum[value]}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Visibility" htmlFor="visibility" required>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    value={roomForm.visibility}
                                    onChange={handleVisibilityChange}
                                    className={inputClass}
                                >
                                    {visibilityValues.map((value) => (
                                        <option key={value} value={value}>
                                            {value === RoomVisibilityEnum.private ? "Private" : "Public"}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Room products */}
                        <Field label="Room Products" htmlFor="roomProducts">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Room Products{" "}
                                        <span className="text-gray-400 font-normal">({roomForm.roomProducts?.length})</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsPickerOpen(true)}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        + Add product
                                    </button>
                                </div>

                                {roomForm.roomProducts?.length === 0 ? (
                                    <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-4 text-center">
                                        No products added yet.
                                    </p>
                                ) : (
                                    <ul className="space-y-3">
                                        {roomForm.roomProducts?.map((rp) => (
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
                        </Field>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? "Saving…" : isEdit ? "Save changes" : "Create Room"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Product picker dialog */}
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
                                {manageProducts.products?.length === 0 ? "No available products." : "All available products are already added."}
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
                                onClick={() => window.open("/products/create", "_blank", "noopener,noreferrer")}
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

export default AuctionRoomTab;