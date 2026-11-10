import { useFlashOnChange } from "../../hooks/useFlashOnChange";

export const FlashWrap: React.FC<{ value: string }> = ({ value }) => {
	const flash = useFlashOnChange(value);

	return (
		<span
			className={`text-lg font-bold whitespace-nowrap transition-colors duration-500 ${
				flash ? "text-amber-500" : "text-indigo-600"
			}`}
		>
			{value}
		</span>
	);
};