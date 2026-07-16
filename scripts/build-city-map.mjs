// Build the Amsterdam neighbourhood map from open geodata.
//   node scripts/build-city-map.mjs [--refetch]
//
// Sources (all fetched once and cached in scripts/.cache-*.json):
//  - maps.amsterdam.nl INDELING_WIJK          110 wijken incl. water  (water underlay)
//  - maps.amsterdam.nl INDELING_WIJK_EXWATER  the same wijken with water carved out
//                                             (land shapes: the IJ, Amstel and lakes
//                                             appear as real gaps)
//  - PDOK / CBS wijkenbuurten                 Amstelveen and Diemen municipalities and
//                                             the Duivendrecht wijk, which are outside
//                                             gemeente Amsterdam and so not in the
//                                             city's own dataset
//  - OpenStreetMap via Overpass               A10 ring road and Amstel river centerlines
//
// Scope: the areas ALH serves (the client's red circle). Rural Noord (Waterland),
// Weesp and Driemond are cut. The port (Westpoort/Sloterdijk) stays as unnamed
// context so the city silhouette remains whole.
//
// Colours come from the client's 30-swatch signature palette (the accent-colour
// mockup round). Every area gets its own hue; tints are precomputed here so the
// runtime needs no colour math.
//
// Output: src/lib/cityMap.ts. Static SVG paths, nothing fetched at runtime.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'src', 'lib', 'cityMap.ts');
const CACHE_DIR = path.join(process.cwd(), 'scripts');
const REFETCH = process.argv.includes('--refetch');

const PAPER = '#f5f0e6';

// ---------- curated areas ----------
// One consistent level, nothing nested. Amsterdam areas resolve to official wijk
// codes (or a whole gebied/stadsdeel); Amstelveen, Diemen and Duivendrecht come
// from PDOK. Colours are assigned so neighbouring areas never share a hue.
const AREAS = [
  { name: 'Centrum',                color: '#1f5a66' /* Ocean    */, codes: ['AA', 'AD', 'AE', 'AF', 'AH', 'AJ', 'AK'] },
  { name: 'Grachtengordel',         color: '#aa7a2c' /* Amber    */, codes: ['AC', 'AG'] },
  { name: 'Jordaan',                color: '#a85433' /* Rust     */, codes: ['AB'] },
  { name: 'Westerpark',             color: '#2f6f5f' /* Teal     */, codes: ['EA', 'EB', 'EC', 'EG', 'EH', 'EJ'] },
  { name: 'Bos en Lommer',          color: '#a5673a' /* Copper   */, codes: ['ED', 'EE', 'EF'] },
  { name: 'Oud-West',               color: '#77405b' /* Plum     */, codes: ['EQ', 'ES', 'ET', 'EU', 'EV'] },
  { name: 'De Baarsjes',            color: '#5f6e53' /* Sage     */, codes: ['EK', 'EL', 'EM', 'EN', 'EP', 'ER'] },
  { name: 'Oud-Zuid',               color: '#3e5a80' /* Denim    */, codes: ['KA', 'KB', 'KC', 'KD', 'KH', 'KJ'] },
  { name: 'De Pijp',                color: '#9e4a39' /* Brick    */, codes: ['KE', 'KF', 'KG'] },
  { name: 'Rivierenbuurt',          color: '#567045' /* Fern     */, codes: ['KK', 'KL', 'KM'] },
  { name: 'Zuidas',                 color: '#7d6636' /* Bronze   */, codes: ['KN', 'KP', 'KQ', 'KR'] },
  { name: 'Noord',                  color: '#4d5d78' /* Slate    */, stadsdeel: 'Noord', excludeWijk: ['Waterland'] },
  { name: 'Oud-Oost',               color: '#9d5a2f' /* Sienna   */, codes: ['MB', 'MC', 'MD', 'ME'] },
  { name: 'Indische Buurt',         color: '#573a58' /* Damson   */, codes: ['MA', 'MF', 'MG'] },
  { name: 'Watergraafsmeer',        color: '#55603a' /* Moss     */, codes: ['MM', 'MN', 'MP', 'MQ'] },
  { name: 'IJburg',                 color: '#17635e' /* Petrol   */, codes: ['MH', 'MJ', 'MK', 'ML'] },
  { name: 'Geuzenveld & Slotermeer', color: '#7c5568' /* Mauve   */, gebied: ['Geuzenveld, Slotermeer'] },
  { name: 'Osdorp',                 color: '#3a5170' /* Steel    */, gebied: ['Osdorp'] },
  { name: 'Slotervaart',            color: '#8f4636' /* Redwood  */, gebied: ['Slotervaart'] },
  { name: 'De Aker & Sloten',       color: '#6d6a37' /* Olive    */, gebied: ['De Aker, Sloten, Nieuw-Sloten'] },
  { name: 'Bijlmer',                color: '#6d3d57' /* Aubergine*/, gebied: ['Bijlmer-Centrum', 'Bijlmer-Oost', 'Bijlmer-West'] },
  { name: 'Gaasperdam',             color: '#2f5d54' /* Spruce   */, gebied: ['Gaasperdam'] },
  { name: 'Amstelveen',             color: '#86383e' /* Burgundy */, pdok: { type: 'gemeente', name: 'Amstelveen' } },
  { name: 'Diemen',                 color: '#464778' /* Indigo   */, pdok: { type: 'gemeente', name: 'Diemen' } },
  { name: 'Duivendrecht',           color: '#6f2f3a' /* Wine     */, pdok: { type: 'buurt', gemeente: 'Ouder-Amstel', buurten: ['Duivendrecht', 'Industriegebied Amstel'] } },
];

const WATER_COLOR_BASE = '#1f5a66';
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- fetch with cache ----------
async function cached(key, fetcher) {
  const file = path.join(CACHE_DIR, `.cache-${key}.json`);
  if (fs.existsSync(file) && !REFETCH) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const data = await fetcher();
  fs.writeFileSync(file, JSON.stringify(data));
  return data;
}
async function getJson(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

const AMS = 'https://maps.amsterdam.nl/open_geodata/geojson_lnglat.php?THEMA=gebiedsindeling&KAARTLAAG=';
// PDOK ignores CQL_FILTER on this service (it silently returns the whole
// country, capped at 1000 features), so fetch by BBOX and filter client-side.
// WFS 2.0 with EPSG:4326 wants the bbox in lat,lon order.
const PDOK = 'https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0?request=GetFeature&service=WFS&version=2.0.0&outputFormat=application/json&srsName=EPSG:4326';

const [inclGeo, exclGeo, pdokGem, pdokBuurt, osm] = await Promise.all([
  cached('wijk', () => getJson(AMS + 'INDELING_WIJK')),
  cached('wijk-exwater', () => getJson(AMS + 'INDELING_WIJK_EXWATER')),
  cached('pdok-gemeenten-bbox', () =>
    getJson(`${PDOK}&typeName=wijkenbuurten:gemeenten&BBOX=52.20,4.75,52.40,5.05,EPSG:4326`)),
  cached('pdok-buurten-bbox', () =>
    getJson(`${PDOK}&typeName=wijkenbuurten:buurten&BBOX=52.31,4.90,52.35,4.95,EPSG:4326`)),
  cached('osm-lines', async () => {
    const q = `[out:json][timeout:90];(way["highway"="motorway"]["ref"~"^A ?10$"](52.29,4.79,52.44,5.03);way["waterway"="river"]["name"="Amstel"](52.24,4.83,52.38,4.96););out geom;`;
    // Overpass 406s on Node's default fetch headers; identify ourselves.
    return getJson('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'alh-blog-map-build/1.0' },
      body: 'data=' + encodeURIComponent(q),
    });
  }),
]);

// ---------- ring helpers ----------
const k = (p) => `${p[0]},${p[1]}`;
const ringsOf = (geom) => (geom.type === 'Polygon' ? geom.coordinates : geom.coordinates.flat());

// Union by cancelling directed edges shared between neighbouring polygons. Works
// because each single source is topologically clean; rings from other sources
// simply pass through untouched.
function unionRings(rings) {
  const edges = new Map();
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i], b = ring[i + 1];
      const ka = k(a), kb = k(b);
      if (ka === kb) continue;
      const back = `${kb}|${ka}`;
      if (edges.has(back)) edges.delete(back);
      else edges.set(`${ka}|${kb}`, [a, b]);
    }
  }
  const next = new Map();
  for (const [, [a, b]] of edges) {
    const ka = k(a);
    if (!next.has(ka)) next.set(ka, []);
    next.get(ka).push(b);
  }
  const out = [];
  const used = new Set();
  for (const [, [start]] of edges) {
    const ks = k(start);
    if (used.has(ks)) continue;
    const ring = [start];
    let cur = start;
    for (let guard = 0; guard < 200000; guard++) {
      const cands = next.get(k(cur));
      if (!cands || !cands.length) break;
      const nxt = cands.shift();
      ring.push(nxt);
      used.add(k(cur));
      cur = nxt;
      if (k(cur) === ks) break;
    }
    if (ring.length > 3) out.push(ring);
  }
  return out;
}

// ---------- resolve areas to rings ----------
const inclByCode = new Map(inclGeo.features.map((f) => [f.properties.Wijkcode, f]));
const exclByCode = new Map(exclGeo.features.map((f) => [f.properties.Wijkcode, f]));
const missingExcl = [...inclByCode.keys()].filter((c) => !exclByCode.has(c));
if (missingExcl.length) throw new Error('exwater layer is missing wijken: ' + missingExcl.join(', '));

function codesFor(a) {
  if (a.codes) return a.codes;
  const feats = inclGeo.features.filter((f) => {
    const p = f.properties;
    if (a.gebied) return a.gebied.includes(p.Gebied);
    if (a.stadsdeel) return p.Stadsdeel === a.stadsdeel && !(a.excludeWijk || []).includes(p.Wijk);
    return false;
  });
  if (!feats.length) throw new Error('no wijken matched for ' + a.name);
  return feats.map((f) => f.properties.Wijkcode);
}

function pdokRings(a) {
  if (a.pdok.type === 'gemeente') {
    const feats = pdokGem.features.filter((f) => f.properties.gemeentenaam === a.pdok.name);
    if (!feats.length) throw new Error('PDOK gemeente not found: ' + a.pdok.name);
    return feats.flatMap((f) => ringsOf(f.geometry));
  }
  // Duivendrecht is CBS "Wijk 00", so resolve at buurt level. The business park
  // between it and Amsterdam belongs to the same village edge; merged in so the
  // map has no unexplained notch along the A2.
  const feats = pdokBuurt.features.filter(
    (f) => f.properties.gemeentenaam === a.pdok.gemeente && a.pdok.buurten.includes(f.properties.buurtnaam),
  );
  if (feats.length !== a.pdok.buurten.length) {
    throw new Error(`PDOK buurten for ${a.name}: wanted ${a.pdok.buurten.length}, got ${feats.length}`);
  }
  return unionRings(feats.flatMap((f) => ringsOf(f.geometry)));
}

for (const a of AREAS) {
  if (a.pdok) {
    a.ringsLand = pdokRings(a); // CBS has no excl-water variant; same rings both layers
    a.ringsIncl = a.ringsLand;
  } else {
    a.resolvedCodes = codesFor(a);
    a.ringsLand = unionRings(a.resolvedCodes.flatMap((c) => ringsOf(exclByCode.get(c).geometry)));
    a.ringsIncl = a.resolvedCodes.flatMap((c) => ringsOf(inclByCode.get(c).geometry));
  }
}

// validate no wijk claimed twice
const claimed = AREAS.filter((a) => a.resolvedCodes).flatMap((a) => a.resolvedCodes);
const dupes = claimed.filter((c, i) => claimed.indexOf(c) !== i);
if (dupes.length) throw new Error('wijk claimed by two areas: ' + dupes.join(', '));

// Rest: whatever is left after cutting rural Noord, Weesp and Driemond. In
// practice the port (Westpoort + Sloterdijk), kept so the silhouette reads whole.
const restCodes = inclGeo.features
  .filter((f) => {
    const p = f.properties;
    return !claimed.includes(p.Wijkcode) && p.Stadsdeel !== 'Weesp' && p.Wijk !== 'Waterland' && p.Wijk !== 'Driemond';
  })
  .map((f) => f.properties.Wijkcode);
const restLand = unionRings(restCodes.flatMap((c) => ringsOf(exclByCode.get(c).geometry)));
const restIncl = restCodes.flatMap((c) => ringsOf(inclByCode.get(c).geometry));

// Water underlay: every included wijk WITH its water, as one shape. It sits
// under the carved land, so it only shows where water actually is: the IJ, the
// Amstel, the Sloterplas, the Nieuwe Meer, the IJmeer around IJburg.
const waterRings = unionRings([...AREAS.filter((a) => !a.pdok).flatMap((a) => a.ringsIncl), ...restIncl]);
const pdokWaterRings = AREAS.filter((a) => a.pdok).flatMap((a) => a.ringsIncl);

// ---------- projection (bounds from land only, height follows the data) ----------
const W = 1000, PAD = 10;
const allLand = [...AREAS.flatMap((a) => a.ringsLand), ...restLand].flat();
let minLon = 1e9, maxLon = -1e9, minLat = 1e9, maxLat = -1e9;
for (const p of allLand) {
  if (p[0] < minLon) minLon = p[0];
  if (p[0] > maxLon) maxLon = p[0];
  if (p[1] < minLat) minLat = p[1];
  if (p[1] > maxLat) maxLat = p[1];
}
const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
const s = (W - PAD * 2) / ((maxLon - minLon) * kx);
const H = Math.ceil((maxLat - minLat) * s + PAD * 2);
const proj = (p) => [Math.round(PAD + (p[0] - minLon) * kx * s), Math.round(PAD + (maxLat - p[1]) * s)];

// ---------- paths ----------
const ringArea = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
};

// Project, drop points the rounding made redundant, and drop rings smaller than
// minArea (in viewBox units^2). That filter is what keeps the canal network from
// becoming subpixel noise: only water you can see at this scale stays carved.
function toPath(rings, minArea = 60) {
  const out = [];
  for (const ring of rings) {
    const pts = [];
    for (const p of ring) {
      const q = proj(p);
      const last = pts[pts.length - 1];
      if (!last || last[0] !== q[0] || last[1] !== q[1]) pts.push(q);
    }
    while (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
    if (pts.length < 3 || ringArea(pts) < minArea) continue;
    out.push('M' + pts.map((p) => p.join(' ')).join('L') + 'Z');
  }
  return out.join('');
}

function centroid(rings) {
  const big = rings.slice().sort((a, b) => ringArea(a.map(proj)) - ringArea(b.map(proj))).pop();
  let x = 0, y = 0;
  big.forEach((p) => { const q = proj(p); x += q[0]; y += q[1]; });
  return [Math.round(x / big.length), Math.round(y / big.length)];
}

// OSM ways -> one stroked path per feature. Ways stay separate M segments; the
// two carriageways of the A10 overlap into a single line at this stroke width.
function linePath(ways) {
  const segs = [];
  for (const w of ways) {
    const pts = [];
    for (const g of w.geometry || []) {
      const q = proj([g.lon, g.lat]);
      const last = pts[pts.length - 1];
      if (!last || last[0] !== q[0] || last[1] !== q[1]) pts.push(q);
    }
    if (pts.length > 1) segs.push('M' + pts.map((p) => p.join(' ')).join('L'));
  }
  return segs.join('');
}
const osmWays = osm.elements.filter((e) => e.type === 'way');
const a10Path = linePath(osmWays.filter((w) => w.tags?.highway === 'motorway'));
const amstelPath = linePath(osmWays.filter((w) => w.tags?.waterway === 'river'));

// ---------- colours ----------
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (hex, t) => {
  const c = hexToRgb(hex), p = hexToRgb(PAPER);
  return '#' + c.map((v, i) => Math.round(v * t + p[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
};

const areas = AREAS.map((a) => ({
  name: a.name,
  slug: slugify(a.name),
  d: toPath(a.ringsLand),
  cx: centroid(a.ringsLand)[0],
  cy: centroid(a.ringsLand)[1],
  color: a.color,
  tintStrong: mix(a.color, 0.46),
  tintPale: mix(a.color, 0.2),
}));

const waterPath = toPath(waterRings, 40) + toPath(pdokWaterRings, 40);
const restPath = toPath(restLand);

// em dash guard: client hard rule applies to generated names too
const blob = JSON.stringify(areas);
if (/[—–]/.test(blob)) throw new Error('em/en dash found in generated map data');

const ts = `// GENERATED by scripts/build-city-map.mjs. Do not edit by hand.
//
// Amsterdam and neighbours from open geodata: maps.amsterdam.nl (wijken, incl.
// and excl. water), PDOK/CBS (Amstelveen, Diemen, Duivendrecht) and OSM (A10 and
// Amstel centerlines). Land shapes have the water carved out; WATER_PATH sits
// underneath and shows through exactly where water is. Colours come from the
// client's signature palette; tints are precomputed. Nothing fetched at runtime.

export interface CityArea {
  /** Display name, matches the by-area grid and AREA_GUIDES. */
  name: string;
  slug: string;
  /** SVG path in MAP_VIEWBOX space. */
  d: string;
  /** Label anchor. */
  cx: number;
  cy: number;
  /** Full palette colour, and its tints on the paper background. */
  color: string;
  tintStrong: string;
  tintPale: string;
}

export const MAP_VIEWBOX = '0 0 ${W} ${H}';

/** All water in scope: the IJ, Amstel, Sloterplas, Nieuwe Meer, IJmeer. */
export const WATER_PATH =
  '${waterPath}';

/** The port (Westpoort/Sloterdijk): unnamed context so the city reads whole. */
export const CITY_REST_PATH =
  '${restPath}';

/** A10 ring road centerline. */
export const LINE_A10 =
  '${a10Path}';

/** Amstel river centerline, Muntplein down past Ouderkerk. */
export const LINE_AMSTEL =
  '${amstelPath}';

export const CITY_AREAS: CityArea[] = ${JSON.stringify(
  areas.map(({ name, slug, d, cx, cy, color, tintStrong, tintPale }) => ({ name, slug, d, cx, cy, color, tintStrong, tintPale })),
  null,
  2,
)};
`;

fs.writeFileSync(OUT, ts);

console.log(`areas: ${areas.length} | viewBox 0 0 ${W} ${H}`);
areas.forEach((a) => {
  const src = AREAS.find((x) => x.name === a.name);
  const rings = src.ringsLand.length;
  console.log(`  ${a.name.padEnd(24)} ${a.color}  ${String(rings).padStart(2)} ring(s)  ${(a.d.length / 1024).toFixed(1)}kb`);
});
console.log(`water: ${(waterPath.length / 1024).toFixed(1)}kb | rest: ${(restPath.length / 1024).toFixed(1)}kb | A10: ${(a10Path.length / 1024).toFixed(1)}kb | Amstel: ${(amstelPath.length / 1024).toFixed(1)}kb`);
console.log(`wrote ${OUT} (${(ts.length / 1024).toFixed(1)}kb)`);
