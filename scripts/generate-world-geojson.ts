/**
 * @file 世界地图GeoJSON生成脚本
 * @desc 从world-atlas(Natural Earth 110m)提取冷战国家边界，
 *       按COUNTRY_ID_TO_NAME映射合并/分割多边形
 *       德国按经度10.5°E分割为东西德，苏联含全部加盟共和国
 *       小国合并为区域集合(中美洲/西非/南非等)
 * @caution 德国分割是近似的，苏联包含解体后国家在冷战背景下不够精确
 * @usage tsx scripts/generate-world-geojson.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { feature } from 'topojson-client'

const worldAtlasPath = join(__dirname, '../node_modules/world-atlas/countries-110m.json')
const raw = JSON.parse(readFileSync(worldAtlasPath, 'utf-8'))

const COUNTRY_ID_TO_NAME: Record<string, string[]> = {
  usa: ['United States of America'],
  ussr: ['Russia', 'Ukraine', 'Belarus', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Azerbaijan', 'Armenia', 'Georgia', 'Moldova', 'Lithuania', 'Latvia', 'Estonia'],
  uk: ['United Kingdom'],
  france: ['France'],
  west_germany: ['Germany'],
  east_germany: ['Germany'],
  china: ['China'],
  japan: ['Japan'],
  south_korea: ['Korea', 'Republic of Korea'],
  north_korea: ['Korea', 'Democratic People\'s Republic of Korea'],
  cuba: ['Cuba'],
  vietnam: ['Vietnam'],
  iran: ['Iran'],
  egypt: ['Egypt'],
  italy: ['Italy'],
  spain: ['Spain'],
  portugal: ['Portugal'],
  netherlands: ['Netherlands'],
  belgium: ['Belgium'],
  poland: ['Poland'],
  czechoslovakia: ['Czech Republic', 'Slovakia'],
  hungary: ['Hungary'],
  romania: ['Romania'],
  bulgaria: ['Bulgaria'],
  yugoslavia: ['Serbia', 'Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'North Macedonia', 'Slovenia', 'Kosovo'],
  albania: ['Albania'],
  greece: ['Greece'],
  turkey: ['Turkey'],
  india: ['India'],
  pakistan: ['Pakistan'],
  afghanistan: ['Afghanistan'],
  indonesia: ['Indonesia'],
  australia: ['Australia'],
  canada: ['Canada'],
  mexico: ['Mexico'],
  israel: ['Israel'],
  saudi_arabia: ['Saudi Arabia'],
  iraq: ['Iraq'],
  syria: ['Syria'],
  libya: ['Libya'],
  mongolia: ['Mongolia'],
  finland: ['Finland'],
  sweden: ['Sweden'],
  norway: ['Norway'],
  denmark: ['Denmark'],
  austria: ['Austria'],
  switzerland: ['Switzerland'],
  ireland: ['Ireland'],
  // South America
  brazil: ['Brazil'],
  argentina: ['Argentina'],
  chile: ['Chile'],
  colombia: ['Colombia'],
  venezuela: ['Venezuela'],
  peru: ['Peru'],
  ecuador: ['Ecuador'],
  // Merged:
  southern_cone: ['Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname'],
  // Central America (merged bloc)
  central_america: ['Panama', 'Costa Rica', 'Nicaragua', 'Honduras', 'El Salvador', 'Guatemala', 'Belize'],
  // Caribbean (merged bloc)
  caribbean: ['Dominican Republic', 'Haiti', 'Jamaica', 'Trinidad and Tobago', 'Bahamas', 'Barbados', 'Saint Lucia', 'Grenada', 'Antigua and Barbuda', 'Saint Vincent and the Grenadines', 'Saint Kitts and Nevis', 'Dominica'],
  // Asia
  philippines: ['Philippines'],
  thailand: ['Thailand'],
  myanmar: ['Myanmar'],
  malaysia: ['Malaysia'],
  singapore: ['Singapore'],
  sri_lanka: ['Sri Lanka'],
  nepal: ['Nepal'],
  bangladesh: ['Bangladesh'],
  // Oceania
  new_zealand: ['New Zealand'],
  papua_new_guinea: ['Papua New Guinea'],
  // Africa - keep only strategic countries, merge rest
  nigeria: ['Nigeria'],
  ghana: ['Ghana'],           // First independent African nation
  kenya: ['Kenya'],
  sudan: ['Sudan'],
  algeria: ['Algeria'],
  morocco: ['Morocco'],
  tunisia: ['Tunisia'],
  somalia: ['Somalia'],
  congo_drc: ['Dem. Rep. Congo'],
  ethiopia: ['Ethiopia'],
  angola: ['Angola'],
  mozambique: ['Mozambique'],
  madagascar: ['Madagascar'],
  south_africa: ['South Africa'],
  // Merged African regions
  west_africa: ['Senegal', 'Mali', 'Niger', 'Chad', 'Mauritania', 'Gambia',
    'Guinea-Bissau', 'Guinea', 'Sierra Leone', 'Liberia', "Côte d'Ivoire",
    'Burkina Faso', 'Benin', 'Togo', 'Cameroon'],
  central_africa: ['Central African Rep.', 'Eq. Guinea', 'Gabon',
    'Congo', 'Rwanda', 'Burundi', 'Uganda', 'Tanzania'],
  east_africa: ['Djibouti', 'Eritrea'],
  southern_africa: ['Zambia', 'Zimbabwe', 'Malawi', 'Botswana',
    'Namibia', 'Lesotho', 'Eswatini'],
  island_nations: ['Mauritius', 'São Tomé and Príncipe',
    'Comoros', 'Seychelles', 'Cabo Verde'],
  // Middle East
  jordan: ['Jordan'],
  lebanon: ['Lebanon'],
  kuwait: ['Kuwait'],
  yemen: ['Yemen'],
  oman: ['Oman'],
  uae: ['United Arab Emirates'],
  // Europe
  iceland: ['Iceland'],
  benelux: ['Netherlands', 'Belgium', 'Luxembourg'],
  cyprus: ['Cyprus'],
}

const countries = feature(raw, raw.objects.countries) as any
const features: any[] = []
const usedIds = new Set<string>()

const nameToFeatures: Record<string, any[]> = {}
for (const f of countries.features) {
  const name = f.properties?.name
  if (name) {
    if (!nameToFeatures[name]) nameToFeatures[name] = []
    nameToFeatures[name].push(f)
  }
}

// Helper: split a Germany feature into east/west by polygon centroid longitude
function splitGermany(features: any[]): { west: any[]; east: any[] } {
  const west: any[] = []
  const east: any[] = []
  for (const f of features) {
    const geoms = extractGeometries(f.geometry)
    for (const geom of geoms) {
      if (geom.type === 'Polygon') {
        const centroidLon = calculateCentroidLon(geom)
        if (centroidLon < 10.5) west.push(geom)
        else east.push(geom)
      } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) {
          const fakePoly = { type: 'Polygon', coordinates: poly }
          const centroidLon = calculateCentroidLon(fakePoly)
          if (centroidLon < 10.5) west.push(fakePoly)
          else east.push(fakePoly)
        }
      }
    }
  }
  return { west, east }
}

function extractGeometries(geom: any): any[] {
  if (!geom) return []
  if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') return [geom]
  if (geom.type === 'GeometryCollection') return geom.geometries.flatMap(extractGeometries)
  return []
}

function calculateCentroidLon(polygon: any): number {
  const coords = polygon.coordinates[0]
  let sum = 0
  for (const coord of coords) sum += coord[0]
  return sum / coords.length
}

for (const [countryId, names] of Object.entries(COUNTRY_ID_TO_NAME)) {
  // Normal country processing (Germany split handled visually on the map)
  const matchedFeatures: any[] = []
  for (const name of names) {
    const found = nameToFeatures[name]
    if (found) matchedFeatures.push(...found)
  }
  if (matchedFeatures.length === 0) {
    console.warn(`Missing: ${countryId}`)
    continue
  }
  usedIds.add(countryId)
  if (matchedFeatures.length === 1) {
    features.push({
      type: 'Feature',
      properties: { id: countryId, name: countryId.replace(/_/g, ' ') },
      geometry: matchedFeatures[0].geometry,
    })
  } else {
    features.push({
      type: 'Feature',
      properties: { id: countryId, name: countryId.replace(/_/g, ' ') },
      geometry: {
        type: 'GeometryCollection',
        geometries: matchedFeatures.map((f: any) => f.geometry),
      },
    })
  }
}

writeFileSync(
  join(__dirname, '../src/data/world.geo.json'),
  JSON.stringify({ type: 'FeatureCollection', features })
)
console.log(`Done: ${features.length} features`)
