// MuleQuest adaptive engine — Vercel serverless function.
// POST { trigger, chapterId, failedQuestionIds, weakTags, performance[], profile }
// → { diagnosis, weak_tags, difficulty_adjustment, recommended_action, injected_quests[] }

import { callClaude, extractJson } from '../_lib/claude.js'

const SYSTEM_PROMPT = `You are the adaptive learning engine inside MuleQuest, a gamified MuleSoft training platform that takes developers from zero to MCIA certification. The learner is an experienced integration developer — speak to a practitioner, not a beginner. Be direct and specific; never pad or pacify.

You receive a learner's performance history and a trigger event. Respond ONLY with a JSON object, no prose outside it:

{
  "diagnosis": "2-4 sentence plain-English weakness summary. Name the exact MuleSoft concepts, not vague areas. If performance is strong, say so and point at the next stretch goal.",
  "weak_tags": ["specific", "concept", "tags"],
  "difficulty_adjustment": "lower" | "none" | "raise",
  "recommended_action": "One concrete next step.",
  "injected_quests": [
    {
      "quest_id": "MQ-<short-unique>",
      "title": "Short imperative title",
      "description": "A concrete remedial task doable in 20-40 min in Anypoint Studio / Code Builder. Must target the diagnosed weakness with a real build or write exercise, not re-reading.",
      "xp": 60,
      "type": "micro"
    }
  ]
}

Rules:
- inject 0 quests when performance is fine; 1-2 when weakness is detected; never more than 2.
- weak_tags must come from or refine the supplied tags/failed question evidence.
- "raise" difficulty only when recent scores are consistently >90% with low time_spent.
- Diagnosis must reference actual evidence (scores, attempts, repeated failed concepts).`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { trigger, chapterId, failedQuestionIds = [], weakTags = [], performance = [], profile = {} } = req.body || {}

    const userMsg = JSON.stringify({
      trigger,
      current_chapter: chapterId,
      failed_question_ids: failedQuestionIds,
      candidate_weak_tags: weakTags,
      profile_summary: profile,
      recent_performance: performance.slice(0, 40)
    })

    const text = await callClaude({
      system: SYSTEM_PROMPT,
      user: `Trigger event and learner telemetry:\n${userMsg}`,
      maxTokens: 1200
    })

    const parsed = extractJson(text)

    // Contract hardening — never let a malformed model response break the client.
    const out = {
      diagnosis: String(parsed.diagnosis || 'Analysis complete.'),
      weak_tags: Array.isArray(parsed.weak_tags) ? parsed.weak_tags.slice(0, 8).map(String) : [],
      difficulty_adjustment: ['lower', 'none', 'raise'].includes(parsed.difficulty_adjustment)
        ? parsed.difficulty_adjustment : 'none',
      recommended_action: String(parsed.recommended_action || ''),
      injected_quests: (Array.isArray(parsed.injected_quests) ? parsed.injected_quests : [])
        .slice(0, 2)
        .map((q, i) => ({
          quest_id: String(q.quest_id || `MQ-${Date.now()}-${i}`),
          title: String(q.title || 'Remedial drill'),
          description: String(q.description || ''),
          xp: Number(q.xp) || 60,
          type: 'micro'
        })),
      source: 'claude'
    }

    return res.status(200).json(out)
  } catch (err) {
    console.error('diagnose error:', err)
    return res.status(500).json({ error: 'AI diagnosis failed', detail: String(err.message || err) })
  }
}
