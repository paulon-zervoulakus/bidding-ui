import { useFlashOnChange } from "../../hooks/useFlashOnChange";

export const FlashWrap: React.FC<{ value: string, fontSize?: string, fontColor?: string, fontWeight?: string }> =
({ value, fontSize="text-lg", fontColor="text-indigo-600", fontWeight = "font-bold" }) => {
	const flash = useFlashOnChange(value);
	return (
		<span
			className={`${fontSize} ${fontWeight} whitespace-nowrap transition-colors duration-500 ${
				flash ? "text-amber-500" : fontColor
			}`}
		>
			{value}
		</span>
	);
};