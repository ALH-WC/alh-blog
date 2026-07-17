// Build the Amsterdam mosaic map from open geodata.
//   node scripts/build-city-map.mjs [--refetch]
//
// The map is the client's chosen "mosaic" direction: saturated blocks separated
// by paper-coloured streets and canals, parks in green, the A10 as a heavy paper
// line, and every area named by a cut-out pill holding a floating black pill.
// The page's paper shows through the streets, the water gaps and the pill
// cut-outs, so the map reads as shapes cut from the page.
//
// Sources (fetched once, cached in scripts/.cache-*.json):
//  - maps.amsterdam.nl INDELING_WIJK            110 wijken incl. water (park test)
//  - maps.amsterdam.nl INDELING_WIJK_EXWATER    the same with water carved out
//  - PDOK / CBS wijkenbuurten                   Amstelveen, Diemen, Duivendrecht,
//                                               which lie outside gemeente Amsterdam
//  - OpenStreetMap via Overpass                 A10, streets, canals, major parks
//
// Scope: the areas ALH serves. Rural Noord (Waterland), Weesp, Driemond and the
// port are cut; the map ends where the neighbourhoods end.
//
// Output: src/lib/cityMap.ts. Static SVG paths and label geometry, nothing
// fetched at runtime.
import fs from 'node:fs';
import path from 'node:path';
import ClipperLib from 'clipper-lib';

const OUT = path.join(process.cwd(), 'src', 'lib', 'cityMap.ts');
const CACHE_DIR = path.join(process.cwd(), 'scripts');
const REFETCH = process.argv.includes('--refetch');

// ---------- curated areas ----------
// One consistent level, nothing nested. Amsterdam areas resolve to official wijk
// codes (or a whole gebied/stadsdeel); Amstelveen, Diemen and Duivendrecht come
// from PDOK.
const AREAS = [
  { name: 'Centrum',                 codes: ['AA', 'AD', 'AE', 'AF', 'AH', 'AJ', 'AK'] },
  { name: 'Grachtengordel',          codes: ['AC', 'AG'] },
  { name: 'Jordaan',                 codes: ['AB'] },
  { name: 'Westerpark',              codes: ['EG', 'EH', 'EJ'] },
  { name: 'Houthavens & Spaarndammerbuurt', codes: ['EB', 'EC'] },
  { name: 'Bos en Lommer',           codes: ['ED', 'EE', 'EF'] },
  { name: 'Oud-West',                codes: ['EQ', 'ES', 'ET', 'EU', 'EV'] },
  { name: 'De Baarsjes',             codes: ['EK', 'EL', 'EM', 'EN', 'EP', 'ER'] },
  { name: 'Oud-Zuid',                codes: ['KA', 'KB', 'KC', 'KD', 'KH', 'KJ'] },
  { name: 'De Pijp',                 codes: ['KE', 'KF', 'KG'] },
  { name: 'Rivierenbuurt',           codes: ['KK', 'KL', 'KM'] },
  { name: 'Zuidas',                  codes: ['KN', 'KP', 'KQ', 'KR'] },
  { name: 'Noord',                   stadsdeel: 'Noord', excludeWijk: ['Waterland'] },
  { name: 'Oud-Oost',                codes: ['MB', 'MC', 'MD', 'ME'] },
  { name: 'Indische Buurt',          codes: ['MA', 'MF', 'MG'] },
  { name: 'Watergraafsmeer',         codes: ['MM', 'MN', 'MP', 'MQ'] },
  { name: 'IJburg',                  codes: ['MH', 'MJ', 'MK', 'ML'] },
  { name: 'Geuzenveld & Slotermeer', gebied: ['Geuzenveld, Slotermeer'] },
  { name: 'Osdorp',                  gebied: ['Osdorp'] },
  { name: 'Slotervaart',             gebied: ['Slotervaart'] },
  { name: 'De Aker & Sloten',        gebied: ['De Aker, Sloten, Nieuw-Sloten'] },
  // Buurt-level so the AMC hospital and Hoge Dijk golf land, which dangled off
  // the block's south-west, stay out.
  { name: 'Bijlmer',                 buurtGebied: ['Bijlmer-Centrum', 'Bijlmer-Oost', 'Bijlmer-West'], excludeBuurt: ['AMC', 'Hoge Dijk'] },
  { name: 'Gaasperdam',              gebied: ['Gaasperdam'] },
  // Urban wijken only: the Buitengebied polders east and south were cut on
  // client request. The Amsterdamse Bos wijk stays so the park stays in scope.
  { name: 'Amstelveen',              pdok: { type: 'wijken', gemeente: 'Amstelveen', exclude: ['Buitengebied Noord', 'Buitengebied Zuid'] } },
  { name: 'Diemen',                  pdok: { type: 'gemeente', name: 'Diemen' } },
  { name: 'Duivendrecht',            pdok: { type: 'buurt', gemeente: 'Ouder-Amstel', buurten: ['Duivendrecht', 'Industriegebied Amstel'] } },
];

// Approved palette, after the client's London block-print reference: one hue
// per neighbourhood, all warm. The reference's teal was dropped on request
// ("replace the blue parts"), so nothing on the map is blue and green means
// parks alone. No two neighbouring areas share a hue (enforced below).
const AREA_HUES = ['#ef8f2e', '#c9642c', '#e05340', '#d9a441', '#8a5a33', '#c2a26a'];
const PARK_GREEN = '#4f7247';
// Cross-source neighbours: the PDOK shapes share no vertices with the Amsterdam
// layer, so vertex matching cannot see these borders.
const EXTRA_ADJACENT = [
  ['Amstelveen', 'Zuidas'], ['Amstelveen', 'De Aker & Sloten'], ['Amstelveen', 'Slotervaart'],
  ['Duivendrecht', 'Watergraafsmeer'], ['Duivendrecht', 'Rivierenbuurt'], ['Duivendrecht', 'Diemen'], ['Duivendrecht', 'Bijlmer'],
  ['Diemen', 'Watergraafsmeer'], ['Diemen', 'IJburg'], ['Diemen', 'Bijlmer'], ['Diemen', 'Gaasperdam'],
];
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
async function overpass(q) {
  // Overpass 406s on Node's default fetch headers; identify ourselves.
  return getJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'alh-blog-map-build/1.0' },
    body: 'data=' + encodeURIComponent(q),
  });
}

const AMS = 'https://maps.amsterdam.nl/open_geodata/geojson_lnglat.php?THEMA=gebiedsindeling&KAARTLAAG=';
// PDOK ignores CQL_FILTER on this service (it silently returns the whole country
// capped at 1000 features), so fetch by BBOX and filter client-side. WFS 2.0
// with EPSG:4326 wants the bbox in lat,lon order.
const PDOK = 'https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0?request=GetFeature&service=WFS&version=2.0.0&outputFormat=application/json&srsName=EPSG:4326';

const [inclGeo, exclGeo, buurtExcl, pdokGem, pdokBuurt, pdokWijk, pdokBuurtAV, pdokBuurtDM, osmLines, osmGreens, osmStreets] = await Promise.all([
  cached('wijk', () => getJson(AMS + 'INDELING_WIJK')),
  cached('wijk-exwater', () => getJson(AMS + 'INDELING_WIJK_EXWATER')),
  cached('buurt-exwater', () => getJson(AMS + 'INDELING_BUURT_EXWATER')),
  cached('pdok-gemeenten-bbox', () =>
    getJson(`${PDOK}&typeName=wijkenbuurten:gemeenten&BBOX=52.20,4.75,52.40,5.05,EPSG:4326`)),
  cached('pdok-buurten-bbox', () =>
    getJson(`${PDOK}&typeName=wijkenbuurten:buurten&BBOX=52.31,4.90,52.35,4.95,EPSG:4326`)),
  cached('pdok-wijken-bbox', () =>
    getJson(`${PDOK}&typeName=wijkenbuurten:wijken&BBOX=52.23,4.78,52.33,4.93,EPSG:4326`)),
  // Buurt-level detail for the quilt outside gemeente Amsterdam.
  cached('pdok-buurten-av', () =>
    getJson(`${PDOK}&typeName=wijkenbuurten:buurten&BBOX=52.25,4.79,52.33,4.90,EPSG:4326`)),
  cached('pdok-buurten-dm', () =>
    getJson(`${PDOK}&typeName=wijkenbuurten:buurten&BBOX=52.30,4.93,52.36,5.02,EPSG:4326`)),
  cached('osm-lines', () =>
    overpass(`[out:json][timeout:90];(way["highway"="motorway"]["ref"~"^A ?10$"](52.29,4.79,52.44,5.03);way["waterway"="river"]["name"="Amstel"](52.24,4.83,52.38,4.96););out geom;`)),
  // Everything park-like, by category rather than a hand-picked name list, so
  // the greenery is accurate everywhere: forests (Diemerbos), nature reserves
  // (De Oeverlanden), sport parks, cemeteries, plus the named parks. Only
  // green land is green; neighbourhoods never are.
  cached('osm-greens', () =>
    overpass(`[out:json][timeout:180];(nwr["leisure"~"^(park|nature_reserve|recreation_ground|sports_centre|golf_course)$"](52.25,4.74,52.44,5.04);nwr["landuse"~"^(forest|village_green|cemetery)$"](52.25,4.74,52.44,5.04);nwr["name"="Amsterdamse Bos"](52.25,4.70,52.36,4.90););out geom;`)),
  // The street and canal network that draws the mosaic's seams.
  cached('osm-streets', () =>
    overpass(`[out:json][timeout:240];(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street)$"](52.25,4.74,52.44,5.04);way["waterway"~"^(canal|river)$"](52.25,4.74,52.44,5.04););out geom;`)),
]);

// ---------- ring helpers ----------
const k = (p) => `${p[0]},${p[1]}`;
const ringsOf = (geom) => (geom.type === 'Polygon' ? geom.coordinates : geom.coordinates.flat());

// Union by cancelling directed edges shared between neighbouring polygons. Works
// because each single source is topologically clean.
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

// ---------- resolve areas ----------
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
  if (a.pdok.type === 'wijken') {
    const feats = pdokWijk.features.filter(
      (f) => f.properties.gemeentenaam === a.pdok.gemeente && !a.pdok.exclude.includes(f.properties.wijknaam),
    );
    if (!feats.length) throw new Error('PDOK wijken not found for: ' + a.pdok.gemeente);
    return unionRings(feats.flatMap((f) => ringsOf(f.geometry)));
  }
  // Duivendrecht is CBS "Wijk 00", so resolve at buurt level. The business park
  // between it and Amsterdam is merged in so the map has no unexplained notch.
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
    a.ringsLand = pdokRings(a);
    a.ringsIncl = a.ringsLand;
  } else if (a.buurtGebied) {
    // Buurt-level union from the city's buurt layer: single source, so the
    // shared edges cancel cleanly.
    const feats = buurtExcl.features.filter(
      (f) => a.buurtGebied.includes(f.properties.Gebied) && !(a.excludeBuurt || []).includes(f.properties.Buurt),
    );
    if (!feats.length) throw new Error('no buurten matched for ' + a.name);
    a.ringsLand = unionRings(feats.flatMap((f) => ringsOf(f.geometry)));
    a.ringsIncl = a.ringsLand;
  } else {
    a.resolvedCodes = codesFor(a);
    a.ringsLand = unionRings(a.resolvedCodes.flatMap((c) => ringsOf(exclByCode.get(c).geometry)));
    a.ringsIncl = a.resolvedCodes.flatMap((c) => ringsOf(inclByCode.get(c).geometry));
  }
}
const claimed = AREAS.filter((a) => a.resolvedCodes).flatMap((a) => a.resolvedCodes);
const dupes = claimed.filter((c, i) => claimed.indexOf(c) !== i);
if (dupes.length) throw new Error('wijk claimed by two areas: ' + dupes.join(', '));

// ---------- projection (bounds from the areas, height follows the data) ----------
const W = 1000, PAD = 10;
const allLand = AREAS.flatMap((a) => a.ringsLand).flat();
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

const ringArea = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
};
// Relative path encoding: "M x y l dx dy dx dy...". Deltas between neighbouring
// points are one or two digits where absolutes are three or four, which roughly
// halves the payload of the street network.
function encode(pts, close) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  if (pts.length > 1) {
    const deltas = [];
    for (let i = 1; i < pts.length; i++) {
      deltas.push(`${+(pts[i][0] - pts[i - 1][0]).toFixed(1)} ${+(pts[i][1] - pts[i - 1][1]).toFixed(1)}`);
    }
    d += 'l' + deltas.join(' ');
  }
  return close ? d + 'Z' : d;
}

// ---------- shape refinement ----------
// Morphological opening: shrink every ring then regrow it. Thin peninsulas,
// dock combs and sliver rims (thinner than ~2*delta) do not survive the shrink
// and never come back, which is what removes the scruff along the waterfront.
// Holes get the mirrored treatment so thin water slits heal shut while real
// lakes stay open.
const CLIP_SCALE = 100;
function offsetRing(pts, delta) {
  const path = pts.map(([x, y]) => ({ X: Math.round(x * CLIP_SCALE), Y: Math.round(y * CLIP_SCALE) }));
  const co = new ClipperLib.ClipperOffset(2, 0.25 * CLIP_SCALE);
  co.AddPath(path, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
  const out = new ClipperLib.Paths();
  co.Execute(out, delta * CLIP_SCALE);
  return out.map((p) => p.map((pt) => [pt.X / CLIP_SCALE, pt.Y / CLIP_SCALE]));
}
function openRing(pts, delta, isHole) {
  const d1 = isHole ? delta : -delta;
  let mids = offsetRing(pts, d1);
  let out = [];
  for (const m of mids) out = out.concat(offsetRing(m, -d1));
  return out;
}
const signedArea = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
};

// Douglas-Peucker. This is what actually removes rough edges: Chaikin alone
// only softens corners that the source noise keeps recreating.
function dp(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let maxD = -1, maxI = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
      if (d > maxD) { maxD = d; maxI = i; }
    }
    if (maxD > eps) { keep[maxI] = 1; stack.push([a, maxI], [maxI, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// Chaikin corner cutting. Closed variant for rings, open variant for streets
// (endpoints stay put). Symmetric, so a border shared by two areas smooths to
// the same curve from both sides.
function chaikin(pts, iters) {
  let cur = pts;
  for (let n = 0; n < iters; n++) {
    const out = [];
    for (let i = 0; i < cur.length; i++) {
      const a = cur[i], b = cur[(i + 1) % cur.length];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    cur = out;
  }
  return cur;
}
function chaikinOpen(pts, iters) {
  let cur = pts;
  for (let n = 0; n < iters; n++) {
    if (cur.length < 3) return cur;
    const out = [cur[0]];
    for (let i = 0; i < cur.length - 1; i++) {
      const a = cur[i], b = cur[i + 1];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    out.push(cur[cur.length - 1]);
    cur = out;
  }
  return cur;
}
// One decimal: enough precision to keep the curves flowing, half the bytes of
// full float output. Consecutive duplicates go.
const rnd1 = (raw) => {
  const r = raw.map((p) => [+p[0].toFixed(1), +p[1].toFixed(1)]);
  return r.filter((p, i) => i === 0 || p[0] !== r[i - 1][0] || p[1] !== r[i - 1][1]);
};
const perimeter = (pts) => {
  let p = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    p += Math.hypot(x2 - x1, y2 - y1);
  }
  return p;
};

// Project, drop points the rounding made redundant, and drop rings smaller than
// minArea so carved canals do not become subpixel noise. `soft` rounds the
// shape off; `minIQ` drops long slivers (isoperimetric quotient: a circle is 1,
// a hairline strip approaches 0), which is what keeps odd spots off the map.
// Refine a ring set into a path, mirroring the approved mockup exactly:
// filter the raw ring, open it (shrink-regrow kills scruff thinner than
// ~2*2.8 units), re-filter the surviving pieces, then simplify and curve.
// Curving before simplifying just rounds noise the data keeps recreating.
function toPath(rings, minArea = 60, { soft = false, minIQ = 0, iters = 3 } = {}) {
  const out = [];
  for (const ring of rings) {
    let pts = [];
    for (const p of ring) {
      const q = proj(p);
      const last = pts[pts.length - 1];
      if (!last || last[0] !== q[0] || last[1] !== q[1]) pts.push(q);
    }
    while (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
    if (pts.length < 3 || ringArea(pts) < minArea) continue;
    if (minIQ > 0 && (4 * Math.PI * ringArea(pts)) / perimeter(pts) ** 2 < minIQ) continue;
    if (!soft) {
      out.push(encode(pts, true));
      continue;
    }
    const hole = signedArea(pts) < 0;
    for (let opened of openRing(pts, 2.8, hole)) {
      if (opened.length < 3 || ringArea(opened) < minArea) continue;
      opened = dp(opened, 2.2);
      if (opened.length < 3) continue;
      opened = rnd1(chaikin(opened, iters));
      out.push(encode(opened, true));
    }
  }
  return out.join('');
}
// OSM ways -> stroked path. `thin` skips points that advance less than that many
// viewBox units, which is what keeps the residential grain affordable.
function linePath(ways, thin = 0) {
  const segs = [];
  for (const w of ways) {
    const pts = [];
    for (const g of w.geometry || []) {
      const q = proj([g.lon, g.lat]);
      const last = pts[pts.length - 1];
      if (!last) { pts.push(q); continue; }
      const d = Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]);
      if (d === 0 || d < thin) continue;
      pts.push(q);
    }
    if (pts.length > 1 && pts.some((p) => p[0] > -20 && p[0] < W + 20 && p[1] > -20 && p[1] < H + 20)) {
      // Same treatment as the shapes: simplify, then curve. Streets drawn
      // straight from OSM vertices read as surveyed segments, not drawn lines.
      segs.push(encode(rnd1(chaikinOpen(dp(pts, 3), 2)), false));
    }
  }
  return segs.join('');
}

// Shoelace centroid of the largest projected ring: a better label anchor than a
// vertex average for concave shapes like Noord.
function anchor(rings) {
  const projected = rings.map((r) => r.map(proj));
  const big = projected.sort((a, b) => ringArea(b) - ringArea(a))[0];
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < big.length; i++) {
    const [x1, y1] = big[i], [x2, y2] = big[(i + 1) % big.length];
    const cr = x1 * y2 - x2 * y1;
    A += cr;
    cx += (x1 + x2) * cr;
    cy += (y1 + y2) * cr;
  }
  A /= 2;
  return { x: Math.round(cx / (6 * A)), y: Math.round(cy / (6 * A)), area: Math.abs(A) };
}

// ---------- streets & lines ----------
const sw = osmStreets.elements.filter((e) => e.type === 'way');
const streetsMid = linePath(sw.filter((w) => /^(secondary|tertiary)$/.test(w.tags.highway || '')), 2);
const streetsMajor = linePath(sw.filter((w) => /^(motorway|trunk|primary)$/.test(w.tags.highway || '')), 2);
const canalsPath = linePath(sw.filter((w) => w.tags.waterway), 2);
const a10Path = linePath(osmLines.elements.filter((e) => e.type === 'way' && e.tags?.highway === 'motorway'), 2);

// ---------- parks ----------
const toLonLat = (g) => g.map((p) => [p.lon, p.lat]);
function relationOuterRings(rel) {
  const parts = (rel.members || [])
    .filter((m) => m.type === 'way' && (m.role === 'outer' || m.role === '') && m.geometry)
    .map((m) => toLonLat(m.geometry));
  const rings = [];
  while (parts.length) {
    const ring = parts.shift();
    let extended = true;
    while (extended && k(ring[0]) !== k(ring[ring.length - 1])) {
      extended = false;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (k(p[0]) === k(ring[ring.length - 1])) ring.push(...p.slice(1));
        else if (k(p[p.length - 1]) === k(ring[ring.length - 1])) ring.push(...p.slice(0, -1).reverse());
        else if (k(p[p.length - 1]) === k(ring[0])) ring.unshift(...p.slice(0, -1));
        else if (k(p[0]) === k(ring[0])) ring.unshift(...p.slice(1).reverse());
        else continue;
        parts.splice(i, 1);
        extended = true;
        break;
      }
    }
    if (ring.length > 3 && k(ring[0]) === k(ring[ring.length - 1])) rings.push(ring);
  }
  return rings;
}
function inRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// Test against the water-inclusive rings: Sloterpark's centroid falls in the
// Sloterplas, which the carved land rings exclude but the wijk itself contains.
const allAreaRings = AREAS.flatMap((a) => a.ringsIncl);
const insideScope = (pt) => allAreaRings.some((r) => inRing(pt, r));
// Main green only, per the client: proper parks, forests and nature reserves
// above a visibility threshold. No sport fields, golf courses, cemeteries or
// other "every piece of grass" categories.
const parkRingsMain = [];
const parkRingsBig = [];
const parkNames = new Set();
for (const el of osmGreens.elements) {
  const t = el.tags || {};
  const isBos = t.name === 'Amsterdamse Bos';
  const isPark = t.leisure === 'park';
  const isBigGreen = t.landuse === 'forest' || t.leisure === 'nature_reserve';
  if (!isBos && !isPark && !isBigGreen) continue;
  let rings = [];
  if (el.type === 'way' && el.geometry) {
    const ring = toLonLat(el.geometry);
    if (k(ring[0]) === k(ring[ring.length - 1])) rings = [ring];
  } else if (el.type === 'relation') {
    rings = relationOuterRings(el);
  }
  for (const ring of rings) {
    const c = ring.reduce((sm, p) => [sm[0] + p[0] / ring.length, sm[1] + p[1] / ring.length], [0, 0]);
    if (!insideScope(c)) continue;
    (isBos || isPark ? parkRingsMain : parkRingsBig).push(ring);
    if (t.name) parkNames.add(t.name);
  }
}
// Fewer, bigger greens (client request): a park earns its place from ~0.08 km2,
// anonymous forest/reserve patches from ~0.16 km2. Small pocket greens drop out.
const parksPath = toPath(parkRingsMain, 120, { soft: true, minIQ: 0.08, iters: 2 }) + toPath(parkRingsBig, 250, { soft: true, minIQ: 0.08, iters: 2 });

// ---------- one Van Gogh hue per neighbourhood ----------
// Adjacency from shared source vertices (pre-projection), plus the known
// cross-source borders. Greedy, highest degree first, balanced; with six hues
// over 26 areas the neighbour-distinct rule is enforced, not best-effort.
const areaVerts = new Map(AREAS.map((a) => [a.name, new Set(a.ringsLand.flat().map(k))]));
const adjacency = new Map(AREAS.map((a) => [a.name, new Set()]));
for (let i = 0; i < AREAS.length; i++) {
  for (let j = i + 1; j < AREAS.length; j++) {
    let shared = 0;
    for (const v of areaVerts.get(AREAS[i].name)) if (areaVerts.get(AREAS[j].name).has(v)) { if (++shared >= 3) break; }
    if (shared >= 3) {
      adjacency.get(AREAS[i].name).add(AREAS[j].name);
      adjacency.get(AREAS[j].name).add(AREAS[i].name);
    }
  }
}
EXTRA_ADJACENT.forEach(([a, b]) => { adjacency.get(a).add(b); adjacency.get(b).add(a); });
const hueOf = new Map();
for (const a of AREAS.slice().sort((x, y) => adjacency.get(y.name).size - adjacency.get(x.name).size)) {
  const taken = new Set([...adjacency.get(a.name)].map((n) => hueOf.get(n)).filter(Boolean));
  const counts = new Map(AREA_HUES.map((h) => [h, 0]));
  for (const h of hueOf.values()) counts.set(h, (counts.get(h) ?? 0) + 1);
  const options = AREA_HUES.filter((h) => !taken.has(h)).sort((x, y) => counts.get(x) - counts.get(y));
  hueOf.set(a.name, options[0] ?? AREA_HUES[0]);
}
for (const [a, neighbours] of adjacency) {
  for (const n of neighbours) if (hueOf.get(a) === hueOf.get(n)) throw new Error(`same hue on neighbours: ${a} / ${n}`);
}

// ---------- areas out ----------
const PAPER = '#f5f0e6';
const areas = AREAS.map((a) => {
  const { x, y, area } = anchor(a.ringsLand);
  return {
    name: a.name,
    slug: slugify(a.name),
    d: toPath(a.ringsLand, 60, { soft: true }),
    cx: x,
    cy: y,
    labelArea: area,
    color: hueOf.get(a.name),
  };
});

// ---------- labels: cut-out pills with a floating black pill ----------
// One size for every label (client rule: all pills the same height, all names
// the same size). A relaxation pass pushes overlapping labels apart until none
// touch; the build fails if any overlap survives, so the "pills never touch"
// guarantee is enforced here rather than eyeballed.
const LABEL_SIZE = 10;
const labels = areas.map((a) => {
  const size = LABEL_SIZE;
  const parts = a.name.toUpperCase().split(' & ');
  const lines = parts.length === 1 ? [parts[0]] : [parts[0], '& ' + parts[1]];
  const ls = +(size * 0.06).toFixed(1);
  const pw = (t) => Math.round(t.length * (size * 0.70 + ls) + size * 1.3);
  const ph = Math.round(size + 8);
  const w = Math.max(...lines.map(pw));
  const h = lines.length * ph + (lines.length - 1) * 3;
  return { slug: a.slug, size, ls, lines, pw, ph, x: a.cx, y: a.cy, w, h };
});
// Relaxation with anchor gravity: overlapping labels push each other apart
// while every label is pulled back toward its own area's centroid, so a pill
// stays on the neighbourhood it names instead of drifting off (the Houthavens
// pill once ended up in the IJ). Gravity is auto-tuned: start strong, and if
// the layout cannot reach zero overlaps, retry weaker. Zero overlaps stays a
// hard guarantee.
const MARGIN = 5;
function layout(gravity) {
  labels.forEach((L) => { L.x = L.ax; L.y = L.ay; });
  for (let it = 0; it < 400; it++) {
    let moved = false;
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const A = labels[i], B = labels[j];
        const ox = (A.w + B.w) / 2 + MARGIN - Math.abs(A.x - B.x);
        const oy = (A.h + B.h) / 2 + MARGIN - Math.abs(A.y - B.y);
        if (ox > 0 && oy > 0) {
          moved = true;
          if (oy <= ox) { const sg = A.y <= B.y ? -1 : 1; A.y += (sg * oy) / 2; B.y -= (sg * oy) / 2; }
          else { const sg = A.x <= B.x ? -1 : 1; A.x += (sg * ox) / 2; B.x -= (sg * ox) / 2; }
        }
      }
    }
    // fade the pull over time so separation can win the endgame
    const g = gravity * (1 - it / 400);
    for (const L of labels) {
      L.x += (L.ax - L.x) * g;
      L.y += (L.ay - L.y) * g;
    }
    if (!moved && it > 40) break;
  }
  labels.forEach((L) => {
    L.x = Math.round(Math.max(L.w / 2 + 6, Math.min(W - L.w / 2 - 6, L.x)));
    L.y = Math.round(Math.max(L.h / 2 + 6, Math.min(H - L.h / 2 - 6, L.y)));
  });
  let bad = 0;
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
    const A = labels[i], B = labels[j];
    if ((A.w + B.w) / 2 - Math.abs(A.x - B.x) > 0 && (A.h + B.h) / 2 - Math.abs(A.y - B.y) > 0) bad++;
  }
  return bad;
}
labels.forEach((L) => { L.ax = L.x; L.ay = L.y; });
let overlaps = -1, usedGravity = 0;
for (const g of [0.1, 0.06, 0.03, 0.015, 0]) {
  overlaps = layout(g);
  usedGravity = g;
  if (overlaps === 0) break;
}
if (overlaps) throw new Error(`labels overlap after relaxation: ${overlaps} pair(s)`);
const maxDrift = Math.max(...labels.map((L) => Math.hypot(L.x - L.ax, L.y - L.ay)));

// Bake per-pill geometry so the runtime does no layout work at all.
const labelsOut = labels.map((L) => {
  let y0 = L.y - L.h / 2;
  const pills = L.lines.map((t) => {
    const w = L.pw(t), h = L.ph;
    const pill = { t, x: L.x - w / 2, y: Math.round(y0), w, h, tx: L.x, ty: +(y0 + h / 2 + L.size * 0.35).toFixed(1) };
    y0 += h + 3;
    return pill;
  });
  return { slug: L.slug, size: L.size, ls: L.ls, pills };
});

// em dash guard: the client hard rule applies to generated names too
if (/[—–]/.test(JSON.stringify(areas) + JSON.stringify(labelsOut))) throw new Error('em/en dash in generated map data');

// ---------- static seams image ----------
// The street network, canals, A10 and parks are drawn once here and shipped as
// a bitmap, not as vectors. An SVG in an <img> is still rasterized by the
// browser, synchronously on the main thread, and Chromium redoes all two
// hundred thousand points whenever it wants a fresh raster (first paint, DPI
// changes, cache eviction on scroll re-entry): that was the residual map lag.
// A PNG only ever gets decoded, off the main thread, once.
const SEAM = PAPER;
// Every stroke is clipped to the land: paper-coloured lines outside the city
// quantize to near-paper pixels in the palette PNG and ghost against the page.
const seamsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><clipPath id="land">${areas.map((a) => `<path d="${a.d}" fill-rule="evenodd"/>`).join('')}</clipPath></defs>
${areas.map((a) => `<path d="${a.d}" fill="${a.color}" fill-rule="evenodd"/>`).join('\n')}
<g clip-path="url(#land)">
${areas.map((a) => `<path d="${a.d}" fill="none" stroke="${SEAM}" stroke-width="5" stroke-linejoin="round"/>`).join('')}
<path d="${parksPath}" fill="${PARK_GREEN}" fill-rule="evenodd"/>
<g fill="none" stroke="${SEAM}" stroke-linecap="round" stroke-linejoin="round">
<path d="${streetsMid}" stroke-width="1.6"/>
<path d="${streetsMajor}" stroke-width="2.6"/>
<path d="${canalsPath}" stroke-width="1.8"/>
<path d="${a10Path}" stroke-width="3.5"/>
</g>
</g>
</svg>`;
const PUB = path.join(process.cwd(), 'public');
fs.mkdirSync(PUB, { recursive: true });
// Rendered at 1600px wide, comfortably above the ~760px the map displays at,
// with a small palette: five flat colours plus antialiasing.
const sharp = (await import('sharp')).default;
const png = await sharp(Buffer.from(seamsSvg), { density: (72 * 1600) / W })
  .png({ palette: true, colors: 64 })
  .toBuffer();
fs.writeFileSync(path.join(PUB, 'map-london.png'), png);

const ts = `// GENERATED by scripts/build-city-map.mjs. Do not edit by hand.
//
// The Van Gogh map: one hue per neighbourhood (starry blue, sunflower ochre,
// sienna, iris violet, red oxide, pale cobalt), main streets and canals as
// rounded paper lines, parks as flat cypress-green shapes drawn over
// everything, named by cut-out pills with collision-resolved positions. All
// visuals live in /public/map-vangogh.png as a cached raster; only the
// interactive hit geometry ships as JS.
// Boundaries: maps.amsterdam.nl wijken (excl. water) plus PDOK/CBS for
// Amstelveen, Diemen and Duivendrecht. Nothing is fetched at runtime.

export interface CityArea {
  /** Display name, matches the by-area grid and AREA_GUIDES. */
  name: string;
  slug: string;
  /** SVG path in MAP_VIEWBOX space. */
  d: string;
  /** Shoelace centroid of the largest ring. */
  cx: number;
  cy: number;
  /** Colour for the hover card chrome. The quilt itself lives in the bitmap. */
  color: string;
}

export interface CityLabelPill {
  /** Uppercased text of this pill line. */
  t: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Text anchor point. */
  tx: number;
  ty: number;
}

export interface CityLabel {
  slug: string;
  size: number;
  /** Letter spacing in viewBox units. */
  ls: number;
  pills: CityLabelPill[];
}

export const MAP_VIEWBOX = '0 0 ${W} ${H}';

/** The streets/canals/parks overlay, served as a cached raster. */
export const MAP_SEAMS_SRC = '/map-london.png';

export const CITY_AREAS: CityArea[] = ${JSON.stringify(
  areas.map(({ name, slug, d, cx, cy, color }) => ({ name, slug, d, cx, cy, color })),
  null,
  2,
)};

/** Collision-resolved labels: no two ever touch. */
export const CITY_LABELS: CityLabel[] = ${JSON.stringify(labelsOut, null, 2)};
`;

fs.writeFileSync(OUT, ts);

console.log(`areas: ${areas.length} | viewBox 0 0 ${W} ${H} | label overlaps: ${overlaps} | gravity ${usedGravity} | max pill drift ${maxDrift.toFixed(0)} units`);
areas.forEach((a) => console.log(`  ${a.name.padEnd(32)} ${a.color}`));
console.log(`greens: ${parkRingsMain.length + parkRingsBig.length} candidate rings from ${parkNames.size} named places (parks, forests, reserves only)`);
const kb = (x) => (x.length / 1024).toFixed(1) + 'kb';
console.log(`image: mid ${kb(streetsMid)} | major ${kb(streetsMajor)} | canals ${kb(canalsPath)} | a10 ${kb(a10Path)} | parks ${kb(parksPath)}`);
console.log(`wrote public/map-london.png (${(png.length / 1024).toFixed(1)}kb bitmap, from ${(seamsSvg.length / 1024).toFixed(1)}kb of vectors)`);
console.log(`wrote ${OUT} (${(ts.length / 1024).toFixed(1)}kb, ships as JS)`);
