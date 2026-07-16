// Which curated map area has a dedicated guide, and where it lives.
//
// Explicit on purpose. Matching an area name against article titles looks
// tempting but is what made the old by-area grid unreliable: a substring search
// for "Oost" returned a coworking article, and seven of the twelve areas
// returned nothing at all while looking clickable.
//
// An area missing from this map has no guide yet. It still renders on the map,
// just muted and not clickable, so the map shows what we cover rather than
// promising pages that do not exist.
import { CITY_AREAS } from './cityMap';

export const AREA_GUIDES: Record<string, string> = {
  Jordaan: 'exploring-de-jordaan-amsterdam-s-historic-neighborhood',
  Grachtengordel: 'exploring-amsterdam-s-historic-grachtengordel-district',
  'De Pijp': 'exploring-amsterdam-s-de-pijp-a-vibrant-neighborhood-guide',
  'Oud-West': 'exploring-oud-west-amsterdam-s-trendy-neighborhood',
  'Bos en Lommer': 'exploring-bos-en-lommer',
  Noord: 'exploring-amsterdam-noord-the-city-s-hidden-gem',
};

/** The area a given article is the guide for, if any. Used to pick the hero map. */
export const GUIDE_AREAS: Record<string, string> = Object.fromEntries(
  Object.entries(AREA_GUIDES).map(([area, slug]) => [slug, area]),
);

export const areaHasGuide = (name: string) => Boolean(AREA_GUIDES[name]);

/** Areas still waiting on a guide. Drives the "coming" count under the map. */
export const areasWithoutGuides = () => CITY_AREAS.filter((a) => !areaHasGuide(a.name)).map((a) => a.name);
