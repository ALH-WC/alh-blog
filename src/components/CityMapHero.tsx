import { CITY_AREAS, CITY_REST_PATH, MAP_VIEWBOX } from '../lib/cityMap';
import styles from './CityMap.module.css';

// The article hero: one area inked, the rest of Amsterdam muted, nothing
// interactive. Deliberately a server component and kept apart from the
// interactive CityMap, so the 116 article pages ship no map JavaScript. Only the
// six neighbourhood guides render it, and they render it as plain HTML.
export function CityMapHero({ active }: { active: string }) {
  return (
    <div className={`${styles.wrap} ${styles.hero}`}>
      <svg viewBox={MAP_VIEWBOX} className={styles.svg} role="img" aria-label={`Map of Amsterdam with ${active} highlighted`}>
        <path d={CITY_REST_PATH} className={styles.rest} />
        {CITY_AREAS.map((a) => (
          <path key={a.slug} d={a.d} className={`${styles.area}${a.name === active ? ` ${styles.active}` : ''}`} />
        ))}
        {CITY_AREAS.filter((a) => a.name === active).map((a) => (
          <text key={a.slug} x={a.cx} y={a.cy} className={`${styles.label} ${styles.labelActive}`}>
            {a.name}
          </text>
        ))}
      </svg>
    </div>
  );
}
