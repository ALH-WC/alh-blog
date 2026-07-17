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

// The interactive quilt map on the by-area index.
//
// All the visuals live in one cached bitmap (the buurt quilt, parks, streets,
// canals). On top of it sit three light layers: an invisible SVG with the 26
// neighbourhood hit shapes, a veil SVG that darkens the hovered area, and the
// pill labels. Hovering repaints one polygon, never the quilt.
export function CityMap({ tips = {} }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const area = hover ? CITY_AREAS.find((a) => a.name === hover) : null;
  const tip = hover ? tips[hover] : undefined;
  const hasGuide = hover ? areaHasGuide(hover) : false;

  return (
    <div className={styles.wrap}>
      <img src={MAP_SEAMS_SRC} alt="" aria-hidden="true" decoding="async" className={styles.quilt} />

      <svg
        viewBox={MAP_VIEWBOX}
        className={styles.hits}
        role="img"
        aria-label="Map of Amsterdam and its neighbouring areas"
        onMouseLeave={() => setHover(null)}
      >
        {CITY_AREAS.map((a) => {
          const linked = areaHasGuide(a.name);
          const on = { onMouseEnter: () => setHover(a.name), onFocus: () => setHover(a.name) };

          if (!linked) {
            // Clickable like every other area: the click brings up the card
            // (which says the guide is coming), and doubles as the tap
            // behaviour on touch screens where hover does not exist.
            return (
              <path
                key={a.slug}
                d={a.d}
                className={styles.area}
                fillRule="evenodd"
                role="button"
                aria-label={`${a.name}, guide coming soon`}
                onClick={() => setHover(a.name)}
                {...on}
              />
            );
          }
          return (
            <Link key={a.slug} href={`/blog/${AREA_GUIDES[a.name]}`} aria-label={`${a.name} guide`} {...on}>
              <title>{a.name}</title>
              <path d={a.d} className={styles.area} fillRule="evenodd" />
            </Link>
          );
        })}
        {/* Hover: one translucent veil over the active area, above the bitmap
            because it is opaque. The veil uses the inset path (v), so the tint
            stops at the divider and paints over nothing: the map under the
            hover stays pixel-identical, just greyed. */}
        {area ? <path d={area.v} className={styles.veil} fillRule="evenodd" /> : null}
      </svg>

      <MapLabels />

      {area ? (
        <div
          className={styles.card}
          style={{
            left: `${(area.cx / VB_W) * 100}%`,
            top: `${(area.cy / VB_H) * 100}%`,
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
