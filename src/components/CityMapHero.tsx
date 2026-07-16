import { CITY_AREAS, MAP_SEAMS_SRC, MAP_VIEWBOX } from '../lib/cityMap';
import { MapLabels } from './MapLabels';
import styles from './CityMap.module.css';

// The article hero: the neighbourhood in question keeps its full mosaic colour
// and its pill; every other block fades to a pale tint. Same layering as the
// index map: light inline blocks under the cached seams raster, so the article
// pages ship no street geometry at all.
export function CityMapHero({ active }: { active: string }) {
  const area = CITY_AREAS.find((x) => x.name === active);
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
      </svg>
      <img src={MAP_SEAMS_SRC} alt="" aria-hidden="true" decoding="async" className={styles.seams} />
      {area ? <MapLabels only={area.slug} /> : null}
    </div>
  );
}
