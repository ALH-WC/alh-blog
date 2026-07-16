import {
  CANALS_PATH,
  CITY_AREAS,
  CITY_LABELS,
  LINE_A10,
  MAP_VIEWBOX,
  PARKS_PATH,
  STREETS_MAJOR_PATH,
  STREETS_MID_PATH,
} from '../lib/cityMap';
import styles from './CityMap.module.css';

// The article hero: the neighbourhood in question keeps its full mosaic colour
// and its cut-out pill; every other block fades to a pale tint. Deliberately a
// server component kept apart from the interactive CityMap, so article pages
// ship no map JavaScript. The minor street grain is left out too: it is
// subpixel at hero size and would only pad the HTML.
export function CityMapHero({ active }: { active: string }) {
  const area = CITY_AREAS.find((x) => x.name === active);
  const label = area ? CITY_LABELS.find((l) => l.slug === area.slug) : undefined;
  return (
    <div className={`${styles.wrap} ${styles.hero}`}>
      <svg viewBox={MAP_VIEWBOX} className={styles.svg} role="img" aria-label={`Map of Amsterdam with ${active} highlighted`}>
        {CITY_AREAS.map((x) => (
          <path
            key={x.slug}
            d={x.d}
            className={styles.area}
            style={{ fill: x.name === active ? x.color : x.tintPale }}
            fillRule="evenodd"
          />
        ))}
        <path d={PARKS_PATH} className={`${styles.parks} ${styles.parksMuted}`} fillRule="evenodd" />
        <path d={STREETS_MID_PATH} className={styles.sMid} />
        <path d={STREETS_MAJOR_PATH} className={styles.sMajor} />
        <path d={CANALS_PATH} className={styles.canal} />
        <path d={LINE_A10} className={styles.a10} />
        {label ? (
          <g className={styles.labels}>
            {label.pills.map((p) => (
              <g key={p.t}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.h / 2} className={styles.pillCut} />
                <rect x={p.x + 2.5} y={p.y + 2.5} width={p.w - 5} height={p.h - 5} rx={(p.h - 5) / 2} className={styles.pillInk} />
                <text x={p.tx} y={p.ty} fontSize={label.size} letterSpacing={label.ls} className={styles.pillText}>
                  {p.t}
                </text>
              </g>
            ))}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
