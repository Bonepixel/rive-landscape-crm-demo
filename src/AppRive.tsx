import { useEffect, useMemo, useRef } from 'react'
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModelInstanceNumber,
  useViewModelInstanceTrigger,
  type Rive,
  type ViewModelInstance,
} from '@rive-app/react-webgl2'
import type { Customer, Invoice } from './crm'
import { HitLayer, type BridgeRow } from './HitLayer'
import {
  DOCK,
  KIND_FILL,
  MORE_NAV,
  ORG,
  ROLE_LABEL,
  SEATS,
  createLanes,
  flowLabel,
  HOME_DATE_LINE,
  homeLens,
  homeSubtitle,
  homeTitle,
  kindArgb,
  kindLabel,
  money,
  stageOf,
  tabIndex,
  visibleMoreNav,
  type Alert,
  type CreateLane,
  type HomeWidget,
  type Job,
  type JobCta,
  type StaffRole,
  type Tab,
} from './odinops'

const PAID = 0xff2dd4bf
const UNPAID = 0xfffb923c

const RIV = `${import.meta.env.BASE_URL}assets/landscape-crm.riv`

const NAV = ['navIntake', 'navSales', 'navScheduler', 'navAdmin', 'navOwner'] as const

function writeString(instance: ViewModelInstance, path: string, value: string) {
  const property = instance.string(path)
  if (property && property.value !== value) property.value = value
}

function writeBool(instance: ViewModelInstance, path: string, value: boolean) {
  const property = instance.boolean(path)
  if (property && property.value !== value) property.value = value
}

function writeNumber(instance: ViewModelInstance, path: string, value: number) {
  const property = instance.number(path)
  if (property && property.value !== value) property.value = value
}

function writeColor(instance: ViewModelInstance, path: string, value: number) {
  const property = instance.color(path)
  if (property && property.value !== value) property.value = value
}

function syncList(
  rive: Rive,
  vmi: ViewModelInstance,
  path: string,
  viewModelName: string,
  count: number,
  write: (instance: ViewModelInstance, index: number) => void,
) {
  const list = vmi.list(path)
  const viewModel = rive.viewModelByName(viewModelName)
  if (!list || !viewModel) return
  while (list.length > count) list.removeInstanceAt(list.length - 1)
  while (list.length < count) list.addInstance(viewModel.instance())
  for (let index = 0; index < count; index += 1) {
    const item = list.instanceAt(index)
    if (item) write(item, index)
  }
}

type Kpi = { id: string; label: string; value: string; accent: number }

type Props = {
  jobs: Job[]
  allJobs: Job[]
  alerts: Alert[]
  kpis: Kpi[]
  widgets: HomeWidget[]
  selectedId: string
  role: StaffRole
  tab: Tab
  moreRoute: string | null
  toast: string
  darkMode: boolean
  burst: number
  booting: boolean
  empty: { title: string; body: string } | null
  confetti: number
  alertSpark: number
  debug: boolean
  primaryLabel: string
  heroJob: Job | null
  cta: JobCta | null
  customers: Customer[]
  invoices: Invoice[]
  activeCustomer: Customer | null
  activeInvoice: Invoice | null
  onCustomer: (id: string) => void
  onInvoice: (id: string) => void
  onReady: () => void
  onError: () => void
  onTab: (tab: Tab) => void
  onPrimary: () => void
  onSecondary: () => void
  onSelectJob: (id: string) => void
  onCreate: (lane: CreateLane) => void
  onMore: (route: string | null) => void
  onAck: (id: string) => void
  onRole: (role: StaffRole) => void
  onDebug: (message: string) => void
}

export function AppRive({
  jobs,
  allJobs,
  alerts,
  kpis,
  widgets,
  selectedId,
  role,
  tab,
  moreRoute,
  toast,
  darkMode,
  burst,
  booting,
  empty,
  confetti,
  alertSpark,
  debug,
  primaryLabel,
  heroJob,
  cta,
  customers,
  invoices,
  activeCustomer,
  activeInvoice,
  onCustomer,
  onInvoice,
  onReady,
  onError,
  onTab,
  onPrimary,
  onSecondary,
  onSelectJob,
  onCreate,
  onMore,
  onAck,
  onRole,
  onDebug,
}: Props) {
  const { rive, RiveComponent } = useRive({
    src: RIV,
    artboard: 'Phone',
    stateMachine: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoad: () => onReady(),
    onLoadError: () => onError(),
  })

  const vmi = rive?.viewModelInstance ?? null
  const { value: selectedIndex } = useViewModelInstanceNumber('selectedIndex', vmi)

  useViewModelInstanceTrigger('primaryBtn/fire', vmi, {
    onTrigger: () => {
      onDebug('primary fire (rive)')
      onPrimary()
    },
  })
  useViewModelInstanceTrigger('secondaryBtn/fire', vmi, { onTrigger: onSecondary })

  const lanes = createLanes(role)
  const createRows = tab === 'create' ? [...lanes.primary, ...lanes.also] : []
  const moreItems = tab === 'more' && !moreRoute ? visibleMoreNav(role) : []
  const ignoreWriteUntil = useRef(0)

  const bridgeRows = useMemo<BridgeRow[]>(() => {
    if (tab === 'create') {
      return createRows.map((lane) => ({ type: 'create', id: lane.id, label: lane.label }))
    }
    if (tab === 'alerts') {
      return alerts.map((alert) => ({ type: 'alert', id: alert.id, label: alert.title }))
    }
    if (tab === 'more' && !moreRoute) {
      return [
        ...SEATS.map((seat) => ({ type: 'seat' as const, id: seat.role, label: `${seat.name} · ${ROLE_LABEL[seat.role]}` })),
        ...moreItems.map((item) => ({ type: 'more' as const, id: item.route, label: item.label })),
      ]
    }
    if (tab === 'more' && moreRoute === 'customers') {
      return customers.map((customer) => ({ type: 'customer', id: customer.id, label: customer.name }))
    }
    if (tab === 'more' && moreRoute === 'invoices') {
      return invoices.map((invoice) => ({ type: 'invoice', id: invoice.id, label: `Invoice ${invoice.number}` }))
    }
    if (tab === 'jobs') {
      return jobs.map((job) => ({ type: 'job', id: job.id, label: job.customerName }))
    }
    return []
  }, [tab, createRows, alerts, moreItems, moreRoute, jobs, customers, invoices])

  const applyBridge = (row: BridgeRow) => {
    ignoreWriteUntil.current = performance.now() + 280
    onDebug(`selected=${row.type}:${row.id}`)
    if (row.type === 'job') onSelectJob(row.id)
    if (row.type === 'create') {
      const lane = createRows.find((item) => item.id === row.id)
      if (lane) onCreate(lane)
    }
    if (row.type === 'alert') onAck(row.id)
    if (row.type === 'more') onMore(row.id)
    if (row.type === 'seat') onRole(row.id as StaffRole)
    if (row.type === 'customer') onCustomer(row.id)
    if (row.type === 'invoice') onInvoice(row.id)
  }

  const primedIndex = useRef(false)
  useEffect(() => {
    if (selectedIndex == null || Number.isNaN(selectedIndex)) return
    if (!primedIndex.current) {
      primedIndex.current = true
      return
    }
    if (selectedIndex < 0) return
    const index = Math.round(selectedIndex)
    const row = bridgeRows[index]
    if (row) applyBridge(row)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex])

  // Do not subscribe roleIndex → onTab. Nested dock clicks are flaky on
  // WebGL2, and the stale VM value snaps HTML dock taps back to Home.

  const lastRole = useRef<StaffRole | null>(null)
  useEffect(() => {
    if (!vmi) return
    if (lastRole.current && lastRole.current !== role) {
      vmi.trigger('roleSwitch')?.trigger()
    }
    lastRole.current = role
  }, [role, vmi])

  const lastView = useRef<string | null>(null)
  useEffect(() => {
    if (!vmi) return
    const view = `${tab}:${moreRoute ?? ''}`
    if (lastView.current !== null && lastView.current !== view) vmi.trigger('tabSwitch')?.trigger()
    lastView.current = view
  }, [tab, moreRoute, vmi])

  const heroKey = tab === 'more' && moreRoute === 'customers'
    ? `customer:${activeCustomer?.id ?? ''}`
    : tab === 'more' && moreRoute === 'invoices'
      ? `invoice:${activeInvoice?.id ?? ''}`
      : tab === 'create' || tab === 'more'
        ? tab
        : `job:${heroJob?.id ?? ''}`
  const lastHero = useRef<string | null>(null)
  useEffect(() => {
    if (!vmi) return
    if (lastHero.current !== null && lastHero.current !== heroKey) vmi.trigger('heroSwap')?.trigger()
    lastHero.current = heroKey
  }, [heroKey, vmi])

  const lastBurst = useRef(0)
  useEffect(() => {
    if (!vmi || burst === 0 || burst === lastBurst.current) return
    lastBurst.current = burst
    vmi.trigger('fireSuccess')?.trigger()
    vmi.trigger('primaryBtn/success')?.trigger()
    const tiles = vmi.list('kpis')
    if (tiles) {
      for (let i = 0; i < tiles.length; i += 1) tiles.instanceAt(i)?.trigger('tick')?.trigger()
    }
  }, [burst, vmi])

  const lastConfetti = useRef(0)
  useEffect(() => {
    if (!vmi || confetti === 0 || confetti === lastConfetti.current) return
    lastConfetti.current = confetti
    vmi.trigger('fireConfetti')?.trigger()
  }, [confetti, vmi])

  const lastAlert = useRef(0)
  useEffect(() => {
    if (!vmi || alertSpark === 0 || alertSpark === lastAlert.current) return
    lastAlert.current = alertSpark
    vmi.trigger('fireAlertSpark')?.trigger()
  }, [alertSpark, vmi])

  useEffect(() => {
    if (!rive || !vmi) return

    const lens = homeLens(role)
    const selected = heroJob ?? allJobs[0]
    const seat = SEATS.find((item) => item.role === role)
    const selectedIndexValue = Math.max(0, jobs.findIndex((job) => job.id === selectedId))
    const crmRoute = tab === 'more' && (moreRoute === 'customers' || moreRoute === 'invoices') ? moreRoute : null

    writeString(vmi, 'businessName', 'OdinOps')
    writeString(vmi, 'subtitle', `${ORG} · ${seat?.name.split(' ')[0] ?? ''}`)
    writeString(vmi, 'toast', toast)
    writeString(
      vmi,
      'panelTitle',
      crmRoute === 'customers'
        ? 'Customers'
        : crmRoute === 'invoices'
          ? 'Invoices'
          : tab === 'alerts'
            ? 'Alerts'
            : tab === 'create'
              ? 'What do you want?'
              : tab === 'more'
                ? 'More'
                : tab === 'jobs'
                  ? 'Jobs'
                  : homeTitle(lens),
    )
    writeString(
      vmi,
      'panelHint',
      crmRoute === 'customers'
        ? `${customers.length} on file · tap one, then quote`
        : crmRoute === 'invoices'
          ? `${invoices.filter((item) => item.status === 'unpaid').length} unpaid · tap one, then mark paid`
          : tab === 'home'
            ? HOME_DATE_LINE
            : tab === 'create'
              ? 'Estimate sells. Service finishes.'
              : `/${tab}`,
    )
    writeString(vmi, 'pipelineValue', widgets.map((widget) => `${widget.label} ${widget.count}`).join(' · '))
    writeBool(vmi, 'darkMode', darkMode)
    writeBool(vmi, 'booting', booting)
    writeBool(vmi, 'toastOn', Boolean(toast))
    writeBool(vmi, 'emptyVisible', Boolean(empty))
    writeString(vmi, 'emptyTitle', empty?.title ?? '')
    writeString(vmi, 'emptyHint', empty?.body ?? '')
    if (performance.now() > ignoreWriteUntil.current) {
      writeNumber(vmi, 'roleIndex', tabIndex(tab))
      writeNumber(vmi, 'selectedIndex', tab === 'home' || tab === 'jobs' ? selectedIndexValue : -1)
    }

    const session = vmi.viewModel('session')
    const roleEnum = session?.enum('activeRole')
    if (roleEnum && roleEnum.value !== role) roleEnum.value = role

    const home = vmi.viewModel('home')
    if (home) {
      writeString(home, 'lens', lens)
      writeString(home, 'title', homeTitle(lens))
      writeString(home, 'subtitle', homeSubtitle(lens))
    }

    writeString(vmi, 'primaryBtn/label', cta?.disabled ? cta.reason || cta.primary : (cta?.primary ?? 'Open'))
    writeBool(vmi, 'primaryBtn/primary', !cta?.disabled)
    writeString(vmi, 'secondaryBtn/label', moreRoute ? 'Back' : '···')
    writeBool(vmi, 'secondaryBtn/primary', false)

    NAV.forEach((path, index) => {
      writeString(vmi, `${path}/label`, DOCK[index]?.label ?? '')
      writeBool(vmi, `${path}/selected`, DOCK[index]?.id === tab)
      writeNumber(vmi, `${path}/index`, index)
    })

    const moreItem = moreRoute ? MORE_NAV.find((item) => item.route === moreRoute) : null
    const showsJob = !crmRoute && tab !== 'create' && !(tab === 'more' && moreItem)
    writeNumber(vmi, 'heroStage', showsJob && selected ? stageOf(selected) : 0)
    if (crmRoute === 'customers' && activeCustomer) {
      writeString(vmi, 'heroName', activeCustomer.name)
      writeString(
        vmi,
        'heroJob',
        `${activeCustomer.jobCount} ${activeCustomer.jobCount === 1 ? 'job' : 'jobs'} · ${money(activeCustomer.lifetime)} lifetime`,
      )
      writeString(vmi, 'heroMeta', `${activeCustomer.address} · ${activeCustomer.openCount} open`)
      writeString(vmi, 'heroNext', cta?.attention ?? '')
      writeString(vmi, 'heroChip', activeCustomer.balance > 0 ? 'Balance' : 'Customer')
      writeColor(vmi, 'heroChipColor', activeCustomer.balance > 0 ? UNPAID : 0xff2eebfa)
    } else if (crmRoute === 'invoices' && activeInvoice) {
      const paid = activeInvoice.status === 'paid'
      writeString(vmi, 'heroName', `Invoice #${activeInvoice.number}`)
      writeString(vmi, 'heroJob', `${activeInvoice.customerName} · ${activeInvoice.title}`)
      writeString(vmi, 'heroMeta', `${money(activeInvoice.amount)} · issued ${activeInvoice.issued}`)
      writeString(vmi, 'heroNext', cta?.attention ?? '')
      writeString(vmi, 'heroChip', paid ? 'Paid' : 'Unpaid')
      writeColor(vmi, 'heroChipColor', paid ? PAID : UNPAID)
    } else if (tab === 'create') {
      writeString(vmi, 'heroName', 'What do you want?')
      writeString(vmi, 'heroJob', 'Lead · Estimate · Service · Inspection')
      writeString(vmi, 'heroMeta', 'Also · invoice, team')
      writeString(vmi, 'heroNext', 'Estimate sells and hands off. Service finishes the job.')
      writeString(vmi, 'heroChip', 'Create')
      writeColor(vmi, 'heroChipColor', 0xff2eebfa)
    } else if (tab === 'more' && moreItem) {
      writeString(vmi, 'heroName', moreItem.label)
      writeString(vmi, 'heroJob', moreItem.href)
      writeString(vmi, 'heroMeta', moreItem.hint)
      writeString(vmi, 'heroNext', 'Same destination as live OdinOps.')
      writeString(vmi, 'heroChip', 'More')
      writeColor(vmi, 'heroChipColor', 0xffa78bfa)
    } else if (selected) {
      writeString(vmi, 'heroName', selected.customerName)
      writeString(vmi, 'heroJob', `${kindLabel(selected)} · ${selected.title} · ${money(selected.estimate)}`)
      writeString(vmi, 'heroMeta', `${selected.address}${selected.crew ? ` · ${selected.crew}` : ''}`)
      writeString(vmi, 'heroNext', cta?.attention ?? '')
      writeString(vmi, 'heroChip', flowLabel(selected))
      writeColor(vmi, 'heroChipColor', kindArgb(selected))
    }

    const quote = vmi.viewModel('quote')
    if (quote && selected) {
      writeString(quote, 'customerName', selected.customerName)
      writeString(quote, 'amount', money(selected.estimate))
      writeString(quote, 'step', flowLabel(selected))
    }

    const visualRows = tab === 'alerts'
      ? alerts.map((alert) => ({
          customerName: alert.title,
          title: alert.detail,
          estimate: 0,
          status: alert.time,
          color: 0xff2eebfa,
          selected: false,
          dimmed: false,
        }))
      : tab === 'more' && !moreRoute
        ? [
            ...SEATS.map((item) => ({
              customerName: item.name,
              title: `${ROLE_LABEL[item.role]} · ${ORG}`,
              estimate: 0,
              status: 'Account',
              color: item.role === role ? 0xff2eebfa : 0xffa78bfa,
              selected: item.role === role,
              dimmed: false,
            })),
            ...moreItems.map((item) => ({
              customerName: item.label,
              title: item.hint,
              estimate: 0,
              status: item.href,
              color: 0xff2eebfa,
              selected: false,
              dimmed: false,
            })),
          ]
        : crmRoute === 'customers'
          ? customers.map((customer) => ({
              customerName: customer.name,
              title: `${customer.openCount} open · ${customer.address}`,
              estimate: customer.lifetime,
              status: customer.balance > 0 ? `Owes ${money(customer.balance)}` : 'Customer',
              color: customer.balance > 0 ? UNPAID : 0xff2eebfa,
              selected: customer.id === activeCustomer?.id,
              dimmed: false,
            }))
        : crmRoute === 'invoices'
          ? invoices.map((invoice) => ({
              customerName: `#${invoice.number} · ${invoice.customerName}`,
              title: invoice.title,
              estimate: invoice.amount,
              status: invoice.status === 'paid' ? 'Paid' : 'Unpaid',
              color: invoice.status === 'paid' ? PAID : UNPAID,
              selected: invoice.id === activeInvoice?.id,
              dimmed: invoice.status === 'paid',
            }))
        : tab === 'create'
          ? createRows.map((lane) => ({
              customerName: lane.label,
              title: lane.hint,
              estimate: 0,
              status: lane.section === 'also' ? 'Also' : 'Create',
              color: KIND_FILL[lane.tone === 'lead' || lane.tone === 'book' || lane.tone === 'neutral' ? 'inspection' : lane.tone],
              selected: false,
              dimmed: false,
            }))
          : jobs.map((job) => ({
              customerName: job.customerName,
              title: job.title,
              estimate: job.estimate,
              status: flowLabel(job),
              color: kindArgb(job),
              selected: job.id === selectedId,
              dimmed: job.step === 'complete',
            }))

    syncList(rive, vmi, 'jobs', 'Job', visualRows.length, (instance, index) => {
      const job = visualRows[index]
      writeString(instance, 'customerName', job.customerName)
      writeString(instance, 'jobType', job.title)
      writeString(instance, 'estimate', job.estimate ? money(job.estimate) : '')
      writeString(instance, 'status', job.status)
      writeBool(instance, 'selected', job.selected)
      writeColor(instance, 'chipColor', job.color)
      writeBool(instance, 'dimmed', job.dimmed)
    })

    const tiles = tab === 'home'
      ? (lens === 'pulse' ? kpis : widgets.map((widget) => ({
          label: widget.label,
          value: String(widget.count),
          accent: KIND_FILL[widget.tone],
        })))
      : []
    syncList(rive, vmi, 'kpis', 'KpiTile', tiles.length, (instance, index) => {
      const tile = tiles[index]
      writeString(instance, 'label', tile.label)
      writeString(instance, 'value', tile.value)
      writeColor(instance, 'accent', tile.accent)
    })

    syncList(rive, vmi, 'days', 'ScheduleDay', 0, () => undefined)
    syncList(rive, vmi, 'pills', 'Pill', 0, () => undefined)
  }, [
    rive,
    vmi,
    jobs,
    allJobs,
    alerts,
    kpis,
    widgets,
    selectedId,
    role,
    tab,
    moreRoute,
    toast,
    darkMode,
    booting,
    empty,
    createRows,
    moreItems,
    heroJob,
    cta,
    customers,
    invoices,
    activeCustomer,
    activeInvoice,
  ])

  return (
    <div className="rive-host">
      <RiveComponent />
      <HitLayer
        tab={tab}
        rows={bridgeRows}
        primaryLabel={primaryLabel}
        debug={debug}
        onTab={(next) => {
          ignoreWriteUntil.current = performance.now() + 800
          onDebug(`tab=${next}`)
          onTab(next)
        }}
        onPrimary={() => {
          onDebug('primary fire')
          onPrimary()
        }}
        onSecondary={() => {
          onDebug('secondary fire')
          onSecondary()
        }}
        onRow={applyBridge}
      />
    </div>
  )
}
