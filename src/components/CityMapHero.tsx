import { CITY_AREAS, CITY_REST_PATH, LINE_A10, LINE_AMSTEL, MAP_VIEWBOX, WATER_PATH } from '../lib/cityMap';
import styles from './CityMap.module.css';

// The article hero: the neighbourhood in question carries its full palette
// colour, everything else falls back to a pale tint, and the water and the A10
// keep the reader oriented. Deliberately a server component kept apart from the
// interactive CityMap, so the 116 article pages ship no map JavaScript.
export function CityMapHero({ active }: { active: string }) {
  const a = CITY_AREAS.find((x) => x.name === active);
  return (
    <div className={`${styles.wrap} ${styles.hero}`}>
      <svg viewBox={MAP_VIEWBOX} className={styles.svg} role="img" aria-label={`Map of Amsterdam with ${active} highlighted`}>
        <path d={WATER_PATH} className={styles.water} fillRule="evenodd" />
        <path d={CITY_REST_PATH} className={styles.rest} fillRule="evenodd" />
        {CITY_AREAS.map((x) => (
          <path
            key={x.slug}
            d={x.d}
            className={`${styles.area}${x.name === active ? ` ${styles.active}` : ''}`}
            style={{ fill: x.name === active ? x.color : x.tintPale }}
            fillRule="evenodd"
          />
        ))}
        <path d={LINE_A10} className={styles.a10} />
        <path d={LINE_AMSTEL} className={styles.amstel} />
        {a ? (
          <text x={a.cx} y={a.cy} className={`${styles.label} ${styles.labelActive}`}>
            {a.name}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
