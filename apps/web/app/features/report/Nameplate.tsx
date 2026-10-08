// The report nameplates (site/brand/nameplates/, made by scripts/nameplates.ts from the pack's
// subject word). Each logotype is cached on its own; the two paths take the theme's ink and accent.
import { SITE } from "@aihot/site";

const NAMEPLATES = {
  daily: "Daily Brief",
  weekly: "Weekly Review",
  monthly: "Monthly Review",
  archive: "Daily Archive",
} as const;

export function Nameplate({ which, className = "" }: { which: keyof typeof NAMEPLATES; className?: string }) {
  const n = NAMEPLATES[which];
  return (
    <svg viewBox="0 0 680 100" className={`${className} max-w-full`} aria-hidden="true" focusable="false">
      <text x="0" y="76" fontFamily="Georgia, serif" fontSize="72" fontWeight="700" textLength="680" lengthAdjust="spacingAndGlyphs">
        <tspan className="fill-accent">{SITE.subject} </tspan><tspan className="fill-ink">{n}</tspan>
      </text>
    </svg>
  );
}
