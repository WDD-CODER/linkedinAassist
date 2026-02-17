import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const STATS_PATH = join(__dirname, '..', '..', 'data', 'stats.json')
export const GOVERNOR_LIMIT = 10
const LIMIT = GOVERNOR_LIMIT
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export interface GovernorStats {
  action_count_: number
  last_reset_timestamp_: number
}

export class AutomationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AutomationError'
  }
}

async function ensureDataDir(): Promise<void> {
  const dataDir = join(__dirname, '..', '..', 'data')
  await mkdir(dataDir, { recursive: true })
}

async function readStats(): Promise<GovernorStats> {
  await ensureDataDir()
  try {
    const raw = await readFile(STATS_PATH, 'utf-8')
    const data = JSON.parse(raw) as GovernorStats
    if (typeof data.action_count_ !== 'number' || typeof data.last_reset_timestamp_ !== 'number') {
      return { action_count_: 0, last_reset_timestamp_: Date.now() }
    }
    return data
  } catch {
    return { action_count_: 0, last_reset_timestamp_: Date.now() }
  }
}

async function writeStats(stats: GovernorStats): Promise<void> {
  await ensureDataDir()
  await writeFile(STATS_PATH, JSON.stringify(stats, null, 2), 'utf-8')
}

async function getState(): Promise<{ count: number; permitted: boolean }> {
  const now = Date.now()
  let stats = await readStats()
  if (now - stats.last_reset_timestamp_ >= TWENTY_FOUR_HOURS_MS) {
    stats = { action_count_: 0, last_reset_timestamp_: now }
    await writeStats(stats)
  }
  return { count: stats.action_count_, permitted: stats.action_count_ < LIMIT }
}

/**
 * Check only; does not consume a slot.
 */
export async function canPerformAction(): Promise<boolean> {
  const { permitted } = await getState()
  return permitted
}

/**
 * Consume one action slot. Call after a successful action (e.g. scrape, draft).
 */
export async function recordAction(): Promise<void> {
  const now = Date.now()
  let stats = await readStats()
  if (now - stats.last_reset_timestamp_ >= TWENTY_FOUR_HOURS_MS) {
    stats = { action_count_: 0, last_reset_timestamp_: now }
  }
  stats.action_count_ += 1
  await writeStats(stats)
}

/**
 * Get current stats for API (actionCount, remaining, lastReset).
 */
export async function getStats(): Promise<{ actionCount: number; remaining: number; lastReset: string }> {
  const state = await getState()
  return {
    actionCount: state.count,
    remaining: Math.max(0, LIMIT - state.count),
    lastReset: new Date((await readStats()).last_reset_timestamp_).toISOString()
  }
}

/**
 * Check and, if permitted, consume one slot. Returns result and current count.
 */
export async function requestAction(): Promise<{ permitted: boolean; count: number }> {
  const state = await getState()
  if (!state.permitted) {
    return { permitted: false, count: state.count }
  }
  await recordAction()
  const next = await readStats()
  return { permitted: true, count: next.action_count_ }
}
