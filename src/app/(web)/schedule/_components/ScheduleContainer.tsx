'use client'

import { useState, useCallback } from 'react'
import { Box, Flex, Tabs } from '@chakra-ui/react'
import { LuCalendar, LuMapPin } from 'react-icons/lu'
import { useEvents, toCalendarEvent } from '@/hooks/useEvent'
import type { CalendarEvent } from '@/hooks/useEvent'
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleList from './ScheduleList'
import CourtReservation from './CourtReservation'

interface ScheduleContainerProps {
  initialEvents: CalendarEvent[]
}

export default function ScheduleContainer({
  initialEvents,
}: ScheduleContainerProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })
  const [calendarKey, setCalendarKey] = useState(0)

  const { data: fetchedEvents } = useEvents(1, 100, currentMonth)
  const events = fetchedEvents
    ? fetchedEvents.map(toCalendarEvent)
    : initialEvents

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth({ year, month })
  }, [])

  const handleTabChange = (details: { value: string }) => {
    if (details.value === 'schedule') {
      setCalendarKey((prev) => prev + 1)
    }
  }

  return (
    <Box p={4}>
      <Tabs.Root defaultValue="schedule" variant="line" lazyMount unmountOnExit onValueChange={handleTabChange}>
        <Tabs.List mb={4}>
          <Tabs.Trigger value="schedule">
            <LuCalendar />
            일정
          </Tabs.Trigger>
          <Tabs.Trigger value="court">
            <LuMapPin />
            코트예약
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="schedule">
          <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
            <Box flex={3}>
              <ScheduleCalendar
                key={calendarKey}
                initialEvents={events}
                onMonthChange={handleMonthChange}
              />
            </Box>
            <Box flex={1}>
              <ScheduleList events={events} currentMonth={currentMonth} />
            </Box>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="court">
          <CourtReservation />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
