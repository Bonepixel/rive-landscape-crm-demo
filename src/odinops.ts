export const STAFF_ROLES = ['owner', 'admin', 'scheduling', 'sales', 'foreman', 'worker'] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

export const ROLE_LABEL: Record<StaffRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  scheduling: 'Office',
  sales: 'Sales lead',
  foreman: 'Foreman',
  worker: 'Worker',
}

export const ORG = 'Acme'

export type HomeLens = 'pulse' | 'schedule' | 'sales' | 'crew' | 'stops'

export function homeLens(role: StaffRole): HomeLens {
  if (role === 'sales') return 'sales'
  if (role === 'scheduling') return 'schedule'
  if (role === 'foreman') return 'crew'
  if (role === 'worker') return 'stops'
  return 'pulse'
}

export function isOwnerLike(role: StaffRole) {
  return role === 'owner' || role === 'admin'
}

export function isCrewRole(role: StaffRole) {
  return role === 'foreman' || role === 'worker'
}

export type IntakeTiming = 'write' | 'schedule' | 'later'

export function intakeDefaults(role: StaffRole): { kind: Extract<Kind, 'estimate' | 'service'>; timing: IntakeTiming } {
  if (role === 'scheduling') return { kind: 'service', timing: 'later' }
  if (isCrewRole(role)) return { kind: 'service', timing: 'schedule' }
  return { kind: 'estimate', timing: 'write' }
}

export type Seat = { id: string; name: string; role: StaffRole; email: string }

export const SEATS: Seat[] = [
  { id: 'avery', name: 'Avery Chen', role: 'owner', email: 'avery@acme.demo' },
  { id: 'blake', name: 'Blake Ortiz', role: 'admin', email: 'blake@acme.demo' },
  { id: 'casey', name: 'Casey Nguyen', role: 'scheduling', email: 'casey@acme.demo' },
  { id: 'drew', name: 'Drew Patel', role: 'sales', email: 'drew@acme.demo' },
  { id: 'ellis', name: 'Ellis Ward', role: 'foreman', email: 'ellis@acme.demo' },
  { id: 'finley', name: 'Finley Brooks', role: 'worker', email: 'finley@acme.demo' },
]

export type Tab = 'home' | 'jobs' | 'create' | 'alerts' | 'more'

export const DOCK: { id: Tab; label: string; icon: 'home' | 'jobs' | 'create' | 'alerts' | 'more' }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'jobs', label: 'Jobs', icon: 'jobs' },
  { id: 'create', label: 'Create', icon: 'create' },
  { id: 'alerts', label: 'Alerts', icon: 'alerts' },
  { id: 'more', label: 'More', icon: 'more' },
]

export type Kind = 'estimate' | 'service' | 'inspection'
export type DisplayKind = 'estimate' | 'job' | 'service' | 'inspection'
export type Step =
  | 'request'
  | 'create'
  | 'awaiting'
  | 'ready'
  | 'schedule'
  | 'start'
  | 'progress'
  | 'workDone'
  | 'complete'

export const KIND_FILL = {
  estimate: 0xffd4af37,
  job: 0xff2dd4bf,
  service: 0xfffb923c,
  inspection: 0xffa78bfa,
} as const

export const KIND_HEX: Record<DisplayKind, string> = {
  estimate: '#D4AF37',
  job: '#2DD4BF',
  service: '#FB923C',
  inspection: '#A78BFA',
}

export const STEP_PILL: Record<Step, string> = {
  request: 'Lead',
  create: 'Draft',
  awaiting: 'Awaiting deposit',
  ready: 'Ready',
  schedule: 'Unscheduled',
  start: 'Scheduled',
  progress: 'In progress',
  workDone: 'Done',
  complete: 'Closed',
}

export type Job = {
  id: string
  customerName: string
  title: string
  kind: Kind
  step: Step
  estimate: number
  address: string
  note: string
  crew: string
  day: string
  slot: string
  assignee: string
  signed: boolean
  depositPaid: boolean
}

export type AlertKind = 'assignment' | 'signed' | 'shout' | 'ready' | 'estimate'

export type Alert = {
  id: string
  title: string
  detail: string
  kind: AlertKind
  jobId?: string
  unread: boolean
  time: string
}

export type MoreItem = {
  href: string
  label: string
  hint: string
  group: 'ops' | 'team'
  route: string
  show: (role: StaffRole) => boolean
}

export const MORE_NAV: MoreItem[] = [
  { href: '/invoices', route: 'invoices', label: 'Invoices', hint: 'PDF invoices you can send', group: 'ops', show: (r) => isOwnerLike(r) || r === 'sales' || r === 'scheduling' },
  { href: '/customers', route: 'customers', label: 'Customers', hint: 'Profile, jobs, and reminders', group: 'ops', show: () => true },
  { href: '/catalog', route: 'catalog', label: 'Catalog', hint: 'Products & services · CSV', group: 'ops', show: () => true },
  { href: '/book', route: 'book', label: 'Share self-book', hint: 'Public self-schedule link', group: 'ops', show: (r) => isOwnerLike(r) || r === 'scheduling' || r === 'sales' },
  { href: '/forms', route: 'forms', label: 'Forms', hint: 'Shareable public intake', group: 'ops', show: () => true },
  { href: '/reports', route: 'reports', label: 'Reports', hint: 'Sales, jobs, money · CSV', group: 'ops', show: () => true },
  { href: '/team', route: 'team', label: 'Team', hint: 'Roles & staffing', group: 'team', show: () => true },
  { href: '/crews', route: 'crews', label: 'Crews', hint: 'Crew boards for the field', group: 'team', show: (r) => isOwnerLike(r) || r === 'scheduling' || r === 'foreman' },
  { href: '/sales', route: 'sales', label: 'Sales', hint: 'Sales team notes & photos', group: 'team', show: (r) => isOwnerLike(r) || r === 'sales' },
  { href: '/settings', route: 'settings', label: 'Permissions', hint: 'Brand, signature & roles', group: 'team', show: (r) => isOwnerLike(r) },
]

export function visibleMoreNav(role: StaffRole) {
  return MORE_NAV.filter((item) => item.show(role))
}

export function groupedMoreNav(role: StaffRole) {
  const items = visibleMoreNav(role)
  return [
    { id: 'ops' as const, label: 'Ops', items: items.filter((item) => item.group === 'ops') },
    { id: 'team' as const, label: 'Team', items: items.filter((item) => item.group === 'team') },
  ].filter((group) => group.items.length > 0)
}

export function money(value: number) {
  return `$${value.toLocaleString('en-US')}`
}

export function compactMoney(value: number) {
  const thousands = value / 1000
  return `$${Number.isInteger(thousands) ? `${thousands.toFixed(0)}k` : `${thousands.toFixed(1)}k`}`
}

export function isFieldPhase(job: Job) {
  if (job.kind === 'service' || job.kind === 'inspection') return true
  return job.signed && job.depositPaid
}

export function displayKind(job: Job): DisplayKind {
  if (job.kind === 'inspection') return 'inspection'
  if (job.kind === 'service') return 'service'
  return isFieldPhase(job) ? 'job' : 'estimate'
}

export function kindLabel(job: Job) {
  const kind = displayKind(job)
  if (kind === 'job') return 'Job'
  if (kind === 'service') return 'Service'
  if (kind === 'inspection') return 'Inspection'
  return 'Estimate'
}

export function kindHex(job: Job) {
  return KIND_HEX[displayKind(job)]
}

export function kindArgb(job: Job) {
  return KIND_FILL[displayKind(job)]
}

export function flowLabel(job: Job) {
  return STEP_PILL[job.step]
}

export type JobCta = {
  primary: string
  disabled: boolean
  reason: string
  attention: string
}

export function jobCta(job: Job, role: StaffRole): JobCta {
  if (job.kind === 'estimate' && !isFieldPhase(job)) {
    if (job.step === 'request') {
      return { primary: 'Own lead', disabled: false, reason: '', attention: 'Inbound — own it, then write' }
    }
    if (job.step === 'create') {
      return { primary: 'Send estimate', disabled: false, reason: '', attention: 'Draft is priced — send it' }
    }
    if (job.step === 'awaiting') {
      return { primary: 'Deposit paid', disabled: false, reason: '', attention: 'Waiting on e-sign + deposit' }
    }
  }
  if (job.step === 'ready' || job.step === 'schedule') {
    const allowed = isOwnerLike(role) || role === 'scheduling' || role === 'foreman' || role === 'sales'
    return {
      primary: 'Schedule',
      disabled: !allowed,
      reason: allowed ? '' : 'Office books this job',
      attention: 'Ready — pick a crew and window',
    }
  }
  if (job.step === 'start') {
    const allowed = isOwnerLike(role) || role === 'foreman' || role === 'worker'
    return {
      primary: 'Start',
      disabled: !allowed,
      reason: allowed ? '' : 'Crew starts this stop',
      attention: 'On the book — start when you roll',
    }
  }
  if (job.step === 'progress') {
    return { primary: 'Complete', disabled: false, reason: '', attention: 'On site — finish, then close' }
  }
  if (job.step === 'workDone') {
    return { primary: 'Close', disabled: false, reason: '', attention: 'Done. Unpaid does not block close.' }
  }
  return { primary: 'Closed', disabled: true, reason: 'Already closed', attention: 'Closed' }
}

export const OVERFLOW = ['Reschedule', 'Reassign', 'Note'] as const

export function homeSubtitle(lens: HomeLens) {
  if (lens === 'sales') return 'Leads, estimates to write/send, awaiting deposit.'
  if (lens === 'stops') return 'My jobs today.'
  if (lens === 'schedule') return 'Day board and unscheduled queue.'
  if (lens === 'crew') return 'Crew day / assignments.'
  return 'Agenda + pulse — jobs moving this week.'
}

export function homeTitle(lens: HomeLens) {
  return lens === 'sales' ? 'Sales' : "Today's jobs"
}

export const HOME_DATE_LINE = 'Sun, Sep 20'

export function homeStopCountLabel(count: number) {
  return `${count} ${count === 1 ? 'stop' : 'stops'}`
}

export type CreateLane = {
  id: string
  label: string
  hint: string
  tone: DisplayKind | 'lead' | 'book' | 'neutral'
  section: 'primary' | 'also'
  action: 'lead' | 'estimate' | 'service' | 'inspection' | 'stub'
  route?: string
}

const LANE_TONE_HEX: Record<CreateLane['tone'], string> = {
  lead: '#6B3DFF',
  estimate: '#D4AF37',
  job: '#2DD4BF',
  service: '#FB923C',
  inspection: '#A78BFA',
  book: '#2EEBFA',
  neutral: '#A1A1AA',
}

export function laneHex(tone: CreateLane['tone']) {
  return LANE_TONE_HEX[tone]
}

export function createLanes(role: StaffRole): { primary: CreateLane[]; also: CreateLane[] } {
  const primary: CreateLane[] = []
  if (isOwnerLike(role) || role === 'scheduling' || role === 'sales' || role === 'foreman') {
    primary.push({ id: 'lead', label: 'New lead', hint: 'Inbound request — assign later', tone: 'lead', section: 'primary', action: 'lead' })
  }
  if (isOwnerLike(role) || role === 'sales') {
    primary.push({ id: 'estimate', label: 'New estimate', hint: 'Price → e-sign + deposit → Ready', tone: 'estimate', section: 'primary', action: 'estimate' })
  }
  primary.push({ id: 'service', label: 'New service', hint: 'Fixed-price service or consult', tone: 'service', section: 'primary', action: 'service' })
  primary.push({ id: 'inspection', label: 'New inspection', hint: 'Issue / warranty look · diagnose', tone: 'inspection', section: 'primary', action: 'inspection' })
  if (isOwnerLike(role) || role === 'scheduling' || role === 'sales') {
    primary.push({ id: 'share', label: 'Share self-book', hint: 'Public /b/… · customer books themselves', tone: 'book', section: 'primary', action: 'stub', route: 'book' })
  }

  const also: CreateLane[] = []
  if (isCrewRole(role)) {
    also.push({ id: 'jobs', label: 'Open jobs', hint: "Today's stops and work in progress.", tone: 'neutral', section: 'also', action: 'stub', route: 'jobs' })
  }
  if (isOwnerLike(role) || role === 'sales' || role === 'scheduling') {
    also.push({ id: 'invoice', label: 'New invoice', hint: 'Draft a PDF, then send.', tone: 'neutral', section: 'also', action: 'stub', route: 'invoices' })
  }
  if (isOwnerLike(role)) {
    also.push({ id: 'team', label: 'Add team member', hint: 'Name, role, and a login.', tone: 'neutral', section: 'also', action: 'stub', route: 'team' })
  }
  return { primary, also }
}

export const SAMPLE_JOBS: Job[] = [
  {
    id: 'hale',
    customerName: 'Tom Hale',
    title: 'Irrigation retrofit',
    kind: 'estimate',
    step: 'request',
    estimate: 6250,
    address: '15 Willow Ave',
    note: 'Inbound request',
    crew: '',
    day: '',
    slot: '',
    assignee: 'drew',
    signed: false,
    depositPaid: false,
  },
  {
    id: 'maya',
    customerName: 'Maya Chen',
    title: 'Lawn install',
    kind: 'estimate',
    step: 'create',
    estimate: 8400,
    address: '214 Oak Lane',
    note: 'Draft priced',
    crew: '',
    day: '',
    slot: '',
    assignee: 'drew',
    signed: false,
    depositPaid: false,
  },
  {
    id: 'rivera',
    customerName: 'Rivera Family',
    title: 'Hardscape patio',
    kind: 'estimate',
    step: 'awaiting',
    estimate: 21750,
    address: '88 Cedar Court',
    note: 'Sent — waiting on deposit',
    crew: '',
    day: '',
    slot: '',
    assignee: 'drew',
    signed: false,
    depositPaid: false,
  },
  {
    id: 'patel',
    customerName: 'Patel Residence',
    title: 'Tree cleanup',
    kind: 'estimate',
    step: 'ready',
    estimate: 3180,
    address: '402 Maple Drive',
    note: 'Signed + deposit in',
    crew: '',
    day: '',
    slot: '',
    assignee: 'casey',
    signed: true,
    depositPaid: true,
  },
  {
    id: 'june',
    customerName: 'June Okonkwo',
    title: 'Garden beds + mulch',
    kind: 'service',
    step: 'start',
    estimate: 4960,
    address: '9 Birch Street',
    note: 'Luis + Ana · 8:00–12:00',
    crew: 'Luis + Ana',
    day: 'Today',
    slot: '8:00–12:00',
    assignee: 'ellis',
    signed: false,
    depositPaid: true,
  },
  {
    id: 'west',
    customerName: 'West Park HOA',
    title: 'Irrigation check',
    kind: 'service',
    step: 'progress',
    estimate: 1280,
    address: '1200 Park Loop',
    note: 'Finley on site',
    crew: 'Finley',
    day: 'Today',
    slot: '12:00–2:00',
    assignee: 'finley',
    signed: false,
    depositPaid: true,
  },
  {
    id: 'kim',
    customerName: 'Kim Alvarez',
    title: 'Controller fault',
    kind: 'inspection',
    step: 'start',
    estimate: 180,
    address: '41 Ridge Way',
    note: 'Warranty look',
    crew: 'Ellis',
    day: 'Today',
    slot: '3:00–4:00',
    assignee: 'ellis',
    signed: false,
    depositPaid: false,
  },
]

export function seedAlerts(jobs: Job[]): Alert[] {
  const rivera = jobs.find((job) => job.id === 'rivera')
  const june = jobs.find((job) => job.id === 'june')
  const patel = jobs.find((job) => job.id === 'patel')
  return [
    {
      id: 'ping-assign-june',
      title: 'You were put on a visit',
      detail: june ? `${june.customerName} · ${june.title}` : 'Crew assignment',
      kind: 'assignment',
      jobId: 'june',
      unread: true,
      time: '12m',
    },
    {
      id: 'ping-signed-patel',
      title: 'Estimate signed',
      detail: patel ? `${patel.customerName} · ${patel.title}` : 'Signed',
      kind: 'signed',
      jobId: 'patel',
      unread: true,
      time: '1h',
    },
    {
      id: 'ping-shout',
      title: 'Office shout',
      detail: 'Crew rolling at 8 — West Park after lunch',
      kind: 'shout',
      unread: true,
      time: '2h',
    },
    {
      id: 'ready-patel',
      title: 'Ready to schedule',
      detail: patel ? `${patel.customerName} · ${patel.title}` : 'Handoff',
      kind: 'ready',
      jobId: 'patel',
      unread: true,
      time: '3h',
    },
    {
      id: 'await-rivera',
      title: 'Estimate sent',
      detail: rivera ? `${rivera.customerName} · ${rivera.title}` : 'Awaiting',
      kind: 'estimate',
      jobId: 'rivera',
      unread: true,
      time: 'Yesterday',
    },
  ]
}

export type HomeWidget = {
  id: string
  label: string
  count: number
  hint: string
  tone: DisplayKind
  featured?: boolean
}

export function countBy(jobs: Job[], pred: (job: Job) => boolean) {
  return jobs.filter(pred).length
}

export function isLead(job: Job) {
  return job.kind === 'estimate' && job.step === 'request'
}

export function isDraft(job: Job) {
  return job.kind === 'estimate' && job.step === 'create'
}

export function isAwaiting(job: Job) {
  return job.kind === 'estimate' && job.step === 'awaiting'
}

export function isHandoff(job: Job) {
  return job.step === 'ready' || job.step === 'schedule'
}

export function isToday(job: Job) {
  return job.day === 'Today'
}

export function homeNextActions(jobs: Job[], lens: HomeLens): HomeWidget[] {
  if (lens === 'sales') {
    return [
      { id: 'leads', label: 'Leads', count: countBy(jobs, isLead), hint: 'Own or write', tone: 'estimate' },
      { id: 'draft', label: 'Estimates', count: countBy(jobs, isDraft), hint: 'Draft / send', tone: 'estimate', featured: true },
      { id: 'awaiting', label: 'Awaiting deposit', count: countBy(jobs, isAwaiting), hint: 'Sent — waiting on deposit', tone: 'estimate' },
    ]
  }
  if (lens === 'stops') {
    const mine = jobs.filter((job) => job.assignee === 'finley' || (isToday(job) && job.kind !== 'estimate'))
    return [
      {
        id: 'next',
        label: 'Next job',
        count: mine.some((job) => job.step === 'progress' || job.step === 'start') ? 1 : 0,
        hint: 'On your book',
        tone: 'service',
        featured: true,
      },
      { id: 'remaining', label: 'Remaining today', count: mine.filter(isToday).length, hint: 'Stops left', tone: 'service' },
    ]
  }
  if (lens === 'schedule') {
    return [
      { id: 'board', label: "Today's jobs", count: countBy(jobs, isToday), hint: 'On the day board', tone: 'service', featured: true },
      { id: 'handoff', label: 'Ready to schedule', count: countBy(jobs, isHandoff), hint: 'Committed — book a crew', tone: 'job' },
    ]
  }
  if (lens === 'crew') {
    return [
      {
        id: 'start',
        label: "Today's jobs",
        count: countBy(jobs, (job) => isToday(job) && (job.step === 'start' || job.step === 'progress')),
        hint: 'Hold to start',
        tone: 'service',
        featured: true,
      },
      { id: 'handoff', label: 'Ready to schedule', count: countBy(jobs, isHandoff), hint: 'Office / foreman book these', tone: 'job' },
    ]
  }
  return [
    { id: 'today', label: "Today's jobs", count: countBy(jobs, isToday), hint: 'On the book', tone: 'service', featured: true },
    { id: 'handoff', label: 'Ready to schedule', count: countBy(jobs, isHandoff), hint: 'Won jobs waiting on a slot', tone: 'job' },
  ]
}

export const homeWidgets = homeNextActions

export function jobsForLens(jobs: Job[], lens: HomeLens, tab: Tab): Job[] {
  if (tab === 'jobs') return jobs
  if (lens === 'sales') return jobs.filter((job) => job.kind === 'estimate' && !isFieldPhase(job))
  if (lens === 'stops') return jobs.filter((job) => job.assignee === 'finley' || (isToday(job) && job.kind !== 'estimate'))
  if (lens === 'schedule') return jobs.filter((job) => isToday(job) || isHandoff(job))
  if (lens === 'crew') return jobs.filter((job) => isToday(job) || isHandoff(job) || job.step === 'progress')
  return jobs.filter((job) => isToday(job) || isHandoff(job) || job.kind === 'estimate')
}

export function featuredJob(jobs: Job[], lens: HomeLens, role: StaffRole): Job | null {
  const list = jobsForLens(jobs, lens, 'home')
  if (lens === 'sales') {
    return list.find(isDraft) ?? list.find(isAwaiting) ?? list.find(isLead) ?? list[0] ?? null
  }
  if (lens === 'stops') {
    return list.find((job) => job.step === 'progress') ?? list.find((job) => job.step === 'start') ?? list[0] ?? null
  }
  const actionable = list.find((job) => !jobCta(job, role).disabled && job.step !== 'complete')
  return actionable ?? list[0] ?? null
}

export function deriveKpis(jobs: Job[]) {
  const pipeline = jobs.filter((job) => job.kind === 'estimate' && !isFieldPhase(job)).reduce((sum, job) => sum + job.estimate, 0)
  const won = jobs.filter((job) => isFieldPhase(job) || job.step === 'ready').reduce((sum, job) => sum + job.estimate, 0)
  return [
    { id: 'pipe', label: 'Pipeline', value: compactMoney(pipeline), accent: KIND_FILL.estimate, hex: KIND_HEX.estimate },
    { id: 'won', label: 'Won', value: compactMoney(won), accent: KIND_FILL.job, hex: KIND_HEX.job },
    { id: 'ready', label: 'To schedule', value: String(countBy(jobs, isHandoff)), accent: KIND_FILL.inspection, hex: KIND_HEX.inspection },
  ]
}

export type JobFilter = 'all' | DisplayKind

export const JOB_FILTERS: { id: JobFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'estimate', label: 'Estimate' },
  { id: 'job', label: 'Job' },
  { id: 'service', label: 'Service' },
  { id: 'inspection', label: 'Inspection' },
]

export function filterJobs(jobs: Job[], filter: JobFilter) {
  if (filter === 'all') return jobs
  return jobs.filter((job) => displayKind(job) === filter)
}

export function sendEstimate(job: Job): Job {
  if (job.kind !== 'estimate' || (job.step !== 'request' && job.step !== 'create')) return job
  return { ...job, step: 'awaiting', note: 'Estimate sent' }
}

export function collectDeposit(job: Job): Job {
  if (job.kind !== 'estimate' || job.step !== 'awaiting') return job
  return { ...job, step: 'ready', signed: true, depositPaid: true, note: 'Deposit paid' }
}

export function ownLead(job: Job, seatId: string): Job {
  if (job.kind !== 'estimate' || job.step !== 'request') return job
  return { ...job, step: 'create', assignee: seatId, note: 'Owned — write next' }
}

export function scheduleInstall(job: Job, crew = 'Luis + Ana'): Job {
  if (job.step !== 'ready' && job.step !== 'schedule') return job
  return {
    ...job,
    step: 'start',
    crew,
    day: 'Today',
    slot: '2:00–5:00',
    assignee: 'ellis',
    note: `${crew} · Today 2:00–5:00`,
  }
}

export function startJob(job: Job): Job {
  if (job.step !== 'start') return job
  return { ...job, step: 'progress', note: `${job.crew || 'Crew'} rolling` }
}

export function completeJob(job: Job): Job {
  if (job.step !== 'progress' && job.step !== 'start') return job
  return { ...job, step: 'workDone', note: 'Work complete' }
}

export function closeJob(job: Job): Job {
  if (job.step !== 'workDone') return job
  return { ...job, step: 'complete', note: 'Closed' }
}

export function createFromLane(action: CreateLane['action'], index: number, role: StaffRole): Job | null {
  if (action === 'stub') return null
  if (action === 'lead') {
    return {
      id: `lead-${index}`,
      customerName: `New lead #${index}`,
      title: 'Site visit / quote',
      kind: 'estimate',
      step: 'request',
      estimate: 0,
      address: 'On-site',
      note: 'Created from +',
      crew: '',
      day: '',
      slot: '',
      assignee: seatByRole(role).id,
      signed: false,
      depositPaid: false,
    }
  }
  if (action === 'estimate') {
    return {
      id: `est-${index}`,
      customerName: `New estimate #${index}`,
      title: 'Site visit / quote',
      kind: 'estimate',
      step: 'create',
      estimate: 2500,
      address: 'On-site',
      note: 'Draft from +',
      crew: '',
      day: '',
      slot: '',
      assignee: 'drew',
      signed: false,
      depositPaid: false,
    }
  }
  if (action === 'inspection') {
    return {
      id: `insp-${index}`,
      customerName: `Inspection #${index}`,
      title: 'Issue / warranty look',
      kind: 'inspection',
      step: 'schedule',
      estimate: 180,
      address: 'On-site',
      note: 'Unscheduled look',
      crew: '',
      day: '',
      slot: '',
      assignee: 'ellis',
      signed: false,
      depositPaid: false,
    }
  }
  const later = intakeDefaults(role).timing === 'later'
  return {
    id: `svc-${index}`,
    customerName: `Service #${index}`,
    title: 'Install / service call',
    kind: 'service',
    step: later ? 'schedule' : 'start',
    estimate: 1800,
    address: 'On-site',
    note: later ? 'Unscheduled' : 'Booked for today',
    crew: later ? '' : 'Luis + Ana',
    day: later ? '' : 'Today',
    slot: later ? '' : '3:00–5:00',
    assignee: later ? 'casey' : 'ellis',
    signed: false,
    depositPaid: false,
  }
}

export function createdToast(action: CreateLane['action']) {
  if (action === 'lead') return 'Lead created'
  if (action === 'estimate') return 'Estimate created'
  if (action === 'inspection') return 'Inspection created'
  if (action === 'service') return 'Service created'
  return 'Saved'
}

export function applyPrimary(job: Job, role: StaffRole): { job: Job; toast: string; alert?: Alert } {
  const cta = jobCta(job, role)
  if (cta.disabled) return { job, toast: cta.reason || cta.primary }

  if (job.kind === 'estimate' && job.step === 'request') {
    const next = ownLead(job, seatByRole(role).id)
    return { job: next, toast: 'Lead owned' }
  }
  if (job.kind === 'estimate' && job.step === 'create') {
    const next = sendEstimate(job)
    return {
      job: next,
      toast: 'Estimate sent',
      alert: {
        id: `await-${next.id}`,
        title: 'Estimate sent',
        detail: `${next.customerName} · ${next.title}`,
        kind: 'estimate',
        jobId: next.id,
        unread: true,
        time: 'now',
      },
    }
  }
  if (job.kind === 'estimate' && job.step === 'awaiting') {
    const next = collectDeposit(job)
    return {
      job: next,
      toast: 'Deposit paid',
      alert: {
        id: `signed-${next.id}`,
        title: 'Estimate signed',
        detail: `${next.customerName} · ${next.title}`,
        kind: 'signed',
        jobId: next.id,
        unread: true,
        time: 'now',
      },
    }
  }
  if (job.step === 'ready' || job.step === 'schedule') {
    const next = scheduleInstall(job)
    return {
      job: next,
      toast: 'Scheduled',
      alert: {
        id: `assign-${next.id}`,
        title: 'You were put on a visit',
        detail: `${next.customerName} · ${next.title}`,
        kind: 'assignment',
        jobId: next.id,
        unread: true,
        time: 'now',
      },
    }
  }
  if (job.step === 'start') {
    const next = startJob(job)
    return { job: next, toast: 'Started' }
  }
  if (job.step === 'progress') {
    const next = completeJob(job)
    return { job: next, toast: 'Done' }
  }
  if (job.step === 'workDone') {
    const next = closeJob(job)
    return { job: next, toast: 'Closed' }
  }
  return { job, toast: flowLabel(job) }
}

export function tabByIndex(index: number): Tab {
  return DOCK[index]?.id ?? 'home'
}

export function tabIndex(tab: Tab) {
  return Math.max(0, DOCK.findIndex((item) => item.id === tab))
}

export function seatByRole(role: StaffRole) {
  return SEATS.find((seat) => seat.role === role) ?? SEATS[0]
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export const STORE_KEY = 'odinops-phone-v2'

export type Persisted = {
  jobs: Job[]
  alerts: Alert[]
  role: StaffRole
  tab: Tab
  selectedId: string
  darkMode: boolean
}

export function loadPersisted(): Partial<Persisted> | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Persisted
  } catch {
    return null
  }
}

export function savePersisted(state: Persisted) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

export function parseDeepLink(search: string) {
  const params = new URLSearchParams(search)
  const role = STAFF_ROLES.find((item) => item === params.get('role'))
  const tab = DOCK.find((item) => item.id === params.get('tab'))?.id
  const job = params.get('job') || undefined
  const fallback = params.has('fallback')
  const debug = params.has('debug')
  return { role, tab, job, fallback, debug }
}

export function writeDeepLink(input: { role: StaffRole; tab: Tab; job: string; fallback: boolean; debug?: boolean }) {
  const params = new URLSearchParams()
  params.set('role', input.role)
  params.set('tab', input.tab)
  if (input.job) params.set('job', input.job)
  if (input.fallback) params.set('fallback', '1')
  if (input.debug) params.set('debug', '1')
  const next = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState(null, '', next)
}

export function emptyCopy(lens: HomeLens, tab: Tab) {
  if (tab === 'alerts') return { title: 'You’re caught up', body: 'Assignment, signed, and shout pings land here.' }
  if (tab === 'jobs') return { title: 'No jobs in this filter', body: 'Create a lead, estimate, or service.' }
  if (lens === 'sales') return { title: 'Nothing to send', body: 'New leads and drafts show up here.' }
  if (lens === 'stops') return { title: 'No stops today', body: 'Office will assign the next visit.' }
  return { title: 'Queue is clear', body: 'When a job is ready, it lands on this lens.' }
}

export function alertTone(kind: AlertKind) {
  if (kind === 'signed' || kind === 'estimate') return KIND_HEX.estimate
  if (kind === 'assignment') return KIND_HEX.service
  if (kind === 'ready') return KIND_HEX.job
  return '#2EEBFA'
}
