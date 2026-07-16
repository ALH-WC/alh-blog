import { memo } from 'react';
import { CITY_LABELS, MAP_VIEWBOX } from '../lib/cityMap';
import styles from './CityMap.module.css';

// Every area's cut-out label: a pill in the page's paper colour, holding a
// floating black pill with the name in paper. Positions collision-resolved at
// build time; the layer never intercepts the mouse.
//
// Deliberately not a client component: the article hero renders it on the
// server, so guide pages ship no label JavaScript. Memoized so the index map's
// hover re-renders skip reconciling ninety static elements.
export const MapLabels = memo(function MapLabels({ only }: { only?: string }) {
  const labels = only ? CITY_LABELS.filter((l) => l.slug === only) : CITY_LABELS;
  return (
    <svg viewBox={MAP_VIEWBOX} className={styles.overlay} aria-hidden="true">
      {labels.map((L) =>
        L.pills.map((p) => (
          <g key={`${L.slug}-${p.t}`}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.h / 2} className={styles.pillCut} />
            <rect x={p.x + 2.5} y={p.y + 2.5} width={p.w - 5} height={p.h - 5} rx={(p.h - 5) / 2} className={styles.pillInk} />
            <text x={p.tx} y={p.ty} fontSize={L.size} letterSpacing={L.ls} className={styles.pillText}>
              {p.t}
            </text>
          </g>
        )),
      )}
    </svg>
  );
});
