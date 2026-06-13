// Frontend → serverless API bridge. The Claude key never touches the browser.

export async function requestDiagnosis(payload) {
  const res = await fetch('/api/ai/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI diagnose failed (${res.status}): ${text}`)
  }
  return res.json()
}

// Local heuristic fallback when the serverless function is unreachable
// (offline dev / demo mode). Mirrors the AI output contract.
export function heuristicDiagnosis({ trigger, performance, chapterId, weakTags }) {
  const tags = weakTags?.length ? weakTags : ['fundamentals']
  const recentFails = (performance || []).filter((p) => (p.score ?? 1) < 0.7)
  const diagnosis =
    recentFails.length === 0
      ? 'Performance is solid. No structural weaknesses detected in recent activity. Keep the streak alive and push into the next main quest.'
      : `Detected repeated misses around: ${tags.join(', ')}. Pattern suggests gaps in applied understanding rather than recall — prioritize the hands-on tasks over re-reading cards.`
  return {
    diagnosis,
    weak_tags: tags,
    difficulty_adjustment: recentFails.length >= 3 ? 'lower' : 'none',
    recommended_action:
      recentFails.length === 0
        ? 'Advance to the next main quest.'
        : 'Complete the injected micro quest before reattempting.',
    injected_quests: recentFails.length
      ? [{
          quest_id: `MQ-${chapterId || 0}-${Date.now() % 10000}`,
          title: `Remedial drill: ${tags[0]}`,
          description: `Rebuild the failed concept from scratch: implement the hands-on task for "${tags[0]}" without referring to the card, then re-take the quiz.`,
          xp: 60,
          type: 'micro'
        }]
      : [],
    source: 'heuristic'
  }
}
