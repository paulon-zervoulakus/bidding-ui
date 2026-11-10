import { useEffect, useRef, useState } from "react";

export function useFlashOnChange<T>(value: T, duration = 3000): boolean {
	const [flash, setFlash] = useState(false);
	const previous = useRef(value);

	useEffect(() => {
		if (previous.current === value) return; // skip first render and unrelated re-renders
		previous.current = value;

		setFlash(true);
		const timer = setTimeout(() => setFlash(false), duration);
		return () => clearTimeout(timer); // a newer change restarts the 3 seconds
	}, [value, duration]);

	return flash;
}