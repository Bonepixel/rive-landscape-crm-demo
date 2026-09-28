import { money, type Job, type JobCta, type StaffRole, seatByRole } from './odinops.ts'

export type Invoice = {
  id: string
  number: number
  jobId: string
  customerName: string
  title: string
  amount: number
  status: 'unpaid' | 'paid'
  issued: string
}

export type Customer = {
  id: string
  name: string
  address: string
  jobCount: number
  openCount: number
  lifetime: number
  balance: number
  lastJobId: string
}

export function customerId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function seedInvoices(): Invoice[] {
  return [
    {
      id: 'inv-1041',
      number: 1041,
      jobId: '',
      customerName: 'West Park HOA',
      title: 'Spring start-up',
      amount: 640,
      status: 'unpaid',
      issued: 'Sep 12',
    },
    {
      id: 'inv-1040',
      number: 1040,
      jobId: '',
      customerName: 'Patel Residence',
      title: 'Fall cleanup',
      amount: 1180,
      status: 'paid',
      issued: 'Sep 2',
    },
  ]
}

function isWon(job: Job) {
  if (job.kind === 'estimate') return job.signed && job.depositPaid
  return true
}

export function deriveCustomers(jobs: Job[], invoices: Invoice[]): Customer[] {
  const byId = new Map<string, Customer>()
  const ensure = (name: string, address: string, jobId: string) => {
    const id = customerId(name)
    const existing = byId.get(id)
    if (existing) return existing
    const created: Customer = { id, name, address, jobCount: 0, openCount: 0, lifetime: 0, balance: 0, lastJobId: jobId }
    byId.set(id, created)
    return created
  }
  for (const job of jobs) {
    const customer = ensure(job.customerName, job.address, job.id)
    customer.jobCount += 1
    if (job.step !== 'complete') customer.openCount += 1
    if (isWon(job)) customer.lifetime += job.estimate
  }
  for (const invoice of invoices) {
    const customer = ensure(invoice.customerName, 'On file', invoice.jobId)
    if (!invoice.jobId) customer.lifetime += invoice.amount
    if (invoice.status === 'unpaid') customer.balance += invoice.amount
  }
  return [...byId.values()].sort(
    (a, b) => b.balance - a.balance || b.openCount - a.openCount || a.name.localeCompare(b.name),
  )
}

export function nextInvoiceNumber(invoices: Invoice[]) {
  return invoices.reduce((max, invoice) => Math.max(max, invoice.number), 1040) + 1
}

export function invoiceOnClose(prev: Job, next: Job, invoices: Invoice[]): Invoice | null {
  if (prev.step === 'complete' || next.step !== 'complete') return null
  if (invoices.some((invoice) => invoice.jobId === next.id)) return null
  const number = nextInvoiceNumber(invoices)
  const deposit = next.kind === 'estimate' && next.depositPaid ? Math.round(next.estimate * 0.3) : 0
  return {
    id: `inv-${number}`,
    number,
    jobId: next.id,
    customerName: next.customerName,
    title: next.title,
    amount: Math.max(0, next.estimate - deposit),
    status: 'unpaid',
    issued: 'Today',
  }
}

export function markPaid(invoice: Invoice): Invoice {
  return invoice.status === 'paid' ? invoice : { ...invoice, status: 'paid' }
}

export function estimateForCustomer(customer: Customer, index: number, role: StaffRole): Job {
  return {
    id: `est-${index}`,
    customerName: customer.name,
    title: 'Repeat work · quote',
    kind: 'estimate',
    step: 'create',
    estimate: 2500,
    address: customer.address,
    note: 'Repeat customer',
    crew: '',
    day: '',
    slot: '',
    assignee: seatByRole(role).id,
    signed: false,
    depositPaid: false,
  }
}

export function customerCta(customer: Customer | null): JobCta {
  if (!customer) return { primary: 'New estimate', disabled: true, reason: 'Pick a customer', attention: '' }
  return {
    primary: 'New estimate',
    disabled: false,
    reason: '',
    attention: customer.balance > 0 ? `Owes ${money(customer.balance)}` : 'Paid up — quote the next project',
  }
}

export function invoiceCta(invoice: Invoice | null): JobCta {
  if (!invoice) return { primary: 'Mark paid', disabled: true, reason: 'No invoices yet', attention: '' }
  if (invoice.status === 'paid') {
    return { primary: 'Paid', disabled: true, reason: 'Paid in full', attention: 'Paid in full' }
  }
  return { primary: 'Mark paid', disabled: false, reason: '', attention: 'Unpaid — record the payment' }
}

export function outstanding(invoices: Invoice[]) {
  return invoices.filter((invoice) => invoice.status === 'unpaid').reduce((sum, invoice) => sum + invoice.amount, 0)
}

export function collected(invoices: Invoice[]) {
  return invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
}
