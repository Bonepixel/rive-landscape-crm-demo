import assert from 'node:assert/strict'
import {
  SAMPLE_JOBS,
  applyPrimary,
  createLanes,
  featuredJob,
  homeLens,
  intakeDefaults,
  jobCta,
  jobsForLens,
  visibleMoreNav,
} from '../src/odinops.ts'

const lenses = {
  owner: 'pulse',
  admin: 'pulse',
  scheduling: 'schedule',
  sales: 'sales',
  foreman: 'crew',
  worker: 'stops',
}
for (const [role, lens] of Object.entries(lenses)) {
  assert.equal(homeLens(role), lens, `${role} lens`)
}

assert.equal(intakeDefaults('sales').kind, 'estimate')
assert.equal(intakeDefaults('scheduling').kind, 'service')
assert.equal(jobCta(SAMPLE_JOBS.find((job) => job.id === 'maya'), 'sales').primary, 'Send estimate')
assert.equal(jobCta(SAMPLE_JOBS.find((job) => job.id === 'hale'), 'sales').primary, 'Own lead')
assert.equal(jobCta(SAMPLE_JOBS.find((job) => job.id === 'rivera'), 'sales').primary, 'Deposit paid')
assert.equal(jobCta(SAMPLE_JOBS.find((job) => job.id === 'patel'), 'scheduling').primary, 'Schedule')
assert.equal(jobCta(SAMPLE_JOBS.find((job) => job.id === 'june'), 'foreman').primary, 'Start')
assert.equal(jobCta(SAMPLE_JOBS.find((job) => job.id === 'west'), 'worker').primary, 'Complete')
assert.equal(jobCta(SAMPLE_JOBS.find((job) => job.id === 'june'), 'sales').disabled, true)

const salesLanes = createLanes('sales')
assert.ok(salesLanes.primary.some((lane) => lane.id === 'estimate'))
assert.ok(salesLanes.primary.some((lane) => lane.id === 'lead'))
assert.ok(!createLanes('worker').primary.some((lane) => lane.id === 'estimate'))
assert.ok(createLanes('worker').also.some((lane) => lane.id === 'jobs'))

const featured = featuredJob(SAMPLE_JOBS, 'sales', 'sales')
assert.equal(featured.id, 'maya')

const salesHome = jobsForLens(SAMPLE_JOBS, 'sales', 'home')
assert.ok(salesHome.every((job) => job.kind === 'estimate'))

let maya = SAMPLE_JOBS.find((job) => job.id === 'maya')
maya = applyPrimary(maya, 'sales').job
assert.equal(maya.step, 'awaiting')
maya = applyPrimary(maya, 'sales').job
assert.equal(maya.step, 'ready')
maya = applyPrimary(maya, 'scheduling').job
assert.equal(maya.step, 'start')
maya = applyPrimary(maya, 'foreman').job
assert.equal(maya.step, 'progress')
maya = applyPrimary(maya, 'worker').job
assert.equal(maya.step, 'workDone')
maya = applyPrimary(maya, 'owner').job
assert.equal(maya.step, 'complete')

assert.ok(visibleMoreNav('owner').some((item) => item.route === 'settings'))
assert.ok(!visibleMoreNav('worker').some((item) => item.route === 'settings'))

console.log('workflow + short CTAs + create lanes ok')
