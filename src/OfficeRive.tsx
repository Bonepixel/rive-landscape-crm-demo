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
  ROLES,
  STAGE_COLOR,
  STAGE_LABEL,
  daysWithJobs,
  deriveKpis,
  derivePills,
  heroMeta,
  jobsForRole,
  money,
  nextAction,
  pipelineCounts,
  roleCopy,
  roleIndex,
  type Job,
  type Role,
  type ScheduleDay,
} from './office'

const RIV = `${import.meta.env.BASE_URL}assets/landscape-crm.riv`

const NAV = [
  'navIntake',
  'navSales',
  'navScheduler',
  'navAdmin',
  'navOwner',
  'navForeman',
  'navWorkers',
] as const

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

type Props = {
  jobs: Job[]
  days: ScheduleDay[]
  selectedId: string
  selectedDayId: string
  role: Role
  toast: string
  darkMode: boolean
  burst: number
  onReady: () => void
  onError: () => void
  onSelectJobIndex: (index: number) => void
  onSelectDayIndex: (index: number) => void
  onRoleIndex: (index: number) => void
  onPrimary: () => void
  onSecondary: () => void
}

export function OfficeRive({
  jobs,
  days,
  selectedId,
  selectedDayId,
  role,
  toast,
  darkMode,
  burst,
  onReady,
  onError,
  onSelectJobIndex,
  onSelectDayIndex,
  onRoleIndex,
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
  const { value: nextRoleIndex } = useViewModelInstanceNumber('roleIndex', vmi)
  const { value: dayIndex } = useViewModelInstanceNumber('dayIndex', vmi)

  useViewModelInstanceTrigger('primaryBtn/fire', vmi, { onTrigger: onPrimary })
  useViewModelInstanceTrigger('secondaryBtn/fire', vmi, { onTrigger: onSecondary })

  const roleJobs = jobsForRole(jobs, role)
  const visibleJobs = role === 'owner' || role === 'scheduler' ? [] : roleJobs
  const visibleDays = role === 'scheduler' ? days : []
  const visibleKpis = role === 'owner' ? deriveKpis(jobs) : []
  const visiblePills = role === 'admin' ? derivePills(jobs) : []

  useEffect(() => {
    if (selectedIndex == null || Number.isNaN(selectedIndex)) return
    const index = Math.round(selectedIndex)
    if (!visibleJobs[index]) return
    if (visibleJobs[index].id !== selectedId) onSelectJobIndex(index)
  }, [selectedIndex, visibleJobs, selectedId, onSelectJobIndex])

  useEffect(() => {
    if (nextRoleIndex == null || Number.isNaN(nextRoleIndex)) return
    const index = Math.round(nextRoleIndex)
    if (ROLES[index] && ROLES[index].id !== role) onRoleIndex(index)
  }, [nextRoleIndex, role, onRoleIndex])

  useEffect(() => {
    if (dayIndex == null || Number.isNaN(dayIndex)) return
    const index = Math.round(dayIndex)
    if (days[index] && days[index].id !== selectedDayId) onSelectDayIndex(index)
  }, [dayIndex, days, selectedDayId, onSelectDayIndex])

  const lastRole = useRef<Role | null>(null)
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
    const kpis = vmi.list('kpis')
    const pills = vmi.list('pills')
    if (kpis) {
      for (let i = 0; i < kpis.length; i += 1) kpis.instanceAt(i)?.trigger('tick')?.trigger()
    }
    if (pills) {
      for (let i = 0; i < pills.length; i += 1) pills.instanceAt(i)?.trigger('tick')?.trigger()
    }
  }, [burst, vmi])

  useEffect(() => {
    if (!rive || !vmi) return

    const copy = roleCopy(role, jobs)
    const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0]
    const counts = pipelineCounts(jobs)
    const selectedIndexValue = Math.max(
      0,
      visibleJobs.findIndex((job) => job.id === selectedId),
    )
    const dayIndexValue = Math.max(
      0,
      days.findIndex((day) => day.id === selectedDayId),
    )

    writeString(vmi, 'businessName', 'OdinOps')
    writeString(vmi, 'subtitle', copy.subtitle)
    writeString(vmi, 'toast', toast)
    writeString(vmi, 'panelTitle', copy.panelTitle)
    writeString(vmi, 'panelHint', copy.panelHint)
    writeString(vmi, 'pipelineValue', copy.pipelineValue)
    writeBool(vmi, 'darkMode', darkMode)
    writeNumber(vmi, 'roleIndex', roleIndex(role))
    writeNumber(vmi, 'selectedIndex', selectedIndexValue)
    writeNumber(vmi, 'dayIndex', dayIndexValue)

    const session = vmi.viewModel('session')
    const roleEnum = session?.enum('activeRole')
    if (roleEnum && roleEnum.value !== role) roleEnum.value = role

    const pipeline = vmi.viewModel('pipeline')
    if (pipeline) {
      writeString(pipeline, 'newCount', String(counts.newLead + counts.inquiry))
      writeString(pipeline, 'estimateCount', String(counts.estimateSent))
      writeString(pipeline, 'wonCount', String(counts.won))
      writeString(pipeline, 'scheduledCount', String(counts.scheduled + counts.inProgress))
    }

    const kpisModel = vmi.viewModel('kpisModel')
    if (kpisModel) {
      const tiles = deriveKpis(jobs)
      writeString(kpisModel, 'openJobs', tiles[0].value)
      writeString(kpisModel, 'wonValue', tiles[1].value)
      writeString(kpisModel, 'scheduled', tiles[2].value)
      writeString(kpisModel, 'crewOut', tiles[3].value)
      writeString(kpisModel, 'intakeToday', String(counts.inquiry))
    }

    writeString(vmi, 'primaryBtn/label', copy.primary)
    writeBool(vmi, 'primaryBtn/primary', true)
    writeString(vmi, 'secondaryBtn/label', copy.secondary)
    writeBool(vmi, 'secondaryBtn/primary', false)

    NAV.forEach((path, index) => {
      writeString(vmi, `${path}/label`, ROLES[index].label)
      writeBool(vmi, `${path}/selected`, ROLES[index].id === role)
      writeNumber(vmi, `${path}/index`, index)
    })

    if (selected) {
      writeString(vmi, 'heroName', selected.customerName)
      writeString(vmi, 'heroJob', `${selected.jobType} · ${money(selected.estimate)}`)
      writeString(vmi, 'heroMeta', heroMeta(selected))
      writeString(vmi, 'heroNext', nextAction(selected, role))
      writeString(vmi, 'heroChip', STAGE_LABEL[selected.status])
      writeColor(vmi, 'heroChipColor', STAGE_COLOR[selected.status])
    }

    syncList(rive, vmi, 'jobs', 'Job', visibleJobs.length, (instance, index) => {
      const job = visibleJobs[index]
      writeString(instance, 'customerName', job.customerName)
      writeString(instance, 'jobType', job.jobType)
      writeString(instance, 'estimate', money(job.estimate))
      writeString(instance, 'status', STAGE_LABEL[job.status])
      writeString(instance, 'address', job.address)
      writeBool(instance, 'selected', job.id === selectedId)
      writeColor(instance, 'chipColor', STAGE_COLOR[job.status])
    })

    const dayRows = daysWithJobs(visibleDays, jobs)
    syncList(rive, vmi, 'days', 'ScheduleDay', dayRows.length, (instance, index) => {
      const day = dayRows[index]
      writeString(instance, 'day', day.day)
      writeString(instance, 'slot', day.slot)
      writeString(instance, 'jobTitle', day.title)
      writeString(instance, 'crew', day.crew)
      writeBool(instance, 'highlighted', day.id === selectedDayId && Boolean(day.jobId))
      writeBool(instance, 'selected', day.id === selectedDayId)
    })

    syncList(rive, vmi, 'kpis', 'KpiTile', visibleKpis.length, (instance, index) => {
      const tile = visibleKpis[index]
      writeString(instance, 'label', tile.label)
      writeString(instance, 'value', tile.value)
      writeColor(instance, 'accent', tile.accent)
      writeBool(instance, 'selected', index === selectedIndexValue)
    })

    syncList(rive, vmi, 'pills', 'Pill', visiblePills.length, (instance, index) => {
      const pill = visiblePills[index]
      writeString(instance, 'label', pill.label)
      writeColor(instance, 'color', pill.color)
    })
  }, [
    rive,
    vmi,
    jobs,
    days,
    selectedId,
    selectedDayId,
    role,
    toast,
    darkMode,
    visibleJobs,
    visibleDays,
    visibleKpis,
    visiblePills,
  ])

  return (
    <div className="rive-host">
      <RiveComponent />
    </div>
  )
}
