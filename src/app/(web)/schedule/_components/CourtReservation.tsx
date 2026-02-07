'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Text,
  Stack,
  Card,
  Link,
  Spinner,
  Flex,
} from '@chakra-ui/react'
import { LuCalendarCheck2, LuMapPin } from 'react-icons/lu'
import NaverMap from '@/components/common/NaverMap'
import { useCourts } from '@/hooks/useCourt'
import type { TennisCourt } from '@/domains/court/court.model'

const CourtLocationType = Object.freeze({
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
} as const)

type CourtLocationType =
  (typeof CourtLocationType)[keyof typeof CourtLocationType]

export interface Court {
  id: number | string
  name: string
  locationType: CourtLocationType
  url?: string
  naverPid?: string
}

function toCourtView(court: TennisCourt): Court {
  const naverPid = court.naver_place_id || undefined
  const url =
    court.rsv_url ||
    (naverPid ? `https://map.naver.com/p/entry/place/${naverPid}` : undefined)

  return {
    id: court.court_id,
    name: court.name,
    locationType: court.is_indoor
      ? CourtLocationType.INDOOR
      : CourtLocationType.OUTDOOR,
    url,
    naverPid,
  }
}

const CourtLocationTypeLabels: Record<CourtLocationType, string> = {
  indoor: '실내 코트',
  outdoor: '야외 코트',
}

function CourtCard({
  info,
  isSelected,
  onSelect,
}: {
  info: Court
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <Card.Root
      borderColor={isSelected ? 'teal.500' : undefined}
      borderWidth={isSelected ? '2px' : '1px'}
      _hover={{ shadow: 'md', borderColor: 'teal.500' }}
      transition="all 0.2s"
      onClick={onSelect}
    >
      <Card.Body padding={3}>
        <Stack gap={2}>
          <Stack direction="row" justify="space-between" align="center">
            <Stack direction="row" justify="space-between" align="center">
              <LuMapPin
                color={
                  isSelected ? 'var(--chakra-colors-teal-500' : undefined
                }
              />
              <Text fontWeight="medium">{info.name}</Text>
            </Stack>
            <Stack direction="row" gap={2}>
              <Link
                href={
                  info.naverPid
                    ? `https://map.naver.com/p/entry/place/${info.naverPid}?placePath=/ticket`
                    : info.url
                }
                target="_blank"
                rel="noopener noreferrer"
                color="gray.500"
                _hover={{ color: 'teal.600' }}
                padding={2}
              >
                <LuCalendarCheck2 />
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}

export default function CourtReservation() {
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const { data, isLoading } = useCourts(1, 100)

  const courts = useMemo(() => {
    if (!data?.courts) return []
    return data.courts.map(toCourtView)
  }, [data?.courts])

  const indoorCourts = courts.filter((court) => court.locationType === 'indoor')
  const outdoorCourts = courts.filter(
    (court) => court.locationType === 'outdoor',
  )

  const handleSelect = (court: Court) => {
    if (selectedCourt?.id === court.id) {
      setSelectedCourt(null)
    } else {
      setSelectedCourt(court)
    }
  }

  return (
    <Stack gap={6}>
      <Box>
        <NaverMap courts={courts} selectedCourt={selectedCourt} />
      </Box>

      {isLoading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {indoorCourts.length > 0 && (
            <Stack gap={3}>
              <Text fontWeight="bold" color="gray.700">
                {CourtLocationTypeLabels.indoor}
              </Text>
              <Stack gap={2}>
                {indoorCourts.map((court) => (
                  <CourtCard
                    key={court.id}
                    info={court}
                    isSelected={selectedCourt?.id === court.id}
                    onSelect={() => handleSelect(court)}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {outdoorCourts.length > 0 && (
            <Stack gap={3}>
              <Text fontWeight="bold" color="gray.700">
                {CourtLocationTypeLabels.outdoor}
              </Text>
              <Stack gap={2}>
                {outdoorCourts.map((court) => (
                  <CourtCard
                    key={court.id}
                    info={court}
                    isSelected={selectedCourt?.id === court.id}
                    onSelect={() => handleSelect(court)}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {courts.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">등록된 코트가 없습니다.</Text>
            </Box>
          )}
        </>
      )}
    </Stack>
  )
}
