'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CITY_AREAS, CITY_REST_PATH, MAP_VIEWBOX } from '../lib/cityMap';
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

// The interactive map on the by-area index: hover an area to pop up its guide,
// click to open it. Areas without a guide say so rather than going nowhere.
//
// Boundaries come from the city's open geodata, baked into src/lib/cityMap.ts at
// build time, so this is plain inline SVG: no external requests, no map library.
// The static article version lives in CityMapHero so the article pages ship none
// of this JavaScript.
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
        aria-label="Map of Amsterdam by neighbourhood"
        onMouseLeave={() => setHover(null)}
      >
        {/* The rest of the city, so the shape reads as Amsterdam rather than a cluster of blobs. */}
        <path d={CITY_REST_PATH} className={styles.rest} />

        {CITY_AREAS.map((a) => {
          const linked = areaHasGuide(a.name);
          const cls = `${styles.area}${linked ? ` ${styles.linked}` : ''}${
            hover === a.name ? ` ${styles.hovered}` : ''
          }`;
          // Muted areas react to hover too, so the card can say the guide is
          // coming rather than leaving a dead patch of map.
          const on = { onMouseEnter: () => setHover(a.name), onFocus: () => setHover(a.name) };

          if (!linked) return <path key={a.slug} d={a.d} className={cls} {...on} />;
          return (
            <Link key={a.slug} href={`/blog/${AREA_GUIDES[a.name]}`} aria-label={`${a.name} guide`} {...on}>
              <title>{a.name}</title>
              <path d={a.d} className={cls} />
            </Link>
          );
        })}

        {/* Labels last so they sit above every shape. The hovered one hands over to the card. */}
        {CITY_AREAS.filter((a) => a.name !== hover).map((a) => (
          <text
            key={a.slug}
            x={a.cx}
            y={a.cy}
            className={`${styles.label}${areaHasGuide(a.name) ? '' : ` ${styles.labelMuted}`}`}
          >
            {a.name}
          </text>
        ))}
      </svg>

      {area ? (
        <div
          className={styles.card}
          style={{ left: `${(area.cx / VB_W) * 100}%`, top: `${(area.cy / VB_H) * 100}%` }}
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
