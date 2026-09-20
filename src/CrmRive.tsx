import { useEffect } from 'react'
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModelInstanceEnum,
  useViewModelInstanceNumber,
  useViewModelInstanceTrigger,
  type ViewModelInstance,
} from '@rive-app/react-webgl2'
import {
  STAGE_COLOR,
  STAGE_HERO,
  STAGE_LABEL,
  counts,
  heroLine,
  money,
  nextAction,
  pipelineValue,
  type Lead,
  type Stage,
} from './crm'

const RIV = `${import.meta.env.BASE_URL}assets/landscape-crm.riv`

function isStage(value: string): value is Stage {
  return value === 'newLead' || value === 'estimateSent' || value === 'won'
}

function writeString(instance: ViewModelInstance, path: string, value: string) {
  const property = instance.string(path)
  if (property && property.value !== value) property.value = value
}

function writeLead(instance: ViewModelInstance, lead: Lead, selected: boolean) {
  writeString(instance, 'customerName', lead.customerName)
  writeString(instance, 'jobType', lead.jobType)
  writeString(instance, 'estimate', money(lead.estimate))
  writeString(instance, 'status', STAGE_LABEL[lead.status])
  writeString(instance, 'address', lead.address)
  const selectedProp = instance.boolean('selected')
  if (selectedProp && selectedProp.value !== selected) selectedProp.value = selected
  const color = instance.color('chipColor')
  if (color && color.value !== STAGE_COLOR[lead.status]) {
    color.value = STAGE_COLOR[lead.status]
  }
}

type Props = {
  leads: Lead[]
  selectedId: string
  pipeline: Stage
  toast: string
  onReady: () => void
  onError: () => void
  onSelectIndex: (index: number) => void
  onPipeline: (stage: Stage) => void
  onNewLead: () => void
  onSendEstimate: () => void
  onCall: () => void
}

export function CrmRive({
  leads,
  selectedId,
  pipeline,
  toast,
  onReady,
  onError,
  onSelectIndex,
  onPipeline,
  onNewLead,
  onSendEstimate,
  onCall,
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
  const { value: pipelineValueEnum } = useViewModelInstanceEnum('pipeline', vmi)

  useViewModelInstanceTrigger('fireNewLead', vmi, { onTrigger: onNewLead })
  useViewModelInstanceTrigger('fireSendEstimate', vmi, { onTrigger: onSendEstimate })
  useViewModelInstanceTrigger('fireCall', vmi, { onTrigger: onCall })

  useEffect(() => {
    if (selectedIndex == null || Number.isNaN(selectedIndex)) return
    const index = Math.round(selectedIndex)
    if (leads[index] && leads[index].id !== selectedId) {
      onSelectIndex(index)
    }
  }, [selectedIndex, leads, selectedId, onSelectIndex])

  useEffect(() => {
    if (!pipelineValueEnum || !isStage(pipelineValueEnum)) return
    if (pipelineValueEnum !== pipeline) onPipeline(pipelineValueEnum)
  }, [pipelineValueEnum, pipeline, onPipeline])

  useEffect(() => {
    if (!rive || !vmi) return

    const selected = leads.find((lead) => lead.id === selectedId) ?? leads[0]
    const tally = counts(leads)
    const selectedIndexValue = Math.max(
      0,
      leads.findIndex((lead) => lead.id === selectedId),
    )

    writeString(vmi, 'businessName', 'GreenField Landscapes')
    writeString(vmi, 'subtitle', 'Sales · Field CRM')
    writeString(vmi, 'toast', toast)
    writeString(vmi, 'pipelineValue', pipelineValue(leads))
    writeString(vmi, 'newCount', String(tally.newLead))
    writeString(vmi, 'estimateCount', String(tally.estimateSent))
    writeString(vmi, 'wonCount', String(tally.won))

    if (selected) {
      writeString(vmi, 'heroName', selected.customerName)
      writeString(vmi, 'heroJob', selected.jobType)
      writeString(vmi, 'heroEstimate', money(selected.estimate))
      writeString(vmi, 'heroStatus', STAGE_HERO[selected.status])
      writeString(vmi, 'heroAddress', heroLine(selected))
      writeString(vmi, 'heroNext', nextAction(selected.status))
      const chip = vmi.color('heroChipColor')
      if (chip) chip.value = STAGE_COLOR[selected.status]
    }

    const pipelineProp = vmi.enum('pipeline')
    if (pipelineProp && pipelineProp.value !== pipeline) {
      pipelineProp.value = pipeline
    }

    const tabNew = vmi.boolean('tabNew')
    const tabEstimate = vmi.boolean('tabEstimate')
    const tabWon = vmi.boolean('tabWon')
    if (tabNew) tabNew.value = pipeline === 'newLead'
    if (tabEstimate) tabEstimate.value = pipeline === 'estimateSent'
    if (tabWon) tabWon.value = pipeline === 'won'

    const indexProp = vmi.number('selectedIndex')
    if (indexProp && indexProp.value !== selectedIndexValue) {
      indexProp.value = selectedIndexValue
    }

    const list = vmi.list('leads')
    const leadVm = rive.viewModelByName('Lead')
    if (!list || !leadVm) return

    while (list.length > leads.length) {
      list.removeInstanceAt(list.length - 1)
    }
    while (list.length < leads.length) {
      list.addInstance(leadVm.instance())
    }

    leads.forEach((lead, index) => {
      const item = list.instanceAt(index)
      if (item) writeLead(item, lead, lead.id === selectedId)
    })
  }, [rive, vmi, leads, selectedId, pipeline, toast])

  return (
    <div className="rive-host">
      <RiveComponent />
    </div>
  )
}
