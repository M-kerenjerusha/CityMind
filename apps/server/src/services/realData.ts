import { RealDataPayload, Zone, ZoneId } from '@citymind/shared';
import fallbackData from '../data/fallbackRealData.json';
import defaultCity from '../data/city.json';
import { getDatabase } from '../db/database';
import { clamp } from '../engine/scores';

export async function fetchCityRealData(queryCity: string): Promise<RealDataPayload> {
  const normalizedQuery = queryCity.trim().toLowerCase();
  const db = getDatabase();

  // 1. Check SQLite Cache first
  try {
    const cachedRow = db
      .prepare('SELECT data_json, cached_at FROM real_data_cache WHERE city_query = ?')
      .get(normalizedQuery) as { data_json: string; cached_at: string } | undefined;

    if (cachedRow) {
      const data = JSON.parse(cachedRow.data_json) as RealDataPayload;
      return {
        ...data,
        source: `${data.source} (SQLite Cached)`,
      };
    }
  } catch (err) {
    console.warn('Cache lookup error:', err);
  }

  // 2. Attempt Live Open-Meteo API fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        queryCity
      )}&count=1&language=en&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (geoRes.ok) {
      const geoData: any = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const lat = place.latitude;
        const lon = place.longitude;
        const resolvedName = `${place.name}${place.country ? ', ' + place.country : ''}`;

        // Fetch Air Quality & Forecast in parallel
        const [aqRes, forecastRes] = await Promise.all([
          fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10`
          ).catch(() => null),
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
          ).catch(() => null),
        ]);

        let aqi = 40;
        let pm25 = 12.0;
        let pm10 = 20.0;
        let tempC = 20.0;

        if (aqRes && aqRes.ok) {
          const aqJson: any = await aqRes.json();
          if (aqJson.current) {
            aqi = aqJson.current.european_aqi ?? 40;
            pm25 = aqJson.current.pm2_5 ?? 12.0;
            pm10 = aqJson.current.pm10 ?? 20.0;
          }
        }

        if (forecastRes && forecastRes.ok) {
          const fcJson: any = await forecastRes.json();
          if (fcJson.current) {
            tempC = fcJson.current.temperature_2m ?? 20.0;
          }
        }

        const realPayload = constructPayload(
          resolvedName,
          lat,
          lon,
          tempC,
          aqi,
          pm25,
          pm10,
          'Live Open-Meteo Air Quality & ECMWF Meteorological API'
        );

        // Store in cache
        try {
          db.prepare(
            'INSERT OR REPLACE INTO real_data_cache (city_query, data_json, cached_at) VALUES (?, ?, ?)'
          ).run(normalizedQuery, JSON.stringify(realPayload), new Date().toISOString());
        } catch (e) {
          console.warn('Failed to cache real data:', e);
        }

        return realPayload;
      }
    }
  } catch (networkError) {
    console.warn('Open-Meteo live fetch failed/timed out, using offline fallback:', networkError);
  }

  // 3. Fallback to bundled offline city data
  const fallbackCities = (fallbackData as any).cities;
  const matched =
    fallbackCities[normalizedQuery] ||
    fallbackCities[queryCity.toLowerCase()] ||
    fallbackCities.default;

  const fallbackPayload = constructPayload(
    matched.cityName,
    matched.latitude,
    matched.longitude,
    matched.temperatureC,
    matched.aqi,
    matched.pm25,
    matched.pm10,
    `${matched.source} (Offline Fallback)`
  );

  return fallbackPayload;
}

/**
 * Builds zone data scaled according to real AQI and temperature metrics.
 *
 * MAPPING FORMULAS:
 * - AQI scaling:
 *   aqiRatio = clamp(aqi / 45, 0.6, 1.8)
 *   Emissions are adjusted proportionally across Industrial, Residential, Downtown, and Outskirts.
 * - Temperature Heat Risk:
 *   Excess cooling strain = max(0, round((tempC - 20) * 1.2))
 *   Added to Industrial and Downtown energy load.
 */
function constructPayload(
  cityName: string,
  lat: number,
  lon: number,
  tempC: number,
  aqi: number,
  pm25: number,
  pm10: number,
  source: string
): RealDataPayload {
  const aqiRatio = clamp(aqi / 45, 0.6, 1.8);
  const heatStrain = Math.max(0, Math.round((tempC - 20) * 1.2));

  const baseZones = JSON.parse(JSON.stringify(defaultCity.zones)) as Record<ZoneId, Zone>;

  baseZones.industrial.emissions = clamp(Math.round(85 * aqiRatio));
  baseZones.residential.emissions = clamp(Math.round(40 * aqiRatio));
  baseZones.downtown.emissions = clamp(Math.round(70 * aqiRatio));
  baseZones.outskirts.emissions = clamp(Math.round(25 * aqiRatio));

  baseZones.industrial.energy_load = clamp(baseZones.industrial.energy_load + heatStrain);
  baseZones.downtown.energy_load = clamp(baseZones.downtown.energy_load + heatStrain);

  let weatherCondition = 'Mild';
  if (tempC > 30) weatherCondition = 'Scorching Heat';
  else if (tempC > 24) weatherCondition = 'Warm & Sunny';
  else if (tempC < 10) weatherCondition = 'Chilly';

  return {
    cityName,
    latitude: lat,
    longitude: lon,
    temperatureC: tempC,
    aqi,
    pm25,
    pm10,
    weatherCondition,
    source,
    timestamp: new Date().toISOString(),
    zones: baseZones,
  };
}
