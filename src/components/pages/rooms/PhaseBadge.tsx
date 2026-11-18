import { Phase, phaseStyle } from "../../../helper/auctionRoom";

export const PhaseBadge: React.FC<{ phase: Phase }> = ({ phase }) => (
  <span
    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${phaseStyle[phase].className}`}
  >
    {phaseStyle[phase].label}
  </span>
);