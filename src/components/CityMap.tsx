'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { CITY_AREAS, CITY_REST_PATH, LINE_A10, LINE_AMSTEL, MAP_VIEWBOX, PARKS_PATH, WATER_PATH, type CityArea } from '../lib/cityMap';
import { AREA_GUIDES, areaHasGuide } from '../lib/neighborhoods';
import styles from './CityMap.module.css';

/** What the hover card shows. Keyed by area name. */
export interface AreaTip {
  title: string;
  readMinutes?: number;
}

interface Props {
  /** Guide details for the hover card, by area name. */
  tips?: Record<string, AreaTip>;
}

const [VB_W, VB_H] = MAP_VIEWBOX.split(' ').slice(2).map(Number);

const areaVars = (a: CityArea) =>
  ({ '--c': a.color, '--ts': a.tintStrong, '--tp': a.tintPale }) as CSSProperties;

// Long names wrap onto two lines at the ampersand so they stay inside their shape.
function AreaLabel({ a, muted }: { a: CityArea; muted: boolean }) {
  const parts = a.name.split(' & ');
  const cls = `${styles.label}${muted ? ` ${styles.labelMuted}` : ''}`;
  if (parts.length === 1) {
    return (
      <text x={a.cx} y={a.cy} className={cls}>
        {a.name}
      </text>
    );
  }
  return (
    <text x={a.cx} y={a.cy - 7} className={cls}>
      <tspan x={a.cx}>{parts[0]}</tspan>
      <tspan x={a.cx} dy="15">{`& ${parts[1]}`}</tspan>
    </text>
  );
}

// The interactive map on the by-area index: hover an area to pop up its guide,
// click to open it. Areas without a guide say so rather than going nowhere.
//
// Everything is baked into src/lib/cityMap.ts at build time from open geodata:
// water-carved land shapes, the water underlay that shows through the gaps (the
// IJ, Amstel, Sloterplas), and the A10 and Amstel centerlines. Plain inline SVG,
// no external requests, no map library. The static article version lives in
// CityMapHero so the article pages ship none of this JavaScript.
export function CityMap({ tips = {} }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const area = hover ? CITY_AREAS.find((a) => a.name === hover) : null;
  const tip = hover ? tips[hover] : undefined;
  const hasGuide = hover ? areaHasGuide(hover) : false;

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={MAP_VIEWBOX}
        className={styles.svg}
        role="img"
        aria-label="Map of Amsterdam and its neighbouring areas"
        onMouseLeave={() => setHover(null)}
      >
        {/* Water first: it shows through wherever the land shapes leave a gap. */}
        <path d={WATER_PATH} className={styles.water} fillRule="evenodd" />
        {CITY_REST_PATH ? <path d={CITY_REST_PATH} className={styles.rest} fillRule="evenodd" /> : null}

        {CITY_AREAS.map((a) => {
          const linked = areaHasGuide(a.name);
          const cls = `${styles.area}${linked ? ` ${styles.linked}` : ''}${
            hover === a.name ? ` ${styles.hovered}` : ''
          }`;
          const on = { onMouseEnter: () => setHover(a.name), onFocus: () => setHover(a.name) };

          if (!linked) {
            return <path key={a.slug} d={a.d} className={cls} style={areaVars(a)} fillRule="evenodd" {...on} />;
          }
          return (
            <Link key={a.slug} href={`/blog/${AREA_GUIDES[a.name]}`} aria-label={`${a.name} guide`} {...on}>
              <title>{a.name}</title>
              <path d={a.d} className={cls} style={areaVars(a)} fillRule="evenodd" />
            </Link>
          );
        })}

        {/* Parks sit over the area fills but never intercept the mouse. */}
        <path d={PARKS_PATH} className={styles.parks} fillRule="evenodd" />
        {/* Orientation lines above the fills: the A10 ring and the Amstel. */}
        <path d={LINE_A10} className={styles.a10} />
        <path d={LINE_AMSTEL} className={styles.amstel} />

        {CITY_AREAS.filter((a) => a.name !== hover).map((a) => (
          <AreaLabel key={a.slug} a={a} muted={!areaHasGuide(a.name)} />
        ))}
      </svg>

      {area ? (
        <div
          className={styles.card}
          style={{
            left: `${(area.cx / VB_W) * 100}%`,
            top: `${(area.cy / VB_H) * 100}%`,
            ['--cardc' as string]: area.color,
          }}
          aria-hidden="true"
        >
          <span className={styles.cardName}>{area.name}</span>
          {hasGuide && tip ? (
            <>
              <span className={styles.cardTitle}>{tip.title}</span>
              <span className={styles.cardFoot}>
                {tip.readMinutes ? `${tip.readMinutes} min read` : 'Read the guide'}
                <span className={styles.cardArrow}>→</span>
              </span>
            </>
          ) : (
            <span className={styles.cardSoon}>Guide coming soon</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
