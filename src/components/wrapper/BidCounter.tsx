import { useEffect, useState } from "react";
import { parseUtc, formatRemaining } from "../../helper/isoString";



// Ticks every second and stops by itself once `stopAt` has passed
function useNow(stopAt: number) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!Number.isFinite(stopAt)) return;
		if (Date.now() >= stopAt) {
			setNow(Date.now());
			return;
		}
		const id = setInterval(() => {
			const t = Date.now();
			setNow(t);
			if (t >= stopAt) clearInterval(id);
		}, 1000);
		return () => clearInterval(id);
	}, [stopAt]);

	return now;
}

export const BidCountdown: React.FC<{ start: string; end: string }> = ({ start, end }) => {
	const startMs = parseUtc(start).getTime();
	const endMs = parseUtc(end).getTime();
	const now = useNow(endMs);

	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;

	if (now < startMs) {
		return (
			<p className="mt-1 text-sm font-semibold text-indigo-600">
				Starts in <span className="font-mono tabular-nums">{formatRemaining(startMs - now)}</span>
			</p>
		);
	}

	if (now < endMs) {
		const remaining = endMs - now;
		const urgent = remaining < 60 * 1000;
		return (
			<p className={`mt-1 text-sm font-semibold ${urgent ? "text-red-600" : "text-green-700"}`}>
				Ends in <span className="font-mono tabular-nums">{formatRemaining(remaining)}</span>
			</p>
		);
	}

	return <p className="mt-1 text-sm text-gray-500">Bidding ended</p>;
};