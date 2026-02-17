import { readFile } from 'fs/promises'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..', '..')

let cachedCv: string | null | undefined = undefined

/**
 * Loads CV/resume content from CV_PATH (env).
 * Supports .txt (read directly) and .pdf (extract via pdf-parse).
 * Returns null if not configured or load fails.
 */
export async function loadCvContent(): Promise<string | null> {
  if (cachedCv !== undefined) {
    return cachedCv
  }
  const pathArg = process.env.CV_PATH
  if (!pathArg || !pathArg.trim()) {
    cachedCv = null
    return null
  }
  const resolvedPath = pathArg.startsWith('/') || /^[A-Za-z]:/.test(pathArg)
    ? pathArg
    : resolve(PROJECT_ROOT, pathArg)
  try {
    if (resolvedPath.toLowerCase().endsWith('.pdf')) {
      const { createRequire } = await import('module')
      const require = createRequire(import.meta.url)
      const pdfParse = require('pdf-parse')
      const buffer = await readFile(resolvedPath)
      const data = await pdfParse(buffer)
      cachedCv = typeof data === 'object' && data?.text ? String(data.text).trim() : ''
    } else {
      const raw = await readFile(resolvedPath, 'utf-8')
      cachedCv = raw.trim()
    }
  } catch (err) {
    console.warn('[cv-loader] Failed to load CV from', resolvedPath, err)
    cachedCv = null
  }
  return cachedCv
}
