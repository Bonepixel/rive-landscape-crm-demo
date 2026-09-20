export type Role =
  | 'intake'
  | 'sales'
  | 'scheduler'
  | 'admin'
  | 'owner'
  | 'foreman'
  | 'workers'

export type JobStage =
  | 'inquiry'
  | 'newLead'
  | 'estimateSent'
  | 'won'
  | 'scheduled'
  | 'inProgress'
  | 'done'

export type Job = {
  id: string
  customerName: string
  jobType: string
  estimate: number
  address: string
  note: string
  status: JobStage
  crew: string
  day: string
  slot: string
  flagged: boolean
}

export type ScheduleDay = {
  id: string
  day: string
  slot: string
  jobId: string
}

export type CrewMember = {
  id: string
  name: string
  title: string
  assignedJobId: string
}

export type Kpi = {
  id: string
  label: string
  value: string
  accent: number
}

export type Pill = {
  id: string
  label: string
  color: number
}

export const ROLES: { id: Role; label: string; full: string }[] = [
  { id: 'intake', label: 'Intake', full: 'Intake' },
  { id: 'sales', label: 'Sales', full: 'Sales' },
  { id: 'scheduler', label: 'Sched', full: 'Scheduler' },
  { id: 'admin', label: 'Admin', full: 'Office admin' },
  { id: 'owner', label: 'Owner', full: 'Owner' },
  { id: 'foreman', label: 'Foreman', full: 'Foreman' },
  { id: 'workers', label: 'Crew', full: 'Workers' },
]

export const STAGE_LABEL: Record<JobStage, string> = {
  inquiry: 'Inquiry',
  newLead: 'New',
  estimateSent: 'Estimate',
  won: 'Won',
  scheduled: 'Booked',
  inProgress: 'On site',
  done: 'Done',
}

export const STAGE_COLOR: Record<JobStage, number> = {
  inquiry: 0xff7b5cff,
  newLead: 0xff00d4e8,
  estimateSent: 0xffff3d8a,
  won: 0xffc6ff4d,
  scheduled: 0xff6e4aff,
  inProgress: 0xff00e5ff,
  done: 0xff3ddc97,
}

export const SAMPLE_CREW: CrewMember[] = [
  { id: 'luis', name: 'Luis Ortega', title: 'Crew lead', assignedJobId: 'june' },
  { id: 'ana', name: 'Ana Voss', title: 'Installer', assignedJobId: 'june' },
  { id: 'drew', name: 'Drew Kim', title: 'Irrigation', assignedJobId: '' },
]

export const SAMPLE_DAYS: ScheduleDay[] = [
  { id: 'mon', day: 'Mon', slot: '8:00–12:00', jobId: 'june' },
  { id: 'tue', day: 'Tue', slot: '8:00–12:00', jobId: '' },
  { id: 'wed', day: 'Wed', slot: '12:00–4:00', jobId: '' },
  { id: 'thu', day: 'Thu', slot: '8:00–12:00', jobId: '' },
]

export const SAMPLE_JOBS: Job[] = [
  {
    id: 'maya',
    customerName: 'Maya Chen',
    jobType: 'Lawn install',
    estimate: 8400,
    address: '214 Oak Lane',
    note: 'walk-in from the yard sign',
    status: 'inquiry',
    crew: '',
    day: '',
    slot: '',
    flagged: false,
  },
  {
    id: 'hale',
    customerName: 'Tom Hale',
    jobType: 'Irrigation retrofit',
    estimate: 6250,
    address: '15 Willow Ave',
    note: 'backflow permit pending',
    status: 'newLead',
    crew: '',
    day: '',
    slot: '',
    flagged: false,
  },
  {
    id: 'rivera',
    customerName: 'Rivera Family',
    jobType: 'Hardscape patio',
    estimate: 21750,
    address: '88 Cedar Court',
    note: 'stone sample approved',
    status: 'estimateSent',
    crew: '',
    day: '',
    slot: '',
    flagged: false,
  },
  {
    id: 'patel',
    customerName: 'Patel Residence',
    jobType: 'Tree cleanup',
    estimate: 3180,
    address: '402 Maple Drive',
    note: 'ready to book a crew',
    status: 'won',
    crew: '',
    day: '',
    slot: '',
    flagged: false,
  },
  {
    id: 'june',
    customerName: 'June Okonkwo',
    jobType: 'Garden beds + mulch',
    estimate: 4960,
    address: '9 Birch Street',
    note: 'Luis + Ana · Mon 8:00',
    status: 'scheduled',
    crew: 'Luis + Ana',
    day: 'Mon',
    slot: '8:00–12:00',
    flagged: false,
  },
]

export function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

export function compactMoney(n: number): string {
  const thousands = n / 1000
  const label = Number.isInteger(thousands) ? `${thousands.toFixed(0)}k` : `${thousands.toFixed(1)}k`
  return `$${label}`
}

export function roleIndex(role: Role): number {
  return Math.max(0, ROLES.findIndex((item) => item.id === role))
}

export function roleByIndex(index: number): Role {
  return ROLES[index]?.id ?? 'intake'
}

export function jobsForRole(jobs: Job[], role: Role): Job[] {
  switch (role) {
    case 'intake':
      return jobs.filter((job) => job.status === 'inquiry' || job.status === 'newLead')
    case 'sales':
      return jobs.filter(
        (job) => job.status === 'newLead' || job.status === 'estimateSent' || job.status === 'won',
      )
    case 'scheduler':
      return jobs.filter((job) => job.status === 'won' || job.status === 'scheduled')
    case 'admin':
      return jobs
    case 'owner':
      return []
    case 'foreman':
      return jobs.filter((job) => job.status === 'scheduled' || job.status === 'inProgress')
    case 'workers':
      return jobs.filter((job) => job.status === 'scheduled' || job.status === 'inProgress' || job.status === 'done')
  }
}

export function nextAction(job: Job, role: Role): string {
  if (role === 'intake') {
    return job.status === 'inquiry' ? 'Next: send to sales' : 'Already in sales'
  }
  if (role === 'sales') {
    if (job.status === 'newLead') return 'Next: send estimate'
    if (job.status === 'estimateSent') return 'Next: follow up / mark won'
    return 'Won · hand to scheduler'
  }
  if (role === 'scheduler') {
    return job.status === 'won' ? 'Next: assign crew' : `Booked ${job.day} ${job.slot}`
  }
  if (role === 'admin') {
    return job.flagged ? 'On hold · office review' : 'Paperwork looks clear'
  }
  if (role === 'foreman') {
    return job.status === 'scheduled' ? 'Next: start the crew' : 'Crew is on site'
  }
  if (role === 'workers') {
    if (job.status === 'done') return 'Task checked off'
    return 'Next: check off when finished'
  }
  return 'Owner view'
}

export function heroMeta(job: Job): string {
  const bits = [job.address]
  if (job.crew) bits.push(job.crew)
  else bits.push(job.note)
  return bits.join(' · ')
}

export function pipelineCounts(jobs: Job[]) {
  return {
    inquiry: jobs.filter((job) => job.status === 'inquiry').length,
    newLead: jobs.filter((job) => job.status === 'newLead').length,
    estimateSent: jobs.filter((job) => job.status === 'estimateSent').length,
    won: jobs.filter((job) => job.status === 'won').length,
    scheduled: jobs.filter((job) => job.status === 'scheduled').length,
    inProgress: jobs.filter((job) => job.status === 'inProgress').length,
    done: jobs.filter((job) => job.status === 'done').length,
  }
}

export function openPipelineValue(jobs: Job[]): number {
  return jobs
    .filter((job) => job.status === 'inquiry' || job.status === 'newLead' || job.status === 'estimateSent')
    .reduce((sum, job) => sum + job.estimate, 0)
}

export function wonValue(jobs: Job[]): number {
  return jobs
    .filter(
      (job) =>
        job.status === 'won' ||
        job.status === 'scheduled' ||
        job.status === 'inProgress' ||
        job.status === 'done',
    )
    .reduce((sum, job) => sum + job.estimate, 0)
}

export function roleCopy(role: Role, jobs: Job[]) {
  const counts = pipelineCounts(jobs)
  const open = compactMoney(openPipelineValue(jobs))
  const won = compactMoney(wonValue(jobs))
  switch (role) {
    case 'intake':
      return {
        subtitle: 'Intake · Front desk',
        panelTitle: "Today's inquiries",
        panelHint: `${counts.inquiry} waiting · ${counts.newLead} already in sales`,
        pipelineValue: `Desk  ${counts.inquiry} new inquiries`,
        primary: 'New walk-in',
        secondary: 'Send to sales',
      }
    case 'sales':
      return {
        subtitle: 'Sales · Estimates',
        panelTitle: 'Open pipeline',
        panelHint: `${counts.newLead} new · ${counts.estimateSent} out · ${counts.won} won`,
        pipelineValue: `Pipeline  ${open} open`,
        primary: 'Send estimate',
        secondary: 'Call',
      }
    case 'scheduler':
      return {
        subtitle: 'Scheduler · Crew board',
        panelTitle: 'This week',
        panelHint: `${counts.won} need a crew · ${counts.scheduled + counts.inProgress} booked`,
        pipelineValue: `Board  ${counts.scheduled + counts.inProgress} jobs slotted`,
        primary: 'Assign crew',
        secondary: 'Next slot',
      }
    case 'admin':
      return {
        subtitle: 'Office admin · Status',
        panelTitle: 'Paperwork + holds',
        panelHint: `${jobs.filter((job) => job.flagged).length} flagged · ${counts.done} closed`,
        pipelineValue: `Office  ${jobs.length} active jobs`,
        primary: 'Confirm status',
        secondary: 'Hold',
      }
    case 'owner':
      return {
        subtitle: 'Owner · Scoreboard',
        panelTitle: 'This week',
        panelHint: 'Shared office numbers — tap a tile',
        pipelineValue: `Week  ${won} won`,
        primary: 'Refresh KPIs',
        secondary: 'Review week',
      }
    case 'foreman':
      return {
        subtitle: 'Foreman · Field',
        panelTitle: 'Crew jobs',
        panelHint: `${counts.scheduled} queued · ${counts.inProgress} on site`,
        pipelineValue: `Field  ${counts.inProgress} crews out`,
        primary: 'Start job',
        secondary: 'Delay',
      }
    case 'workers':
      return {
        subtitle: 'Workers · My tasks',
        panelTitle: 'Assigned today',
        panelHint: `${counts.inProgress + counts.scheduled} on the board`,
        pipelineValue: `Tasks  ${counts.done} checked off`,
        primary: 'Check off',
        secondary: 'Need help',
      }
  }
}

export function deriveKpis(jobs: Job[]): Kpi[] {
  const counts = pipelineCounts(jobs)
  return [
    { id: 'open', label: 'Open jobs', value: String(counts.inquiry + counts.newLead + counts.estimateSent), accent: 0xff00d4e8 },
    { id: 'won', label: 'Won value', value: compactMoney(wonValue(jobs)), accent: 0xffc6ff4d },
    { id: 'booked', label: 'Scheduled', value: String(counts.scheduled + counts.inProgress), accent: 0xff6e4aff },
    { id: 'crew', label: 'Crews out', value: String(counts.inProgress), accent: 0xffff3d8a },
  ]
}

export function derivePills(jobs: Job[]): Pill[] {
  const counts = pipelineCounts(jobs)
  const flagged = jobs.filter((job) => job.flagged).length
  return [
    { id: 'intake', label: `${counts.inquiry} intake`, color: 0xff7b5cff },
    { id: 'sales', label: `${counts.newLead + counts.estimateSent} sales`, color: 0xffff3d8a },
    { id: 'field', label: `${counts.scheduled + counts.inProgress} field`, color: 0xff00e5ff },
    { id: 'hold', label: `${flagged} hold`, color: flagged ? 0xffff3d8a : 0xff3ddc97 },
  ]
}

export function daysWithJobs(days: ScheduleDay[], jobs: Job[]): (ScheduleDay & { title: string; crew: string })[] {
  return days.map((day) => {
    const job = jobs.find((item) => item.id === day.jobId)
    return {
      ...day,
      title: job ? `${job.customerName} · ${job.jobType}` : 'Open slot',
      crew: job?.crew || 'Unassigned',
    }
  })
}

export function assignedCrew(jobs: Job[], crew: CrewMember[]): CrewMember[] {
  return crew.map((member) => {
    const job = jobs.find((item) => item.status === 'inProgress' || item.status === 'scheduled')
    if (member.id === 'drew') {
      const irrigation = jobs.find((item) => item.jobType.toLowerCase().includes('irrigation') && item.status !== 'inquiry')
      return { ...member, assignedJobId: irrigation?.status === 'inProgress' || irrigation?.status === 'scheduled' ? irrigation.id : member.assignedJobId }
    }
    if (job && (member.id === 'luis' || member.id === 'ana')) {
      const booked = jobs.find((item) => item.crew.includes(member.name.split(' ')[0]) && (item.status === 'scheduled' || item.status === 'inProgress'))
      return { ...member, assignedJobId: booked?.id ?? member.assignedJobId }
    }
    return member
  })
}

export function makeWalkIn(index: number): Job {
  return {
    id: `walkin-${Date.now()}`,
    customerName: `Walk-in #${index}`,
    jobType: 'Consult + lawn quote',
    estimate: 2500,
    address: 'On-site',
    note: 'captured at the desk',
    status: 'inquiry',
    crew: '',
    day: '',
    slot: '',
    flagged: false,
  }
}

function firstOpenDay(days: ScheduleDay[]): ScheduleDay | undefined {
  return days.find((day) => !day.jobId) ?? days[1]
}

export function sendToSales(job: Job): Job {
  if (job.status !== 'inquiry') return job
  return { ...job, status: 'newLead', note: 'handed to sales' }
}

export function advanceSales(job: Job): Job {
  if (job.status === 'newLead') return { ...job, status: 'estimateSent', note: 'estimate emailed' }
  if (job.status === 'estimateSent') return { ...job, status: 'won', note: 'signed — book a crew' }
  return job
}

export function assignCrewToJob(
  job: Job,
  days: ScheduleDay[],
  crewName = 'Luis + Ana',
): { job: Job; days: ScheduleDay[]; dayId: string } {
  if (job.status !== 'won' && job.status !== 'scheduled') {
    return { job, days, dayId: days.find((day) => day.jobId === job.id)?.id ?? days[0].id }
  }
  const existing = days.find((day) => day.jobId === job.id)
  const slot = existing ?? firstOpenDay(days)
  if (!slot) return { job, days, dayId: days[0].id }
  const nextDays = days.map((day) => {
    if (day.id === slot.id) return { ...day, jobId: job.id }
    if (day.jobId === job.id && day.id !== slot.id) return { ...day, jobId: '' }
    return day
  })
  return {
    job: {
      ...job,
      status: 'scheduled',
      crew: crewName,
      day: slot.day,
      slot: slot.slot,
      note: `${crewName} · ${slot.day} ${slot.slot}`,
    },
    days: nextDays,
    dayId: slot.id,
  }
}

export function startJob(job: Job): Job {
  if (job.status !== 'scheduled') return job
  return { ...job, status: 'inProgress', note: `${job.crew || 'Crew'} rolling` }
}

export function completeJob(job: Job): Job {
  if (job.status !== 'inProgress' && job.status !== 'scheduled') return job
  return { ...job, status: 'done', note: 'crew checked the work off' }
}

export function nextSlotDay(days: ScheduleDay[], fromId: string): ScheduleDay {
  const index = days.findIndex((day) => day.id === fromId)
  return days[(index + 1) % days.length] ?? days[0]
}
