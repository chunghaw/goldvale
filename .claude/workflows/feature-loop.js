export const meta = {
  name: 'feature-loop',
  description: 'Build a Oscar feature, then run adversarial Codex review and auto-fix until clean (tsc + vitest green, non-clinical guardrails intact).',
  whenToUse: 'Implementing any Oscar feature with builder -> reviewer -> fix running autonomously.',
  phases: [{ title: 'Build' }, { title: 'Review' }, { title: 'Fix' }],
}

const feature = typeof args === 'string' ? args : (args && args.feature) || 'Unspecified feature — read CLAUDE.md.'
const MAX_ROUNDS = (args && args.maxRounds) || 3

const REVIEW_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    approved: { type: 'boolean' },
    blocking: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { file: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['issue', 'fix'] } },
    nits: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['approved', 'blocking', 'summary'],
}

phase('Build')
log(`Building: ${feature}`)
let build = await agent(
  `Implement this Oscar feature end-to-end with Vitest tests, following CLAUDE.md (NON-CLINICAL cardinal rule; pure core in lib/domain; Aurora via Drizzle; narrateSafe for any LLM copy). Run \`npx tsc --noEmit\` and \`npm run test\`; fix until green. Commit locally (do not push).\n\n${feature}`,
  { label: 'build', phase: 'Build', agentType: 'builder' }
)

let round = 0
let lastReview = null
while (round < MAX_ROUNDS) {
  round++
  phase('Review')
  const review = await agent(
    `Adversarially review the current git diff for: "${feature}". Builder summary:\n${build}\n\nUse scripts/codex-review.ps1 if Codex is installed; else review directly. Prioritize NON-CLINICAL violations (always blocking). Re-run tsc + vitest. Return the structured verdict.`,
    { label: `review-r${round}`, phase: 'Review', agentType: 'reviewer-codex', schema: REVIEW_SCHEMA }
  )
  lastReview = review
  if (!review || review.approved) { log(`Review round ${round}: APPROVED`); break }
  log(`Review round ${round}: ${review.blocking.length} blocking — fixing`)
  phase('Fix')
  build = await agent(
    `Fix ONLY these blocking findings, then re-run tsc + vitest and re-commit locally:\n${JSON.stringify(review.blocking, null, 2)}`,
    { label: `fix-r${round}`, phase: 'Fix', agentType: 'builder' }
  )
}

return { feature, rounds: round, approved: !!(lastReview && lastReview.approved), finalReview: lastReview }
