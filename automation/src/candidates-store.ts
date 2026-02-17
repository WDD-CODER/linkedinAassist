import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Candidate } from './types.js'
import { makeId } from './util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CANDIDATES_PATH = join(__dirname, '..', '..', 'data', 'candidates.json')

async function ensureDataDir(): Promise<void> {
  const dataDir = join(__dirname, '..', '..', 'data')
  await mkdir(dataDir, { recursive: true })
}

export async function readCandidates(): Promise<Candidate[]> {
  await ensureDataDir()
  try {
    const raw = await readFile(CANDIDATES_PATH, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function appendCandidate(candidate: Omit<Candidate, '_id' | 'createdAt'>): Promise<Candidate> {
  const list = await readCandidates()
  const full: Candidate = {
    ...candidate,
    _id: makeId(),
    createdAt: new Date().toISOString()
  }
  list.push(full)
  await ensureDataDir()
  await writeFile(CANDIDATES_PATH, JSON.stringify(list, null, 2), 'utf-8')
  return full
}

export async function writeCandidates(candidates: Candidate[]): Promise<void> {
  await ensureDataDir()
  await writeFile(CANDIDATES_PATH, JSON.stringify(candidates, null, 2), 'utf-8')
}

export async function updateCandidate(
  id: string,
  partial: Partial<Pick<Candidate, 'draftMessage' | 'status'>>
): Promise<Candidate | null> {
  const list = await readCandidates()
  const idx = list.findIndex((c) => c._id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...partial }
  await writeCandidates(list)
  return list[idx]
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  const list = await readCandidates()
  return list.find((c) => c._id === id) ?? null
}
