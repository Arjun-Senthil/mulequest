import ch01 from './ch01.json'
import ch02 from './ch02.json'
import ch03 from './ch03.json'
import ch04 from './ch04.json'
import ch05 from './ch05.json'
import ch06 from './ch06.json'
import ch07 from './ch07.json'
import ch08 from './ch08.json'
import ch09 from './ch09.json'
import ch10 from './ch10.json'
import ch11 from './ch11.json'
import ch12 from './ch12.json'
import ch13 from './ch13.json'

export const KNOWLEDGE = {
  1: ch01, 2: ch02, 3: ch03, 4: ch04, 5: ch05, 6: ch06, 7: ch07,
  8: ch08, 9: ch09, 10: ch10, 11: ch11, 12: ch12, 13: ch13
}

export function getChapterContent(chapterId) {
  return KNOWLEDGE[chapterId]
}

export function getConcept(conceptId) {
  for (const ch of Object.values(KNOWLEDGE)) {
    const found = ch.concepts.find((c) => c.concept_id === conceptId)
    if (found) return { ...found, chapter: ch.chapter }
  }
  return null
}

export function allConcepts() {
  return Object.values(KNOWLEDGE).flatMap((ch) =>
    ch.concepts.map((c) => ({ ...c, chapter: ch.chapter }))
  )
}
