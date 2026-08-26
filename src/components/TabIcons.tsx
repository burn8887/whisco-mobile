import React from "react";
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from "react-native-svg";

// Custom Whisco tab icons — designed to spec:
//  Home    → paw print silhouette
//  Live TV → clapperboard whose hinged top stick is a bone
//  OnDemand→ play button in a rounded screen (matches the set's line style)
//  My List → dog collar tag with an engraved star
//
// Style: 1.8pt rounded strokes, minimal geometry, premium/clean. Active
// state renders in the brand sunset gradient (orange → pink); idle state
// in dim zinc. All icons share one 24×24 grid so they sit optically even.

const GRAD_ID = "whiscoSunset";

function Gradient() {
  return (
    <Defs>
      <LinearGradient id={GRAD_ID} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#f97316" />
        <Stop offset="1" stopColor="#db2777" />
      </LinearGradient>
    </Defs>
  );
}

type IconProps = { focused: boolean; size?: number };
const IDLE = "#71717a";

export function PawIcon({ focused, size = 24 }: IconProps) {
  const fill = focused ? `url(#${GRAD_ID})` : IDLE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Gradient />
      {/* four toes */}
      <Circle cx="7.2" cy="9.4" r="2.1" fill={fill} />
      <Circle cx="16.8" cy="9.4" r="2.1" fill={fill} />
      <Circle cx="9.7" cy="5.8" r="2.1" fill={fill} />
      <Circle cx="14.3" cy="5.8" r="2.1" fill={fill} />
      {/* main pad */}
      <Path
        d="M12 11.2c2.6 0 4.9 1.9 5.4 4.4.3 1.5-.7 3-2.3 3.2-1 .1-2-.3-3.1-.3s-2.1.4-3.1.3c-1.6-.2-2.6-1.7-2.3-3.2.5-2.5 2.8-4.4 5.4-4.4z"
        fill={fill}
      />
    </Svg>
  );
}

export function BoneClapperIcon({ focused, size = 24 }: IconProps) {
  const stroke = focused ? `url(#${GRAD_ID})` : IDLE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Gradient />
      {/* board body */}
      <Rect x="3" y="10.5" width="18" height="9.5" rx="2" stroke={stroke} strokeWidth="1.8" fill="none" />
      {/* board slate lines */}
      <Path d="M3.6 13.4h16.8" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      {/* hinged bone stick (angled open) */}
      <Path
        d="M5.6 8.9 18 4.6"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* bone knobs at both ends */}
      <Circle cx="4.6" cy="8.1" r="1.5" fill={stroke} />
      <Circle cx="5.4" cy="10.3" r="1.5" fill={stroke} />
      <Circle cx="18.6" cy="3.4" r="1.5" fill={stroke} />
      <Circle cx="19.4" cy="5.6" r="1.5" fill={stroke} />
    </Svg>
  );
}

export function PlayScreenIcon({ focused, size = 24 }: IconProps) {
  const stroke = focused ? `url(#${GRAD_ID})` : IDLE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Gradient />
      <Rect x="3" y="4.5" width="18" height="15" rx="3.2" stroke={stroke} strokeWidth="1.8" fill="none" />
      <Path d="M10.2 9.2v5.6c0 .5.55.8 1 .55l4.6-2.8a.62.62 0 0 0 0-1.1l-4.6-2.8c-.45-.25-1 .05-1 .55z" fill={stroke} />
    </Svg>
  );
}

export function CollarTagIcon({ focused, size = 24 }: IconProps) {
  const stroke = focused ? `url(#${GRAD_ID})` : IDLE;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Gradient />
      {/* collar loop */}
      <Path d="M9.4 4.8a3.4 3.4 0 0 1 5.2 0" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* small ring */}
      <Circle cx="12" cy="6.6" r="1.3" stroke={stroke} strokeWidth="1.5" fill="none" />
      {/* tag disc */}
      <Circle cx="12" cy="14.4" r="6.2" stroke={stroke} strokeWidth="1.8" fill="none" />
      {/* engraved star */}
      <Path
        d="M12 10.9l1.06 2.15 2.37.34-1.72 1.68.41 2.36L12 16.3l-2.12 1.13.41-2.36-1.72-1.68 2.37-.34L12 10.9z"
        fill={stroke}
      />
    </Svg>
  );
}
