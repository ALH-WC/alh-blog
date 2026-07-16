import { CITY_AREAS, MAP_SEAMS_SRC, MAP_VIEWBOX } from '../lib/cityMap';
import { MapLabels } from './MapLabels';
import styles from './CityMap.module.css';

// The article hero: the full quilt bitmap with every other area veiled in
// near-paper, so the neighbourhood in question keeps its colour and its pill
// while the rest of the city recedes. The article pages ship no map geometry
// beyond the 26 hit shapes reused as veils.
export function CityMapHero({ active }: { active: string }) {
  const area = CITY_AREAS.find((x) => x.name === active);
  return (
    <div className={`${styles.wrap} ${styles.hero}`}>
      <img src={MAP_SEAMS_SRC} alt="" aria-hidden="true" decoding="async" className={styles.quilt} />
      <svg viewBox={MAP_VIEWBOX} className={styles.overlay} role="img" aria-label={`Map of Amsterdam with ${active} highlighted`}>
        {CITY_AREAS.filter((x) => x.name !== active).map((x) => (
          <path key={x.slug} d={x.d} className={styles.heroVeil} fillRule="evenodd" />
        ))}
      </svg>
      {area ? <MapLabels only={area.slug} /> : null}
    </div>
  );
}
