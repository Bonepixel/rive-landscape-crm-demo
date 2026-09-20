import assert from 'node:assert/strict'
import {
  SAMPLE_JOBS,
  applyPrimary,
  homeLens,
  intakeDefaults,
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
assert.equal(intakeDefaults('foreman').kind, 'service')
assert.equal(intakeDefaults('worker').timing, 'schedule')
assert.equal(intakeDefaults('scheduling').timing, 'later')

const salesHome = jobsForLens(SAMPLE_JOBS, 'sales', 'home')
assert.ok(salesHome.every((job) => job.kind === 'estimate'))
assert.ok(salesHome.some((job) => job.id === 'maya'))

let maya = SAMPLE_JOBS.find((job) => job.id === 'maya')
maya = applyPrimary(maya, 'sales').job
assert.equal(maya.step, 'awaiting')
maya = applyPrimary(maya, 'sales').job
assert.equal(maya.step, 'ready')
assert.equal(maya.signed, true)
maya = applyPrimary(maya, 'scheduling').job
assert.equal(maya.step, 'start')
assert.equal(maya.crew, 'Luis + Ana')
maya = applyPrimary(maya, 'foreman').job
assert.equal(maya.step, 'progress')
maya = applyPrimary(maya, 'worker').job
assert.equal(maya.step, 'workDone')
maya = applyPrimary(maya, 'owner').job
assert.equal(maya.step, 'complete')

const ownerMore = visibleMoreNav('owner').map((item) => item.route)
assert.ok(ownerMore.includes('invoices'))
assert.ok(ownerMore.includes('settings'))
assert.ok(!visibleMoreNav('worker').some((item) => item.route === 'settings'))

console.log('workflow + role×lens + More gating ok')
