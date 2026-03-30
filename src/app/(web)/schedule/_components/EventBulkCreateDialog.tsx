'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useCreateEvent } from '@/hooks/useEvent'
import { useCourts } from '@/hooks/useCourt'
import { toaster } from '@/components/ui/toaster'

interface EventBulkCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ParsedEventLine = {
  date: string
  title: string
  startTime: string
  endTime: string
  locationInput: string
  courtNumber?: number
  maxParticipants: number
  locationUrl?: string
}

type PreviewEventLine = {
  date: string
  title: string
  startTime: string
  endTime: string
  locationName: string
  courtNumber?: number
  maxParticipants: number
  locationUrl?: string
  locationSource: 'code' | 'name' | 'manual'
}

type DialogMode = 'edit' | 'preview'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false
  }

  const parsed = new Date(`${date}T00:00:00+09:00`)
  return !Number.isNaN(parsed.getTime())
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase()
}

function buildDefaultTitle(locationName: string): string {
  return `${locationName} 테니스`
}

function parseLine(line: string, lineNumber: number): ParsedEventLine {
  const parts = line.split('|').map((part) => part.trim())

  // 초간단 권장 포맷:
  // 날짜|시작|종료|장소(코드/이름[#코트번호])|인원|제목(선택)|장소URL(선택)
  // ex) 2026-04-02|19:00|21:00|A1#2|8|목요 저녁 게임
  const isCompactFormat = parts.length >= 5 && TIME_PATTERN.test(parts[1] || '')

  let date = ''
  let title = ''
  let startTime = ''
  let endTime = ''
  let locationInput = ''
  let courtNumberRaw: string | undefined
  let maxParticipantsRaw = ''
  let locationUrlRaw: string | undefined

  if (isCompactFormat) {
    ;[date, startTime, endTime] = parts

    const locationToken = parts[3]
    maxParticipantsRaw = parts[4]
    title = parts[5] || ''
    locationUrlRaw = parts[6]

    const [baseLocation, inlineCourtNumber] = locationToken.split('#')
    locationInput = (baseLocation || '').trim()
    courtNumberRaw = (inlineCourtNumber || '').trim() || undefined
  } else {
    if (parts.length < 6) {
      throw new Error(
        `${lineNumber}번째 줄 형식이 올바르지 않습니다. (날짜|시작|종료|장소|인원)`,
      )
    }

    // 기존 포맷(하위 호환)
    ;[date, title, startTime, endTime] = parts

    if (parts.length >= 9) {
      const courtCodeInput = parts[4]
      const locationNameInput = parts[5]
      courtNumberRaw = parts[6]
      maxParticipantsRaw = parts[7]
      locationUrlRaw = parts[8]
      locationInput = courtCodeInput || locationNameInput
    } else if (parts.length >= 8) {
      const courtCodeInput = parts[4]
      const locationNameInput = parts[5]
      maxParticipantsRaw = parts[6]
      locationUrlRaw = parts[7]
      locationInput = courtCodeInput || locationNameInput
    } else {
      locationInput = parts[4]
      maxParticipantsRaw = parts[5]
      locationUrlRaw = parts[6]
    }
  }

  if (!isValidDateString(date)) {
    throw new Error(
      `${lineNumber}번째 줄 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)`,
    )
  }

  if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
    throw new Error(
      `${lineNumber}번째 줄 시간 형식이 올바르지 않습니다. (HH:mm)`,
    )
  }

  if (!locationInput) {
    throw new Error(`${lineNumber}번째 줄 장소(또는 코드)를 입력해주세요.`)
  }

  const maxParticipants = Number(maxParticipantsRaw)
  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
    throw new Error(`${lineNumber}번째 줄 인원은 1 이상의 정수여야 합니다.`)
  }

  let courtNumber: number | undefined
  if (courtNumberRaw && courtNumberRaw.trim() !== '') {
    const parsedCourtNumber = Number(courtNumberRaw)
    if (!Number.isInteger(parsedCourtNumber) || parsedCourtNumber < 1) {
      throw new Error(
        `${lineNumber}번째 줄 코트번호는 1 이상의 정수여야 합니다.`,
      )
    }
    courtNumber = parsedCourtNumber
  }

  return {
    date,
    title,
    startTime,
    endTime,
    locationInput,
    courtNumber,
    maxParticipants,
    locationUrl: locationUrlRaw || undefined,
  }
}

function toIsoDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00+09:00`).toISOString()
}

export default function EventBulkCreateDialog({
  open,
  onOpenChange,
}: EventBulkCreateDialogProps) {
  const createEvent = useCreateEvent()
  const { data: courtsData } = useCourts(1, 100)

  const [bulkText, setBulkText] = useState('')
  const [mode, setMode] = useState<DialogMode>('edit')
  const [previewEvents, setPreviewEvents] = useState<PreviewEventLine[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const courtCodeEntries = useMemo(() => {
    const courts = courtsData?.courts || []
    return courts.map((court, index) => ({
      code: `A${index + 1}`,
      name: court.name,
      normalizedName: normalizeText(court.name),
      locationUrl:
        court.rsv_url ||
        (court.naver_place_id
          ? `https://map.naver.com/p/entry/place/${court.naver_place_id}`
          : undefined),
    }))
  }, [courtsData])

  const lineCount = useMemo(
    () =>
      bulkText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean).length,
    [bulkText],
  )

  const resetDialog = () => {
    setBulkText('')
    setPreviewEvents([])
    setMode('edit')
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetDialog()
    onOpenChange(false)
  }

  const resolveLocation = (locationInput: string, inputUrl?: string) => {
    const normalizedInput = normalizeText(locationInput)
    const matchedByCode = courtCodeEntries.find(
      (entry) => entry.code.toLowerCase() === locationInput.toLowerCase(),
    )

    if (matchedByCode) {
      return {
        locationName: matchedByCode.name,
        locationUrl: inputUrl || matchedByCode.locationUrl,
        locationSource: 'code' as const,
      }
    }

    const matchedByName = courtCodeEntries.find(
      (entry) => entry.normalizedName === normalizedInput,
    )

    if (matchedByName) {
      return {
        locationName: matchedByName.name,
        locationUrl: inputUrl || matchedByName.locationUrl,
        locationSource: 'name' as const,
      }
    }

    return {
      locationName: locationInput,
      locationUrl: inputUrl,
      locationSource: 'manual' as const,
    }
  }

  const buildPreview = () => {
    const lines = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length === 0) {
      toaster.error({ title: '최소 1줄 이상 입력해주세요.' })
      return
    }

    const parsedEvents: ParsedEventLine[] = []

    try {
      lines.forEach((line, index) => {
        parsedEvents.push(parseLine(line, index + 1))
      })
    } catch (error) {
      toaster.error({
        title:
          error instanceof Error
            ? error.message
            : '입력값 형식이 올바르지 않습니다.',
      })
      return
    }

    const preview = parsedEvents.map((item) => {
      const resolved = resolveLocation(item.locationInput, item.locationUrl)
      return {
        date: item.date,
        title: item.title || buildDefaultTitle(resolved.locationName),
        startTime: item.startTime,
        endTime: item.endTime,
        locationName: resolved.locationName,
        courtNumber: item.courtNumber,
        maxParticipants: item.maxParticipants,
        locationUrl: resolved.locationUrl,
        locationSource: resolved.locationSource,
      }
    })

    setPreviewEvents(preview)
    setMode('preview')
  }

  const handleSubmit = async () => {
    if (previewEvents.length === 0) {
      toaster.error({ title: '요약 정보가 없습니다. 다시 시도해주세요.' })
      return
    }

    setIsSubmitting(true)
    try {
      for (const eventLine of previewEvents) {
        const locationWithCourt = eventLine.courtNumber
          ? `${eventLine.locationName} ${eventLine.courtNumber}번 코트`
          : eventLine.locationName

        await createEvent.mutateAsync({
          title: eventLine.title,
          description: '',
          start_datetime: toIsoDateTime(eventLine.date, eventLine.startTime),
          end_datetime: toIsoDateTime(eventLine.date, eventLine.endTime),
          location_name: locationWithCourt,
          location_url: eventLine.locationUrl,
          max_participants: eventLine.maxParticipants,
        })
      }

      toaster.success({ title: `${previewEvents.length}개 일정이 등록되었습니다.` })
      handleClose()
    } catch {
      toaster.error({ title: '일괄 등록 중 오류가 발생했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sourceLabel = (source: PreviewEventLine['locationSource']) => {
    if (source === 'code') return '코드 매핑'
    if (source === 'name') return '이름 매핑'
    return '직접 입력'
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (e.open) {
          onOpenChange(true)
        } else {
          handleClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            width={{ base: 'calc(100vw - 16px)', md: '640px' }}
            maxW={{ base: 'calc(100vw - 16px)', md: '640px' }}
            mx={2}
          >
            <Dialog.Header>
              <Dialog.Title>
                {mode === 'edit' ? '일괄 일정 등록' : '등록 전 요약 확인'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body p={3}>
              {mode === 'edit' ? (
                <Stack gap={2}>
                  <Text fontSize="xs" color="fg.muted">
                    한 줄에 한 일정씩 입력하세요.
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    형식(권장): 날짜|시작|종료|장소(코드/이름#코트번호)|인원|제목(선택)|장소URL(선택)
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    예시: 2026-04-02|19:00|21:00|A1#2|8|목요 저녁 게임
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    (호환) 날짜|제목|시작|종료|장소(코드/이름)|인원|URL 형식도 사용 가능
                  </Text>

                  <Box borderWidth="1px" borderRadius="md" p={2}>
                    <Text fontSize="xs" fontWeight="medium" mb={1}>
                      코트 코드표
                    </Text>
                    <Box maxH="84px" overflowY="auto">
                      {courtCodeEntries.length === 0 ? (
                        <Text fontSize="xs" color="fg.muted">
                          등록된 코트가 없습니다.
                        </Text>
                      ) : (
                        <Stack gap={1}>
                          {courtCodeEntries.map((entry) => (
                            <Text key={entry.code} fontSize="xs" fontFamily="mono">
                              {entry.code} = {entry.name}
                            </Text>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Box>

                  <Textarea
                    size="sm"
                    rows={9}
                    placeholder={[
                      '2026-04-02|19:00|21:00|A1#2|8|목요 저녁 게임',
                      '2026-04-04|08:00|10:00|A3#1|6|',
                    ].join('\n')}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />

                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="fg.muted">
                      입력된 일정: {lineCount}개
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        setBulkText((prev) =>
                          prev
                            ? `${prev}\n${new Date().toISOString().slice(0, 10)}|09:00|11:00|A1#1|8|`
                            : `${new Date().toISOString().slice(0, 10)}|09:00|11:00|A1#1|8|`,
                        )
                      }
                      disabled={isSubmitting}
                    >
                      템플릿 한 줄 추가
                    </Button>
                  </Flex>
                </Stack>
              ) : (
                <Stack gap={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    총 {previewEvents.length}개 일정이 등록됩니다.
                  </Text>
                  <Box borderWidth="1px" borderRadius="md" p={2} maxH="320px" overflowY="auto">
                    <Stack gap={2}>
                      {previewEvents.map((item, index) => (
                        <Box key={`${item.date}-${item.startTime}-${index}`} borderBottomWidth="1px" pb={2}>
                          <Text fontSize="xs" fontWeight="medium">
                            {index + 1}. {item.date} {item.startTime}-{item.endTime}
                          </Text>
                          <Text fontSize="xs">제목: {item.title}</Text>
                          <Text fontSize="xs">
                            장소: {item.locationName} ({sourceLabel(item.locationSource)})
                          </Text>
                          {item.courtNumber && (
                            <Text fontSize="xs">코트번호: {item.courtNumber}번</Text>
                          )}
                          <Text fontSize="xs">인원: {item.maxParticipants}명</Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </Dialog.Body>
            <Dialog.Footer
              display="flex"
              flexDirection="row"
              gap={2}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
            >
              {mode === 'edit' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    width="auto"
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="blue"
                    onClick={buildPreview}
                    disabled={isSubmitting}
                    width="auto"
                  >
                    요약 보기
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMode('edit')}
                    disabled={isSubmitting}
                    width="auto"
                  >
                    수정으로 돌아가기
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="blue"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    width="auto"
                  >
                    최종 등록
                  </Button>
                </>
              )}
            </Dialog.Footer>
            <Dialog.CloseTrigger disabled={isSubmitting} />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
