/**
 * @file 初始国家数据（1945年冷战开局设定）
 * @desc ~55+个国家/地区，包含完整经济/军事/社会/影响力参数
 *       美苏作为超级大国有特殊属性，热点地区(德/朝/越/中)为焦点国家
 *       部分小国合并为区域集合(如中美洲、西非等)
 */
import type { Country, Alignment } from '@/types'

interface CountryOpts {
  gdp?: number; industry?: number; resources?: number; budget?: number
  army?: number; navy?: number; airforce?: number
  stability?: number; morale?: number
  population: number  // in millions
  government?: string
}

function mkNeutral(name: string, region: string, cws: number, opts: CountryOpts): Country {
  return mkCountry(name, region, cws, 'NON_ALIGNED', 20, 20, opts)
}

function mkAlly(name: string, region: string, cws: number, opts: CountryOpts, ally: 'usa' | 'ussr'): Country {
  const infl = ally === 'usa' ? { usa: 72, ussr: 5 } : { usa: 5, ussr: 80 }
  return mkCountry(name, region, cws, ally === 'usa' ? 'USA_ALLY' : 'USSR_ALLY', infl.usa, infl.ussr, opts)
}

function mkCountry(name: string, region: string, cws: number, alignment: Alignment, inflUsa: number, inflUssr: number, opts: CountryOpts): Country {
  return {
    id: name.toLowerCase().replace(/\s+/g, '_'),
    name, region, territoryPolygons: [],
    coldWarScore: cws,
    economy: { gdp: opts.gdp ?? 10, industry: opts.industry ?? opts.gdp ?? 10, resources: opts.resources ?? opts.gdp ?? 10, budget: opts.budget ?? opts.gdp ?? 10 },
    military: { army: opts.army ?? 3, navy: opts.navy ?? 1, airforce: opts.airforce ?? 1, nuclear: false, nuclearArsenal: 0 },
    society: { stability: opts.stability ?? 30, morale: opts.morale ?? 30, population: opts.population },
    influence: { usa: inflUsa, ussr: inflUssr },
    alignment, government: opts.government ?? 'Republic', isFlashpoint: false,
  }
}

export const INITIAL_COUNTRIES: Record<string, Country> = {
  // ===== Superpowers =====
  usa: {
    id: 'usa', name: 'United States', region: 'north_america', territoryPolygons: [], coldWarScore: 0,
    economy: { gdp: 100, industry: 95, resources: 85, budget: 100 },
    military: { army: 85, navy: 95, airforce: 90, nuclear: true, nuclearArsenal: 3 },
    society: { stability: 90, morale: 80, population: 140 },
    influence: { usa: 100, ussr: 0 }, alignment: 'USA_ALLY', government: 'Democratic Republic', isFlashpoint: false,
  },
  ussr: {
    id: 'ussr', name: 'Soviet Union', region: 'eastern_europe', territoryPolygons: [], coldWarScore: 0,
    economy: { gdp: 40, industry: 45, resources: 75, budget: 80 },
    military: { army: 100, navy: 35, airforce: 70, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 75, morale: 90, population: 170 },
    influence: { usa: 0, ussr: 100 }, alignment: 'USSR_ALLY', government: 'Single-party Socialist', isFlashpoint: false,
  },

  // ===== Western Europe =====
  uk: mkAlly('United Kingdom', 'western_europe', 15, { gdp: 30, industry: 35, resources: 20, budget: 35, army: 60, navy: 75, airforce: 65, stability: 70, morale: 55, population: 49, government: 'Constitutional Monarchy' }, 'usa'),
  france: mkAlly('France', 'western_europe', 12, { gdp: 20, industry: 20, resources: 18, budget: 22, army: 50, navy: 45, airforce: 40, stability: 50, morale: 45, population: 40, government: 'Provisional Republic' }, 'usa'),
  italy: mkAlly('Italy', 'western_europe', 10, { gdp: 15, industry: 15, resources: 12, budget: 15, army: 30, navy: 25, airforce: 20, stability: 45, morale: 35, population: 45, government: 'Republic' }, 'usa'),
  west_germany: {
    id: 'west_germany', name: 'West Germany', region: 'western_europe', territoryPolygons: [], coldWarScore: 48,
    economy: { gdp: 18, industry: 15, resources: 10, budget: 18 },
    military: { army: 3, navy: 1, airforce: 1, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 40, morale: 30, population: 46 },
    influence: { usa: 65, ussr: 5 }, alignment: 'USA_ALLY', government: 'Occupied / Federal Republic', isFlashpoint: true,
  },
  east_germany: {
    id: 'east_germany', name: 'East Germany', region: 'eastern_europe', territoryPolygons: [], coldWarScore: 48,
    economy: { gdp: 12, industry: 12, resources: 8, budget: 12 },
    military: { army: 25, navy: 1, airforce: 15, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 50, morale: 35, population: 18 },
    influence: { usa: 3, ussr: 80 }, alignment: 'USSR_ALLY', government: 'Socialist Republic', isFlashpoint: true,
  },
  spain: mkNeutral('Spain', 'western_europe', 8, { gdp: 12, industry: 10, resources: 10, budget: 10, army: 30, navy: 15, airforce: 10, stability: 50, morale: 40, population: 28, government: 'Francoist Dictatorship' }),
  portugal: mkAlly('Portugal', 'western_europe', 5, { gdp: 8, industry: 6, resources: 5, budget: 7, army: 15, navy: 8, airforce: 5, stability: 55, morale: 45, population: 8, government: 'Estado Novo' }, 'usa'),
  netherlands: mkAlly('Netherlands', 'western_europe', 8, { gdp: 12, industry: 10, resources: 6, budget: 10, army: 12, navy: 15, airforce: 8, stability: 55, morale: 40, population: 9, government: 'Constitutional Monarchy' }, 'usa'),
  belgium: mkAlly('Belgium', 'western_europe', 8, { gdp: 10, industry: 10, resources: 5, budget: 8, army: 10, navy: 3, airforce: 5, stability: 50, morale: 40, population: 8, government: 'Constitutional Monarchy' }, 'usa'),
  switzerland: mkNeutral('Switzerland', 'western_europe', 3, { gdp: 15, industry: 14, resources: 5, budget: 12, army: 8, navy: 1, airforce: 3, stability: 80, morale: 70, population: 4, government: 'Federal Republic' }),
  austria: mkNeutral('Austria', 'western_europe', 8, { gdp: 8, industry: 8, resources: 5, budget: 7, army: 3, navy: 1, airforce: 1, stability: 45, morale: 35, population: 7, government: 'Occupied / Republic' }),
  ireland: mkNeutral('Ireland', 'western_europe', 3, { gdp: 6, industry: 4, resources: 3, budget: 4, army: 2, navy: 1, airforce: 1, stability: 65, morale: 60, population: 3, government: 'Republic' }),
  iceland: mkAlly('Iceland', 'western_europe', 3, { gdp: 5, industry: 3, resources: 2, budget: 3, army: 1, navy: 1, airforce: 1, stability: 75, morale: 70, population: 0.13, government: 'Republic' }, 'usa'),

  // ===== Northern Europe =====
  sweden: mkNeutral('Sweden', 'western_europe', 5, { gdp: 18, industry: 16, resources: 12, budget: 15, army: 20, navy: 15, airforce: 12, stability: 80, morale: 75, population: 7, government: 'Constitutional Monarchy' }),
  norway: mkAlly('Norway', 'western_europe', 6, { gdp: 10, industry: 8, resources: 6, budget: 8, army: 5, navy: 10, airforce: 4, stability: 70, morale: 60, population: 3, government: 'Constitutional Monarchy' }, 'usa'),
  denmark: mkAlly('Denmark', 'western_europe', 5, { gdp: 9, industry: 8, resources: 4, budget: 7, army: 3, navy: 6, airforce: 3, stability: 70, morale: 60, population: 4, government: 'Constitutional Monarchy' }, 'usa'),
  finland: mkNeutral('Finland', 'western_europe', 10, { gdp: 6, industry: 6, resources: 5, budget: 5, army: 15, navy: 3, airforce: 5, stability: 55, morale: 50, population: 4, government: 'Republic' }),

  // ===== Eastern Bloc =====
  poland: mkAlly('Poland', 'eastern_europe', 25, { gdp: 8, industry: 7, resources: 8, budget: 6, army: 40, navy: 3, airforce: 15, stability: 40, morale: 35, population: 24, government: 'Socialist Republic' }, 'ussr'),
  czechoslovakia: mkAlly('Czechoslovakia', 'eastern_europe', 20, { gdp: 12, industry: 12, resources: 8, budget: 10, army: 25, navy: 1, airforce: 10, stability: 50, morale: 45, population: 14, government: 'Socialist Republic' }, 'ussr'),
  hungary: mkAlly('Hungary', 'eastern_europe', 22, { gdp: 8, industry: 7, resources: 5, budget: 6, army: 15, navy: 1, airforce: 5, stability: 40, morale: 35, population: 9, government: 'Socialist Republic' }, 'ussr'),
  romania: mkAlly('Romania', 'eastern_europe', 22, { gdp: 7, industry: 6, resources: 8, budget: 6, army: 25, navy: 3, airforce: 8, stability: 40, morale: 35, population: 16, government: 'Socialist Republic' }, 'ussr'),
  bulgaria: mkAlly('Bulgaria', 'eastern_europe', 18, { gdp: 5, industry: 4, resources: 4, budget: 4, army: 20, navy: 2, airforce: 5, stability: 45, morale: 40, population: 6, government: 'Socialist Republic' }, 'ussr'),
  yugoslavia: mkNeutral('Yugoslavia', 'eastern_europe', 18, { gdp: 6, industry: 5, resources: 6, budget: 5, army: 35, navy: 2, airforce: 8, stability: 45, morale: 50, population: 16, government: 'Socialist Federal Republic' }),
  albania: mkNeutral('Albania', 'eastern_europe', 15, { gdp: 3, industry: 2, resources: 3, budget: 2, army: 8, navy: 1, airforce: 1, stability: 40, morale: 45, population: 1.2, government: 'Socialist Republic' }),

  // ===== Southern Europe =====
  greece: mkAlly('Greece', 'southern_europe', 18, { gdp: 5, industry: 4, resources: 3, budget: 4, army: 20, navy: 5, airforce: 3, stability: 35, morale: 30, population: 7, government: 'Constitutional Monarchy' }, 'usa'),
  turkey: mkNeutral('Turkey', 'southern_europe', 15, { gdp: 8, industry: 5, resources: 6, budget: 6, army: 30, navy: 8, airforce: 5, stability: 50, morale: 45, population: 19, government: 'Republic' }),
  cyprus: mkNeutral('Cyprus', 'southern_europe', 8, { gdp: 3, industry: 2, resources: 1, budget: 2, army: 1, navy: 1, airforce: 1, stability: 40, morale: 40, population: 0.5, government: 'Crown Colony' }),

  // ===== North America =====
  canada: mkAlly('Canada', 'north_america', 5, { gdp: 20, industry: 18, resources: 25, budget: 18, army: 20, navy: 18, airforce: 15, stability: 80, morale: 75, population: 12, government: 'Dominion / Constitutional Monarchy' }, 'usa'),
  mexico: mkAlly('Mexico', 'latin_america', 5, { gdp: 10, industry: 7, resources: 12, budget: 8, army: 10, navy: 3, airforce: 3, stability: 55, morale: 50, population: 22, government: 'Republic' }, 'usa'),

  // ===== South America =====
  brazil: mkNeutral('Brazil', 'latin_america', 5, { gdp: 12, industry: 8, resources: 18, budget: 10, army: 25, navy: 10, airforce: 8, stability: 50, morale: 50, population: 46, government: 'Republic' }),
  argentina: mkNeutral('Argentina', 'latin_america', 8, { gdp: 12, industry: 10, resources: 15, budget: 10, army: 15, navy: 10, airforce: 8, stability: 55, morale: 55, population: 16, government: 'Republic' }),
  chile: mkNeutral('Chile', 'latin_america', 5, { gdp: 7, industry: 5, resources: 8, budget: 5, army: 6, navy: 5, airforce: 3, stability: 55, morale: 50, population: 5, government: 'Republic' }),
  colombia: mkNeutral('Colombia', 'latin_america', 8, { gdp: 7, industry: 5, resources: 8, budget: 5, army: 8, navy: 3, airforce: 2, stability: 45, morale: 45, population: 10, government: 'Republic' }),
  venezuela: mkNeutral('Venezuela', 'latin_america', 6, { gdp: 8, industry: 4, resources: 15, budget: 6, army: 5, navy: 2, airforce: 2, stability: 50, morale: 45, population: 5, government: 'Republic' }),
  peru: mkNeutral('Peru', 'latin_america', 6, { gdp: 5, industry: 3, resources: 6, budget: 4, army: 6, navy: 3, airforce: 2, stability: 40, morale: 40, population: 7, government: 'Republic' }),
  ecuador: mkNeutral('Ecuador', 'latin_america', 5, { gdp: 3, industry: 2, resources: 3, budget: 2, army: 3, navy: 1, airforce: 1, stability: 40, morale: 40, population: 3, government: 'Republic' }),
  southern_cone: mkNeutral('Southern Cone', 'latin_america', 5, { gdp: 4, industry: 3, resources: 4, budget: 3, army: 3, navy: 1, airforce: 1, stability: 40, morale: 40, population: 5, government: 'Republics' }),
  central_america: mkNeutral('Central America', 'latin_america', 8, { gdp: 3, industry: 2, resources: 3, budget: 2, army: 3, navy: 1, airforce: 1, stability: 35, morale: 35, population: 8, government: 'Republics' }),
  caribbean: mkNeutral('Caribbean', 'latin_america', 6, { gdp: 3, industry: 2, resources: 2, budget: 2, army: 2, navy: 1, airforce: 1, stability: 40, morale: 40, population: 4, government: 'Colonies & Republics' }),
  cuba: {
    id: 'cuba', name: 'Cuba', region: 'latin_america', territoryPolygons: [], coldWarScore: 5,
    economy: { gdp: 8, industry: 5, resources: 6, budget: 6 },
    military: { army: 6, navy: 3, airforce: 2, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 50, morale: 50, population: 5 },
    influence: { usa: 80, ussr: 3 }, alignment: 'USA_ALLY', government: 'Republic (Batista)', isFlashpoint: false,
  },

  // ===== East Asia =====
  china: {
    id: 'china', name: 'China', region: 'east_asia', territoryPolygons: [], coldWarScore: 30,
    economy: { gdp: 10, industry: 3, resources: 15, budget: 5 },
    military: { army: 50, navy: 2, airforce: 3, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 15, morale: 30, population: 540 },
    influence: { usa: 25, ussr: 40 }, alignment: 'NON_ALIGNED', government: 'ROC / Civil War', isFlashpoint: true,
  },
  japan: {
    id: 'japan', name: 'Japan', region: 'east_asia', territoryPolygons: [], coldWarScore: 5,
    economy: { gdp: 15, industry: 10, resources: 3, budget: 12 },
    military: { army: 3, navy: 2, airforce: 1, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 35, morale: 20, population: 72 },
    influence: { usa: 90, ussr: 0 }, alignment: 'USA_ALLY', government: 'Occupied / Democracy', isFlashpoint: false,
  },
  south_korea: {
    id: 'south_korea', name: 'South Korea', region: 'east_asia', territoryPolygons: [], coldWarScore: 55,
    economy: { gdp: 4, industry: 2, resources: 1, budget: 3 },
    military: { army: 8, navy: 1, airforce: 2, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 25, morale: 25, population: 19 },
    influence: { usa: 75, ussr: 3 }, alignment: 'USA_ALLY', government: 'Military Occupation', isFlashpoint: true,
  },
  north_korea: {
    id: 'north_korea', name: 'North Korea', region: 'east_asia', territoryPolygons: [], coldWarScore: 55,
    economy: { gdp: 3, industry: 2, resources: 2, budget: 3 },
    military: { army: 15, navy: 1, airforce: 2, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 25, morale: 35, population: 9 },
    influence: { usa: 2, ussr: 85 }, alignment: 'USSR_ALLY', government: 'Socialist / Kim Il-sung', isFlashpoint: true,
  },
  mongolia: mkAlly('Mongolia', 'east_asia', 15, { gdp: 2, industry: 1, resources: 3, budget: 2, army: 5, navy: 1, airforce: 1, stability: 40, morale: 45, population: 0.8, government: 'Socialist Republic' }, 'ussr'),

  // ===== South & Southeast Asia =====
  india: mkNeutral('India', 'south_asia', 8, { gdp: 10, industry: 4, resources: 12, budget: 8, army: 40, navy: 5, airforce: 8, stability: 40, morale: 45, population: 380, government: 'British Raj' }),
  pakistan: mkNeutral('Pakistan', 'south_asia', 12, { gdp: 5, industry: 2, resources: 4, budget: 3, army: 15, navy: 2, airforce: 3, stability: 35, morale: 40, population: 70, government: 'British India' }),
  afghanistan: mkNeutral('Afghanistan', 'south_asia', 10, { gdp: 2, industry: 1, resources: 1, budget: 1, army: 5, navy: 1, airforce: 1, stability: 30, morale: 30, population: 10, government: 'Kingdom' }),
  indonesia: mkNeutral('Indonesia', 'southeast_asia', 12, { gdp: 4, industry: 2, resources: 8, budget: 3, army: 8, navy: 2, airforce: 1, stability: 25, morale: 45, population: 70, government: 'Proclaimed Republic' }),
  philippines: mkAlly('Philippines', 'southeast_asia', 10, { gdp: 5, industry: 3, resources: 5, budget: 4, army: 8, navy: 3, airforce: 2, stability: 35, morale: 40, population: 19, government: 'Commonwealth / US protectorate' }, 'usa'),
  thailand: mkNeutral('Thailand', 'southeast_asia', 8, { gdp: 4, industry: 2, resources: 4, budget: 3, army: 8, navy: 2, airforce: 2, stability: 45, morale: 40, population: 17, government: 'Constitutional Monarchy' }),
  myanmar: mkNeutral('Myanmar', 'southeast_asia', 8, { gdp: 4, industry: 2, resources: 5, budget: 3, army: 6, navy: 2, airforce: 1, stability: 30, morale: 35, population: 17, government: 'British Colony' }),
  malaysia: mkAlly('Malaysia', 'southeast_asia', 6, { gdp: 5, industry: 3, resources: 8, budget: 4, army: 3, navy: 2, airforce: 1, stability: 40, morale: 35, population: 5, government: 'British Colony' }, 'usa'),
  vietnam: {
    id: 'vietnam', name: 'Vietnam', region: 'southeast_asia', territoryPolygons: [], coldWarScore: 60,
    economy: { gdp: 3, industry: 1, resources: 3, budget: 2 },
    military: { army: 10, navy: 1, airforce: 1, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 15, morale: 30, population: 25 },
    influence: { usa: 15, ussr: 55 }, alignment: 'NON_ALIGNED', government: 'Colonial / Viet Minh', isFlashpoint: true,
  },

  // ===== Middle East =====
  iran: mkNeutral('Iran', 'middle_east', 20, { gdp: 6, industry: 3, resources: 15, budget: 5, army: 15, navy: 2, airforce: 3, stability: 35, morale: 35, population: 14, government: 'Constitutional Monarchy' }),
  iraq: mkNeutral('Iraq', 'middle_east', 12, { gdp: 4, industry: 2, resources: 12, budget: 4, army: 6, navy: 1, airforce: 2, stability: 35, morale: 35, population: 5, government: 'Constitutional Monarchy' }),
  saudi_arabia: mkNeutral('Saudi Arabia', 'middle_east', 8, { gdp: 5, industry: 1, resources: 20, budget: 4, army: 3, navy: 1, airforce: 1, stability: 55, morale: 50, population: 3, government: 'Absolute Monarchy' }),
  israel: mkNeutral('Israel', 'middle_east', 25, { gdp: 5, industry: 3, resources: 1, budget: 4, army: 5, navy: 1, airforce: 2, stability: 40, morale: 50, population: 0.6, government: 'Mandate / Pre-state' }),
  jordan: mkNeutral('Jordan', 'middle_east', 10, { gdp: 2, industry: 1, resources: 1, budget: 2, army: 3, navy: 1, airforce: 1, stability: 40, morale: 40, population: 0.4, government: 'Kingdom' }),
  syria: mkNeutral('Syria', 'middle_east', 15, { gdp: 3, industry: 2, resources: 3, budget: 2, army: 6, navy: 1, airforce: 2, stability: 30, morale: 35, population: 3, government: 'Republic' }),
  lebanon: mkNeutral('Lebanon', 'middle_east', 12, { gdp: 4, industry: 2, resources: 1, budget: 3, army: 2, navy: 1, airforce: 1, stability: 40, morale: 45, population: 1.2, government: 'Republic' }),
  kuwait: mkNeutral('Kuwait', 'middle_east', 8, { gdp: 5, industry: 1, resources: 20, budget: 5, army: 1, navy: 1, airforce: 1, stability: 50, morale: 45, population: 0.15, government: 'Protectorate' }),
  yemen: mkNeutral('Yemen', 'middle_east', 8, { gdp: 2, industry: 1, resources: 1, budget: 1, army: 3, navy: 1, airforce: 1, stability: 30, morale: 30, population: 4, government: 'Kingdom' }),
  oman: mkNeutral('Oman', 'middle_east', 6, { gdp: 2, industry: 1, resources: 8, budget: 2, army: 1, navy: 1, airforce: 1, stability: 40, morale: 40, population: 0.5, government: 'Sultanate' }),
  uae: mkNeutral('United Arab Emirates', 'middle_east', 5, { gdp: 2, industry: 1, resources: 10, budget: 2, army: 1, navy: 1, airforce: 1, stability: 45, morale: 40, population: 0.1, government: 'Trucial States' }),

  // ===== Africa =====
  egypt: {
    id: 'egypt', name: 'Egypt', region: 'middle_east', territoryPolygons: [], coldWarScore: 15,
    economy: { gdp: 6, industry: 3, resources: 5, budget: 5 },
    military: { army: 15, navy: 3, airforce: 4, nuclear: false, nuclearArsenal: 0 },
    society: { stability: 30, morale: 35, population: 19 },
    influence: { usa: 30, ussr: 25 }, alignment: 'NON_ALIGNED', government: 'Constitutional Monarchy', isFlashpoint: false,
  },
  libya: mkNeutral('Libya', 'africa', 8, { gdp: 3, industry: 1, resources: 10, budget: 3, army: 4, navy: 1, airforce: 1, stability: 35, morale: 35, population: 1, government: 'British/French Admin' }),
  algeria: mkNeutral('Algeria', 'africa', 10, { gdp: 5, industry: 2, resources: 8, budget: 4, army: 8, navy: 2, airforce: 2, stability: 30, morale: 35, population: 9, government: 'French Colony' }),
  morocco: mkNeutral('Morocco', 'africa', 8, { gdp: 4, industry: 2, resources: 5, budget: 3, army: 4, navy: 1, airforce: 1, stability: 35, morale: 40, population: 8, government: 'French Protectorate' }),
  tunisia: mkNeutral('Tunisia', 'africa', 8, { gdp: 4, industry: 2, resources: 3, budget: 3, army: 3, navy: 2, airforce: 1, stability: 35, morale: 35, population: 3, government: 'French Protectorate' }),
  sudan: mkNeutral('Sudan', 'africa', 8, { gdp: 3, industry: 1, resources: 3, budget: 2, army: 5, navy: 1, airforce: 1, stability: 25, morale: 30, population: 6, government: 'Anglo-Egyptian Condominium' }),
  ethiopia: mkNeutral('Ethiopia', 'africa', 8, { gdp: 3, industry: 1, resources: 2, budget: 2, army: 8, navy: 1, airforce: 1, stability: 30, morale: 40, population: 18, government: 'Empire' }),
  somalia: mkNeutral('Somalia', 'africa', 8, { gdp: 2, industry: 1, resources: 1, budget: 1, army: 3, navy: 1, airforce: 1, stability: 20, morale: 25, population: 2, government: 'Trust Territory' }),
  kenya: mkNeutral('Kenya', 'africa', 5, { gdp: 3, industry: 1, resources: 2, budget: 2, army: 3, navy: 1, airforce: 1, stability: 25, morale: 30, population: 4, government: 'British Colony' }),
  nigeria: mkNeutral('Nigeria', 'africa', 5, { gdp: 4, industry: 1, resources: 5, budget: 2, army: 5, navy: 1, airforce: 1, stability: 25, morale: 30, population: 35, government: 'British Colony' }),
  ghana: mkNeutral('Ghana', 'africa', 5, { gdp: 3, industry: 1, resources: 3, budget: 2, army: 2, navy: 1, airforce: 1, stability: 30, morale: 35, population: 4, government: 'British Colony (Gold Coast)' }),
  madagascar: mkNeutral('Madagascar', 'africa', 3, { gdp: 3, industry: 1, resources: 2, budget: 2, army: 2, navy: 1, airforce: 1, stability: 30, morale: 30, population: 4, government: 'French Colony' }),
  south_africa: mkAlly('South Africa', 'africa', 5, { gdp: 12, industry: 10, resources: 15, budget: 10, army: 12, navy: 5, airforce: 8, stability: 55, morale: 55, population: 12, government: 'Dominion / Apartheid' }, 'usa'),
  angola: mkNeutral('Angola', 'africa', 8, { gdp: 3, industry: 1, resources: 5, budget: 2, army: 4, navy: 1, airforce: 1, stability: 25, morale: 30, population: 4, government: 'Portuguese Colony' }),
  mozambique: mkNeutral('Mozambique', 'africa', 5, { gdp: 3, industry: 1, resources: 3, budget: 2, army: 3, navy: 1, airforce: 1, stability: 25, morale: 30, population: 6, government: 'Portuguese Colony' }),
  congo_drc: mkNeutral('Congo (DRC)', 'africa', 8, { gdp: 4, industry: 1, resources: 12, budget: 3, army: 3, navy: 1, airforce: 1, stability: 20, morale: 25, population: 12, government: 'Belgian Colony' }),

  // African regional blocs
  west_africa: mkNeutral('West Africa', 'africa', 5, { gdp: 2, industry: 1, resources: 3, budget: 1, army: 3, navy: 1, airforce: 1, stability: 25, morale: 30, population: 20, government: 'Colonies' }),
  central_africa: mkNeutral('Central Africa', 'africa', 5, { gdp: 2, industry: 1, resources: 3, budget: 1, army: 2, navy: 1, airforce: 1, stability: 20, morale: 25, population: 8, government: 'Colonies' }),
  east_africa: mkNeutral('East Africa', 'africa', 5, { gdp: 2, industry: 1, resources: 2, budget: 1, army: 2, navy: 1, airforce: 1, stability: 25, morale: 30, population: 5, government: 'Colonies' }),
  southern_africa: mkNeutral('Southern Africa', 'africa', 5, { gdp: 2, industry: 1, resources: 3, budget: 1, army: 2, navy: 1, airforce: 1, stability: 25, morale: 30, population: 5, government: 'Colonies' }),
  island_nations: mkNeutral('Indian Ocean', 'africa', 3, { gdp: 2, industry: 1, resources: 1, budget: 1, army: 1, navy: 1, airforce: 1, stability: 35, morale: 35, population: 2, government: 'Colonies' }),

  // ===== Oceania =====
  australia: mkAlly('Australia', 'oceania', 5, { gdp: 18, industry: 15, resources: 20, budget: 15, army: 15, navy: 18, airforce: 15, stability: 80, morale: 75, population: 7, government: 'Dominion / Constitutional Monarchy' }, 'usa'),
  new_zealand: mkAlly('New Zealand', 'oceania', 3, { gdp: 8, industry: 6, resources: 6, budget: 6, army: 5, navy: 5, airforce: 4, stability: 80, morale: 75, population: 2, government: 'Dominion / Constitutional Monarchy' }, 'usa'),
  papua_new_guinea: mkNeutral('Papua New Guinea', 'oceania', 3, { gdp: 2, industry: 1, resources: 2, budget: 1, army: 1, navy: 1, airforce: 1, stability: 30, morale: 30, population: 1, government: 'Australian Territory' }),

  // ===== Benelux =====
  benelux: mkAlly('Benelux', 'western_europe', 8, { gdp: 10, industry: 9, resources: 5, budget: 8, army: 8, navy: 5, airforce: 4, stability: 55, morale: 45, population: 10, government: 'Constitutional Monarchies' }, 'usa'),
}
