import Link from 'next/link';
import { CITY_AREAS, CITY_REST_PATH, MAP_VIEWBOX } from '../lib/cityMap';
import { AREA_GUIDES, areaHasGuide } from '../lib/neighborhoods';
import styles from './CityMap.module.css';

interface Props {
  /** Area to light up. Everything else stays muted. */
  active?: string;
  /**
   * 'index' links every area that has a guide.
   * 'hero' is the static article version: one area lit, nothing clickable.
   */
  mode?: 'index' | 'hero';
}

// One map of Amsterdam, used in two places: the by-area index and the hero of
// each neighbourhood guide. Boundaries come from the city's open geodata and are
// baked into src/lib/cityMap.ts at build time, so this renders as plain inline
// SVG with no external requests and no map library.
export function CityMap({ active, mode = 'index' }: Props) {
  const isHero = mode === 'hero';

  return (
    <div className={`${styles.wrap}${isHero ? ` ${styles.hero}` : ''}`}>
      <svg
        viewBox={MAP_VIEWBOX}
        className={styles.svg}
        role="img"
        aria-label={active ? `Map of Amsterdam with ${active} highlighted` : 'Map of Amsterdam by neighbourhood'}
      >
        {/* The rest of the city, so the shape reads as Amsterdam rather than a cluster of blobs. */}
        <path d={CITY_REST_PATH} className={styles.rest} />

        {CITY_AREAS.map((a) => {
          const isActive = a.name === active;
          const cls = `${styles.area}${isActive ? ` ${styles.active}` : ''}${
            !isHero && areaHasGuide(a.name) ? ` ${styles.linked}` : ''
          }`;

          const shape = <path d={a.d} className={cls} />;

          if (isHero || !areaHasGuide(a.name)) {
            return <g key={a.slug}>{shape}</g>;
          }
          return (
            <Link key={a.slug} href={`/blog/${AREA_GUIDES[a.name]}`} className={styles.hit} aria-label={`${a.name} guide`}>
              <title>{a.name}</title>
              {shape}
            </Link>
          );
        })}

        {/* Labels last so they sit above every shape. */}
        {CITY_AREAS.map((a) => {
          const isActive = a.name === active;
          if (isHero && !isActive) return null;
          return (
            <text
              key={a.slug}
              x={a.cx}
              y={a.cy}
              className={`${styles.label}${isActive ? ` ${styles.labelActive}` : ''}${
                !isHero && !areaHasGuide(a.name) ? ` ${styles.labelMuted}` : ''
              }`}
            >
              {a.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
