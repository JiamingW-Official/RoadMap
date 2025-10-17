#!/usr/bin/env node
/**
 * Batch geocode firms using OpenStreetMap Nominatim.
 *
 * Usage:
 *   node scripts/update-positions-nominatim.js [--force]
 *
 * - Reads nyc_firms.csv / nyc_firms.json from project root.
 * - Populates missing lat/lng (or all when --force) via Nominatim.
 * - Writes updated data back to root and public/datasets copies.
 *
 * Respect OSM usage policy: 1 request per second.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'

const ROOT = process.cwd()
const CSV_PATH = path.join(ROOT, 'nyc_firms.csv')
const JSON_PATH = path.join(ROOT, 'nyc_firms.json')
const PUBLIC_DATASET_DIR = path.join(ROOT, 'public', 'datasets')
const RATE_DELAY_MS = 1200
const GEOCODE_ENDPOINT = process.env.GEOCODE_ENDPOINT ?? 'https://photon.komoot.io/api/'
const FORCE = process.argv.includes('--force')
const USER_AGENT = process.env.NOMINATIM_USER_AGENT ?? process.env.GEOCODE_USER_AGENT ?? 'RoadMapGeocoder/1.0 (+https://github.com/jiamingw/RoadMap)'
const NYC_BOUNDS = { minLat: 40.40, maxLat: 41.10, minLng: -74.40, maxLng: -73.50 }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function loadCsv(filePath) {
  const text = await fs.readFile(filePath, 'utf8')
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
  if (parsed.errors.length) {
    throw new Error(`Failed to parse CSV: ${parsed.errors[0].message}`)
  }
  return parsed.data
}

async function saveCsv(filePath, rows) {
  const csv = Papa.unparse(rows)
  await fs.writeFile(filePath, csv, 'utf8')
}

async function loadJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8')
  return JSON.parse(text)
}

async function saveJson(filePath, data) {
  const json = JSON.stringify(data, null, 2)
  await fs.writeFile(filePath, `${json}\n`, 'utf8')
}

function needsUpdate(row) {
  if (FORCE) return true
  if (!row) return false
  const lat = Number(row.lat ?? row.latitude)
  const lng = Number(row.lng ?? row.lon ?? row.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true
  return false
}

function needsUpdateJson(entry) {
  if (FORCE) return true
  if (!entry?.position || entry.position.length !== 2) return true
  const [lat, lng] = entry.position.map(Number)
  return !(Number.isFinite(lat) && Number.isFinite(lng))
}

function normalizeStreet(address) {
  if (!address) return ''
  let normalized = address.trim()
  normalized = normalized.replace(/\s+/g, ' ')
  normalized = normalized.replace(/,\s*(?:\d+(?:st|nd|rd|th)?\s+)?(?:floor|fl\.?|suite|ste\.?|unit|level|room|rm\.?|office)\b[^,]*/gi, '')
  normalized = normalized.replace(/\s*\(.*?\)/g, '')
  normalized = normalized.replace(/\s*,\s*,/g, ',')
  normalized = normalized.replace(/,\s*$/, '')
  return normalized.trim()
}

function buildAddressVariants(row) {
  const variants = new Set()
  const roads = new Set()
  const streetAddress = normalizeStreet(row.hq_address ?? row.Address ?? '')
  const city = (row.city ?? row.City ?? '').trim()
  const state = (row.state ?? row.State ?? '').trim()

  const baseAddress = [streetAddress, city, state].filter(Boolean).join(', ')
  if (baseAddress) variants.add(baseAddress)

  const baseRoad = streetAddress.replace(/^\d+\s*/, '').split(',')[0]?.trim().toLowerCase()
  if (baseRoad) roads.add(baseRoad)

  const replacements = [
    [/Avenue of the Americas/gi, '6th Avenue'],
    [/Sixth Avenue/gi, '6th Avenue'],
    [/Seventh Avenue/gi, '7th Avenue'],
    [/Seventh Ave/gi, '7th Ave'],
    [/Fifth Avenue/gi, '5th Avenue'],
    [/Fifth Ave/gi, '5th Ave'],
    [/Madison Avenue/gi, 'Madison Ave'],
  ]

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(streetAddress)) {
      const altStreet = streetAddress.replace(pattern, replacement)
      variants.add([altStreet, city, state].filter(Boolean).join(', '))
      variants.add([altStreet, city, state, 'USA'].filter(Boolean).join(', '))
      const altRoad = altStreet.replace(/^\d+\s*/, '').split(',')[0]?.trim().toLowerCase()
      if (altRoad) roads.add(altRoad)
    }
  }

  if (streetAddress) {
    const noNumber = streetAddress.replace(/^\d+\s*/, '')
    variants.add([noNumber, city, state].filter(Boolean).join(', '))
    const altRoad = noNumber.split(',')[0]?.trim().toLowerCase()
    if (altRoad) roads.add(altRoad)
  }

  if (row.firm_name) {
    variants.add([row.firm_name, city || 'New York', state || 'NY'].join(', '))
  }

  return {
    variants: Array.from(variants).filter(Boolean),
    roads,
  }
}

async function geocodeVariant(address) {
  const params = new URLSearchParams({
    q: address,
    limit: '1',
    lang: 'en',
  })
  const endpoint = GEOCODE_ENDPOINT.endsWith('/') ? GEOCODE_ENDPOINT.slice(0, -1) : GEOCODE_ENDPOINT
  const url = `${endpoint}?${params.toString()}`
  const headers = {
    'Accept-Language': 'en',
    'User-Agent': USER_AGENT,
  }
  let res
  try {
    res = await fetch(url, { headers })
  } catch (err) {
    console.warn(`Geocode request error (${err?.code ?? err?.message ?? 'unknown'}): ${address}`)
    return null
  }
  if (!res.ok) {
    console.warn(`Geocode request failed (${res.status}): ${address}`)
    return null
  }
  const data = await res.json()
  const hit = data?.features?.[0]
  if (!hit) return null
  const [lng, lat] = hit.geometry?.coordinates ?? []
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng, raw: hit }
}

async function geocode(task) {
  if (!task?.variants?.length) return null
  for (const variant of task.variants) {
    const result = await geocodeVariant(variant)
    if (result) {
      const { raw, lat, lng } = result
      const props = raw?.properties ?? {}
      const cityValues = [props.city, props.district, props.county, props.state, props.locality, props.country]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
      const isInNYC = cityValues.some((v) => v.includes('new york') || v.includes('manhattan'))
      const inBounds = lat >= NYC_BOUNDS.minLat && lat <= NYC_BOUNDS.maxLat && lng >= NYC_BOUNDS.minLng && lng <= NYC_BOUNDS.maxLng
      const streetCandidates = [props.street, props.road, props.name, props.display_name]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
      const matchesRoad = !task.roads.size || streetCandidates.some((candidate) => {
        for (const road of task.roads) {
          if (candidate.includes(road)) return true
        }
        return false
      })
      if (isInNYC && inBounds && matchesRoad) return result
    }
    await sleep(300)
  }
  return null
}

async function ensureDirExists(dir) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

async function main() {
  console.log(`➤ Loading CSV from ${CSV_PATH}`)
  const csvRows = await loadCsv(CSV_PATH)
  console.log(`➤ Loading JSON from ${JSON_PATH}`)
  const jsonData = await loadJson(JSON_PATH)

  const uniqueAddresses = new Map()
  const register = ({ variants, roads }) => {
    if (!variants.length) return
    const key = variants[0]
    if (!uniqueAddresses.has(key)) uniqueAddresses.set(key, { variants, roads })
  }

  for (const row of csvRows) {
    if (!needsUpdate(row)) continue
    const task = buildAddressVariants(row)
    register(task)
  }

  for (const entry of jsonData) {
    if (!needsUpdateJson(entry)) continue
    const task = buildAddressVariants(entry)
    register(task)
  }

  console.log(`➤ Geocoding ${uniqueAddresses.size} unique addresses${FORCE ? ' (force mode)' : ''}`)
  let processed = 0

  const results = new Map()

  for (const [key, task] of uniqueAddresses.entries()) {
    processed += 1
    console.log(`   [${processed}/${uniqueAddresses.size}] ${key}`)
    const result = await geocode(task)
    if (!result) {
      console.warn(`     ↳ No result for: ${key}`)
    }
    results.set(key, result)
    await sleep(RATE_DELAY_MS)
  }

  for (const row of csvRows) {
    const task = buildAddressVariants(row)
    if (!task.variants.length) continue
    const data = results.get(task.variants[0])
    if (!data) continue
    row.lat = data.lat
    row.lng = data.lng
  }

  for (const entry of jsonData) {
    const task = buildAddressVariants(entry)
    if (!task.variants.length) continue
    const data = results.get(task.variants[0])
    if (!data) continue
    entry.position = [data.lat, data.lng]
  }

  console.log('➤ Writing updated datasets')
  await saveCsv(CSV_PATH, csvRows)
  await saveJson(JSON_PATH, jsonData)

  await ensureDirExists(PUBLIC_DATASET_DIR)
  await saveCsv(path.join(PUBLIC_DATASET_DIR, 'nyc_firms.csv'), csvRows)
  await saveJson(path.join(PUBLIC_DATASET_DIR, 'nyc_firms.json'), jsonData)

  console.log('✓ Finished geocoding')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
