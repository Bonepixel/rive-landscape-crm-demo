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
  MORE_NAV,
  ROLE_LABEL,
  SEATS,
  flowLabel,
  homeLens,
  homeSubtitle,
  homeTitle,
  jobCta,
  kindArgb,
  kindLabel,
  kindNote,
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
    const selected = allJobs.find((job) => job.id === selectedId) ?? allJobs[0]
    const seat = SEATS.find((item) => item.role === role)
    const cta = selected ? jobCta(selected, role) : null
    const selectedIndexValue = Math.max(0, listJobs.findIndex((job) => job.id === selectedId))

    writeString(vmi, 'businessName', 'OdinOps')
    writeString(vmi, 'subtitle', `${ROLE_LABEL[role]} · ${seat?.name ?? ''}`)
    writeString(vmi, 'toast', toast)
    writeString(vmi, 'panelTitle', tab === 'alerts' ? 'Alerts' : tab === 'create' ? 'Create' : tab === 'more' ? 'More' : homeTitle(lens))
    writeString(vmi, 'panelHint', tab === 'home' ? homeSubtitle(lens) : `/${tab}`)
    writeString(vmi, 'pipelineValue', `${lens} · ${widgets.map((widget) => `${widget.label} ${widget.count}`).join(' · ')}`)
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

    writeString(vmi, 'primaryBtn/label', tab === 'create' ? 'New estimate' : tab === 'more' && moreRoute ? 'Open jobs' : (cta?.primary ?? 'Open'))
    writeBool(vmi, 'primaryBtn/primary', true)
    writeString(vmi, 'secondaryBtn/label', tab === 'create' ? 'New service' : tab === 'more' && moreRoute ? 'Back to More' : (cta?.secondary ?? 'Notes'))
    writeBool(vmi, 'secondaryBtn/primary', false)

    NAV.forEach((path, index) => {
      writeString(vmi, `${path}/label`, DOCK[index]?.label ?? '')
      writeBool(vmi, `${path}/selected`, DOCK[index]?.id === tab)
      writeNumber(vmi, `${path}/index`, index)
    })

    const moreItem = moreRoute ? MORE_NAV.find((item) => item.route === moreRoute) : null
    if (tab === 'create') {
      writeString(vmi, 'heroName', 'Create')
      writeString(vmi, 'heroJob', 'Estimate · Site visit / quote')
      writeString(vmi, 'heroMeta', 'Service · Install / service call')
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
      writeString(vmi, 'heroNext', cta?.attention ?? kindNote(selected))
      writeString(vmi, 'heroChip', flowLabel(selected))
      writeColor(vmi, 'heroChipColor', kindArgb(selected))
    }

    const quote = vmi.viewModel('quote')
    if (quote && selected) {
      writeString(quote, 'customerName', selected.customerName)
      writeString(quote, 'amount', money(selected.estimate))
      writeString(quote, 'step', flowLabel(selected))
    }

    const rows = tab === 'alerts'
      ? alerts.map((alert) => ({
          id: alert.id,
          customerName: alert.title,
          title: alert.detail,
          estimate: 0,
          step: 'request' as const,
          kind: 'estimate' as const,
          address: '',
          note: '',
          crew: '',
          day: '',
          slot: '',
          assignee: '',
          signed: false,
          depositPaid: false,
        }))
      : tab === 'more'
        ? moreItems.map((item) => ({
            id: item.route,
            customerName: item.label,
            title: `${item.href} · ${item.hint}`,
            estimate: 0,
            step: 'request' as const,
            kind: 'estimate' as const,
            address: '',
            note: '',
            crew: '',
            day: '',
            slot: '',
            assignee: '',
            signed: false,
            depositPaid: false,
          }))
        : listJobs

    syncList(rive, vmi, 'jobs', 'Job', rows.length, (instance, index) => {
      const job = rows[index]
      writeString(instance, 'customerName', job.customerName)
      writeString(instance, 'jobType', 'title' in job ? job.title : '')
      writeString(instance, 'estimate', job.estimate ? money(job.estimate) : '')
      writeString(instance, 'status', 'step' in job ? flowLabel(job as Job) : '')
      writeString(instance, 'address', job.address)
      writeBool(instance, 'selected', job.id === selectedId)
      writeColor(instance, 'chipColor', 'kind' in job ? kindArgb(job as Job) : 0xff2eebfa)
    })

    const showKpis = tab === 'home' && lens === 'pulse'
    syncList(rive, vmi, 'kpis', 'KpiTile', showKpis ? kpis.length : 0, (instance, index) => {
      const tile = kpis[index]
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
