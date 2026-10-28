import React from 'react';
import mapData from './data/map.json';
import {colors} from './theme';

const map = mapData as unknown as {metsHayk: string; metsHaykLabel: [number, number]; homeland: string; homelandBox: [number, number, number, number]};

// Gold Greater Armenia (Mets Hayk) with Armenia + Artsakh as one shape in the flag's colours.
// Drawn inside a map <svg> whose user units match src/data/map.json; `vw` is the current viewBox width.
export const MetsHaykLayer: React.FC<{
  vw: number;
  hayk: number; // 0..1 visibility of Mets Hayk
  home: number; // 0..1 fill of Armenia + Artsakh
  draw?: number; // 0..1 progress of the outline being drawn
  label: number; // 0..1 visibility of the "Մեծ Հայք" label
  font: string;
}> = ({vw, hayk, home, draw = 1, label, font}) => {
  const [x0, y0, , y1] = map.homelandBox;
  return (
    <g>
      <defs>
        <linearGradient id="mh-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8860b" />
          <stop offset="18%" stopColor="#f7e08a" />
          <stop offset="35%" stopColor="#d9a72a" />
          <stop offset="50%" stopColor="#fff4b8" />
          <stop offset="66%" stopColor="#e2b23c" />
          <stop offset="83%" stopColor="#f9e27c" />
          <stop offset="100%" stopColor="#c08a14" />
        </linearGradient>
        <linearGradient id="mh-flag" gradientUnits="userSpaceOnUse" x1={x0} y1={y0} x2={x0} y2={y1}>
          <stop offset={0} stopColor={colors.red} />
          <stop offset={0.3333} stopColor={colors.red} />
          <stop offset={0.3333} stopColor="#0033a0" />
          <stop offset={0.6667} stopColor="#0033a0" />
          <stop offset={0.6667} stopColor={colors.apricot} />
          <stop offset={1} stopColor={colors.apricot} />
        </linearGradient>
        <filter id="mh-depth" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx={0} dy={vw / 260} stdDeviation={vw / 300} floodColor="#000" floodOpacity={0.55} />
        </filter>
      </defs>
      <g opacity={hayk} filter="url(#mh-depth)">
        <path d={map.metsHayk} fill="url(#mh-gold)" stroke="#8a5a0a" strokeWidth={vw / 420} strokeLinejoin="round" />
        <path d={map.metsHayk} fill="none" stroke="#fff2a8" strokeOpacity={0.55} strokeWidth={vw / 1200} strokeLinejoin="round" />
      </g>
      <text
        x={map.metsHaykLabel[0]}
        y={map.metsHaykLabel[1]}
        textAnchor="middle"
        fontFamily={font}
        fontWeight={700}
        fontSize={vw / 24}
        fill="#5b3c06"
        opacity={hayk * label * 0.85}
      >
        Մեծ Հայք
      </text>
      <path
        d={map.homeland}
        fill="url(#mh-flag)"
        fillOpacity={home}
        stroke="#c9971f"
        strokeWidth={vw / 380}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      {/* Soft inner shading so the flag area sits into the gold like the reference */}
      <path d={map.homeland} fill="none" stroke="#000" strokeOpacity={0.25 * home} strokeWidth={vw / 700} transform={`translate(0 ${vw / 900})`} />
    </g>
  );
};
