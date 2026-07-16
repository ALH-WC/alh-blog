'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CANALS_PATH,
  CITY_AREAS,
  CITY_LABELS,
  LINE_A10,
  MAP_VIEWBOX,
  PARKS_PATH,
  STREETS_MAJOR_PATH,
  STREETS_MID_PATH,
  STREETS_MINOR_PATH,
} from '../lib/cityMap';
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

// Every area's cut-out label: a pill in the page's paper colour, holding a
// floating black pill with the name in paper. Baked at build time with
// collision-resolved positions; pointer-events none so the mouse always talks
// to the block beneath.
function Labels() {
  return (
    <g className={styles.labels}>
      {CITY_LABELS.map((L) =>
        L.pills.map((p) => (
          <g key={`${L.slug}-${p.t}`}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.h / 2} className={styles.pillCut} />
            <rect x={p.x + 2.5} y={p.y + 2.5} width={p.w - 5} height={p.h - 5} rx={(p.h - 5) / 2} className={styles.pillInk} />
            <text x={p.tx} y={p.ty} fontSize={L.size} letterSpacing={L.ls} className={styles.pillText}>
              {p.t}
            </text>
          </g>
        )),
      )}
    </g>
  );
}

// The interactive mosaic map on the by-area index: saturated blocks separated by
// paper-coloured streets and canals, parks in green, cut-out pill labels. Hover
// an area to pop up its guide, click to open it; areas without a guide say so.
//
// Everything is baked into src/lib/cityMap.ts at build time from open geodata:
// plain inline SVG, no external requests, no map library. The static article
// version lives in CityMapHero so article pages ship none of this JavaScript.
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
          const cls = `${styles.area}${linked ? ` ${styles.linked}` : ''}${hover === a.name ? ` ${styles.hovered}` : ''}`;
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

        {/* Parks over the blocks, then the seams that cut the mosaic. */}
        <path d={PARKS_PATH} className={styles.parks} fillRule="evenodd" />
        <path d={STREETS_MINOR_PATH} className={styles.sMinor} />
        <path d={STREETS_MID_PATH} className={styles.sMid} />
        <path d={STREETS_MAJOR_PATH} className={styles.sMajor} />
        <path d={CANALS_PATH} className={styles.canal} />
        <path d={LINE_A10} className={styles.a10} />

        <Labels />
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
