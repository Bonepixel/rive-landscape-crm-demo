export type Stage = 'newLead' | 'estimateSent' | 'won'

export type Lead = {
  id: string
  customerName: string
  jobType: string
  estimate: number
  address: string
  note: string
  status: Stage
}

export const STAGE_LABEL: Record<Stage, string> = {
  newLead: 'New',
  estimateSent: 'Estimate',
  won: 'Won',
}

export const STAGE_HERO: Record<Stage, string> = {
  newLead: 'New lead',
  estimateSent: 'Estimate sent',
  won: 'Won',
}

/** ARGB ints matching the Rive chip colors */
export const STAGE_COLOR: Record<Stage, number> = {
  newLead: 0xff5b8c3e,
  estimateSent: 0xffc47a3a,
  won: 0xff2a9d8f,
}

export const SAMPLE_LEADS: Lead[] = [
  {
    id: 'maya',
    customerName: 'Maya Chen',
    jobType: 'Lawn install',
    estimate: 8400,
    address: '214 Oak Lane',
    note: 'site walk Fri',
    status: 'newLead',
  },
  {
    id: 'rivera',
    customerName: 'Rivera Family',
    jobType: 'Hardscape patio',
    estimate: 21750,
    address: '88 Cedar Court',
    note: 'stone sample approved',
    status: 'estimateSent',
  },
  {
    id: 'hale',
    customerName: 'Tom Hale',
    jobType: 'Irrigation retrofit',
    estimate: 6250,
    address: '15 Willow Ave',
    note: 'backflow permit pending',
    status: 'newLead',
  },
  {
    id: 'patel',
    customerName: 'Patel Residence',
    jobType: 'Tree cleanup',
    estimate: 3180,
    address: '402 Maple Drive',
    note: 'crew booked Tue',
    status: 'won',
  },
  {
    id: 'june',
    customerName: 'June Okonkwo',
    jobType: 'Garden beds + mulch',
    estimate: 4960,
    address: '9 Birch Street',
    note: 'follow-up after rain',
    status: 'estimateSent',
  },
]

export function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

export function nextStage(status: Stage): Stage {
  if (status === 'newLead') return 'estimateSent'
  if (status === 'estimateSent') return 'won'
  return 'won'
}

export function nextAction(status: Stage): string {
  if (status === 'newLead') return 'Next: send estimate'
  if (status === 'estimateSent') return 'Next: follow up / mark won'
  return 'Won · schedule crew'
}

export function heroLine(lead: Lead): string {
  return `${lead.address} · ${lead.note}`
}

export function counts(leads: Lead[]) {
  return {
    newLead: leads.filter((lead) => lead.status === 'newLead').length,
    estimateSent: leads.filter((lead) => lead.status === 'estimateSent').length,
    won: leads.filter((lead) => lead.status === 'won').length,
  }
}

export function pipelineValue(leads: Lead[]): string {
  const open = leads
    .filter((lead) => lead.status !== 'won')
    .reduce((sum, lead) => sum + lead.estimate, 0)
  const thousands = open / 1000
  const label = Number.isInteger(thousands)
    ? `${thousands.toFixed(0)}k`
    : `${thousands.toFixed(1)}k`
  return `Pipeline  $${label} open`
}

export function advanceLead(lead: Lead): Lead {
  const status = nextStage(lead.status)
  return { ...lead, status }
}

export function makeWalkInLead(index: number): Lead {
  return {
    id: `walkin-${Date.now()}`,
    customerName: `Walk-in #${index}`,
    jobType: 'Consult + lawn quote',
    estimate: 2500,
    address: 'On-site',
    note: 'captured from the truck',
    status: 'newLead',
  }
}
