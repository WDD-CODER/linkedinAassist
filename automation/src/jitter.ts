/**
 * Human-like delay: 1000–3000 ms (per automation-stealth SKILL).
 */
export function jitterDelay_(): Promise<void> {
  const delayMs = Math.floor(Math.random() * 2000) + 1000
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}
