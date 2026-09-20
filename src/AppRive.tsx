import { useEffect, useRef } from 'react'
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
import {
  DOCK,
  KIND_FILL,
  MORE_NAV,
  ORG,
  SEATS,
  createLanes,
  featuredJob,
  flowLabel,
  HOME_DATE_LINE,
  homeLens,
  homeSubtitle,
  homeTitle,
  jobCta,
  kindArgb,
  kindLabel,
  money,
  tabIndex,
  visibleMoreNav,
  type Alert,
  type HomeWidget,
  type Job,
  type StaffRole,
  type Tab,
} from './odinops'

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
  onReady: () => void
  onError: () => void
  onSelectJobIndex: (index: number) => void
  onSelectMoreIndex: (index: number) => void
  onTabIndex: (index: number) => void
  onPrimary: () => void
  onSecondary: () => void
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
  onReady,
  onError,
  onSelectJobIndex,
  onSelectMoreIndex,
  onTabIndex,
  onPrimary,
  onSecondary,
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
  const { value: nextTabIndex } = useViewModelInstanceNumber('roleIndex', vmi)

  useViewModelInstanceTrigger('primaryBtn/fire', vmi, { onTrigger: onPrimary })
  useViewModelInstanceTrigger('secondaryBtn/fire', vmi, { onTrigger: onSecondary })

  const listJobs = tab === 'alerts' || tab === 'create' || tab === 'more' ? [] : jobs
  const moreItems = tab === 'more' && !moreRoute ? visibleMoreNav(role) : []

  useEffect(() => {
    if (selectedIndex == null || Number.isNaN(selectedIndex) || selectedIndex < 0) return
    const index = Math.round(selectedIndex)
    if (tab === 'more' && moreItems[index]) {
      onSelectMoreIndex(index)
      return
    }
    if (listJobs[index]) onSelectJobIndex(index)
  }, [selectedIndex, listJobs, moreItems, tab, onSelectJobIndex, onSelectMoreIndex])

  useEffect(() => {
    if (nextTabIndex == null || Number.isNaN(nextTabIndex)) return
    const index = Math.round(nextTabIndex)
    if (DOCK[index] && DOCK[index].id !== tab) onTabIndex(index)
  }, [nextTabIndex, tab, onTabIndex])

  const lastRole = useRef<StaffRole | null>(null)
  useEffect(() => {
    if (!vmi) return
    if (lastRole.current && lastRole.current !== role) {
      vmi.trigger('roleSwitch')?.trigger()
    }
    lastRole.current = role
  }, [role, vmi])

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

  useEffect(() => {
    if (!rive || !vmi) return

    const lens = homeLens(role)
    const selected = tab === 'home'
      ? (featuredJob(allJobs, lens, role) ?? allJobs.find((job) => job.id === selectedId) ?? allJobs[0])
      : (allJobs.find((job) => job.id === selectedId) ?? allJobs[0])
    const seat = SEATS.find((item) => item.role === role)
    const cta = selected ? jobCta(selected, role) : null
    const selectedIndexValue = Math.max(0, listJobs.findIndex((job) => job.id === selectedId))
    const lanes = createLanes(role)

    writeString(vmi, 'businessName', seat?.name ?? 'OdinOps')
    writeString(vmi, 'subtitle', `${ORG} · ${seat?.name.split(' ')[0] ?? ''}`)
    writeString(vmi, 'toast', toast)
    writeString(vmi, 'panelTitle', tab === 'alerts' ? 'Alerts' : tab === 'create' ? 'What do you want?' : tab === 'more' ? 'More' : homeTitle(lens))
    writeString(vmi, 'panelHint', tab === 'home' ? HOME_DATE_LINE : tab === 'create' ? 'Estimate sells. Service finishes.' : `/${tab}`)
    writeString(vmi, 'pipelineValue', widgets.map((widget) => `${widget.label} ${widget.count}`).join(' · '))
    writeBool(vmi, 'darkMode', darkMode)
    writeNumber(vmi, 'roleIndex', tabIndex(tab))
    writeNumber(vmi, 'selectedIndex', tab === 'more' || tab === 'alerts' || tab === 'create' ? -1 : selectedIndexValue)

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
    writeString(vmi, 'secondaryBtn/label', '···')
    writeBool(vmi, 'secondaryBtn/primary', false)

    NAV.forEach((path, index) => {
      writeString(vmi, `${path}/label`, DOCK[index]?.label ?? '')
      writeBool(vmi, `${path}/selected`, DOCK[index]?.id === tab)
      writeNumber(vmi, `${path}/index`, index)
    })

    const moreItem = moreRoute ? MORE_NAV.find((item) => item.route === moreRoute) : null
    if (tab === 'create') {
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

    const createRows = tab === 'create' ? [...lanes.primary, ...lanes.also] : []
    const rows = tab === 'alerts'
      ? alerts.map((alert) => ({
          id: alert.id,
          customerName: alert.title,
          title: alert.detail,
          estimate: 0,
          status: alert.time,
          color: 0xff2eebfa,
          selected: false,
        }))
      : tab === 'more'
        ? moreItems.map((item) => ({
            id: item.route,
            customerName: item.label,
            title: item.hint,
            estimate: 0,
            status: item.href,
            color: 0xff2eebfa,
            selected: false,
          }))
        : tab === 'create'
          ? createRows.map((lane) => ({
              id: lane.id,
              customerName: lane.label,
              title: lane.hint,
              estimate: 0,
              status: lane.section === 'also' ? 'Also' : 'Create',
              color: KIND_FILL[lane.tone === 'lead' || lane.tone === 'book' || lane.tone === 'neutral' ? 'inspection' : lane.tone],
              selected: false,
            }))
          : listJobs.map((job) => ({
              id: job.id,
              customerName: job.customerName,
              title: job.title,
              estimate: job.estimate,
              status: flowLabel(job),
              color: kindArgb(job),
              selected: job.id === selectedId,
            }))

    syncList(rive, vmi, 'jobs', 'Job', rows.length, (instance, index) => {
      const job = rows[index]
      writeString(instance, 'customerName', job.customerName)
      writeString(instance, 'jobType', job.title)
      writeString(instance, 'estimate', job.estimate ? money(job.estimate) : '')
      writeString(instance, 'status', job.status)
      writeBool(instance, 'selected', job.selected)
      writeColor(instance, 'chipColor', job.color)
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
    listJobs,
    moreItems,
  ])

  return (
    <div className="rive-host">
      <RiveComponent />
    </div>
  )
}
