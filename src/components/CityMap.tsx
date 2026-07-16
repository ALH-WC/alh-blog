'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CITY_AREAS, MAP_SEAMS_SRC, MAP_VIEWBOX } from '../lib/cityMap';
import { AREA_GUIDES, areaHasGuide } from '../lib/neighborhoods';
import { MapLabels } from './MapLabels';
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

// The interactive mosaic map on the by-area index.
//
// Three stacked layers, and the split is what keeps it fast: the interactive
// blocks are a small inline SVG; the street network, canals and parks are a
// static <img> the browser rasterizes once and composites as a cached bitmap;
// the pill labels are a light SVG on top. Hovering repaints 26 simple polygons,
// never the two hundred thousand street points.
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
        {CITY_AREAS.map((a) => {
          const linked = areaHasGuide(a.name);
          const cls = `${styles.area}${linked ? ` ${styles.linked}` : ''}`;
          const on = { onMouseEnter: () => setHover(a.name), onFocus: () => setHover(a.name) };

          if (!linked) {
            return <path key={a.slug} d={a.d} className={cls} style={{ fill: a.color }} fillRule="evenodd" {...on} />;
          }
          return (
            <Link key={a.slug} href={`/blog/${AREA_GUIDES[a.name]}`} aria-label={`${a.name} guide`} {...on}>
              <title>{a.name}</title>
              <path d={a.d} className={cls} style={{ fill: a.color }} fillRule="evenodd" />
            </Link>
          );
        })}
        {/* Hover: one translucent veil over the active block. */}
        {area ? <path d={area.d} className={styles.veil} fillRule="evenodd" /> : null}
      </svg>

      <img src={MAP_SEAMS_SRC} alt="" aria-hidden="true" className={styles.seams} />
      <MapLabels />

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
