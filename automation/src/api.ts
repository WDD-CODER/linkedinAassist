import './load-env.js'
import express from 'express'
import {
  readCandidates,
  appendCandidate,
  updateCandidate,
  getCandidateById
} from './candidates-store.js'
import { runSync } from './run-sync.js'
import { getStats, canPerformAction } from './daily-governor.js'
import { sendConnectionRequest } from './send-connection.js'
import type { Candidate } from './types.js'

const app = express()
const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3750

app.use(express.json())

app.get('/api/candidates', async (_req, res) => {
  try {
    const candidates = await readCandidates()
    res.json(candidates)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to read candidates' })
  }
})

app.get('/api/stats', async (_req, res) => {
  try {
    const stats = await getStats()
    res.json(stats)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to read stats' })
  }
})

app.patch('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body as { draftMessage?: string; status?: Candidate['status'] }
    const updated = await updateCandidate(id, {
      ...(body.draftMessage !== undefined && { draftMessage: body.draftMessage }),
      ...(body.status !== undefined && { status: body.status })
    })
    if (!updated) {
      res.status(404).json({ error: 'Candidate not found' })
      return
    }
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update candidate' })
  }
})

app.post('/api/candidates', async (req, res) => {
  try {
    const body = req.body as Omit<Candidate, '_id' | 'createdAt'>
    if (!body.scrapedProfile || typeof body.draftMessage !== 'string') {
      res.status(400).json({ error: 'scrapedProfile and draftMessage required' })
      return
    }
    const candidate = await appendCandidate({
      scrapedProfile: body.scrapedProfile,
      draftMessage: body.draftMessage,
      status: body.status || 'draft',
      userId: body.userId
    })
    res.status(201).json(candidate)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to append candidate' })
  }
})

app.post('/api/candidates/:id/send', async (req, res) => {
  try {
    const { id } = req.params
    const candidate = await getCandidateById(id)
    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' })
      return
    }
    if (candidate.status !== 'approved') {
      res.status(400).json({ error: 'Candidate must be approved first' })
      return
    }
    const permitted = await canPerformAction()
    if (!permitted) {
      res.status(429).json({ error: 'Daily limit reached' })
      return
    }
    await sendConnectionRequest(candidate)
    const updated = await updateCandidate(id, { status: 'sent' })
    res.json(updated)
  } catch (err) {
    console.error(err)
    const msg = err instanceof Error ? err.message : 'Send failed'
    res.status(500).json({ error: msg })
  }
})

app.listen(PORT, () => {
  console.log('Candidates API listening on', PORT)
  runSync().catch((err) => console.error('[sync]', err))
})
