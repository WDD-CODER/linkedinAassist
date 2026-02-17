import express from 'express'
import { readCandidates, appendCandidate } from './candidates-store.js'
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

app.listen(PORT, () => {
  console.log('Candidates API listening on', PORT)
})
