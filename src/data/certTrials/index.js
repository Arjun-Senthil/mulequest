import l1 from './l1.json'
import l2 from './l2.json'
import mcia from './mcia.json'

export const CERT_TRIAL_BANKS = {
  'MCD-L1': l1,
  'MCD-L2': l2,
  'MCIA': mcia
}

// Deterministic-ish shuffle per attempt; draws `count` questions from the bank.
export function drawTrialQuestions(certId, count) {
  const bank = CERT_TRIAL_BANKS[certId]?.questions || []
  const shuffled = [...bank]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
