import React from "react";
import LiveOnlyNotice from "../../src/components/LiveOnlyNotice";

/**
 * On Demand — EMPTY ON PURPOSE in build 8.
 *
 * Apple 5.2.2, second rejection (2026-09-28): evidence "from the rights holder"
 * for the films, or remove them. We hold no signed carriage letters for films,
 * so every on-demand title left this binary. The screen stays as a route so an
 * old link does not dead-end; it renders no poster, no title and no count.
 */
export default function OnDemandScreen() {
  return <LiveOnlyNotice subtitle="On Demand" />;
}
