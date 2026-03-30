import { Box, Container, Stack } from '@chakra-ui/react'
import { BBS_TYPE } from '@/constants'
import { getEventList } from '@/domains/event'
import type { EventWithHost } from '@/domains/event/event.model'
import { getPostList } from '@/domains/post'
import type { PostListItem } from '@/domains/post'
import BottomCtaSection from './_components/BottomCtaSection'
import CommunityNoticeSection from './_components/CommunityNoticeSection'
import FaqSection from './_components/FaqSection'
import HeroSection from './_components/HeroSection'
import IntroGuideSection from './_components/IntroGuideSection'
import { getUpcomingEvents } from './_components/home.utils'

export default async function Home() {
  const [eventResult, noticeResult] = await Promise.all([
    getEventList(1, 100),
    getPostList(BBS_TYPE.NOTICE, 1, 3),
  ])

  const events: EventWithHost[] = eventResult.events
  const notices: PostListItem[] = noticeResult.list

  const heroEvents = getUpcomingEvents(events, 2)

  return (
    <Box bg="fullcourt.pageBg">
      <HeroSection heroEvents={heroEvents} />

      <Container maxW="container.xl" py={{ base: 12, md: 16 }}>
        <Stack gap={14}>
          <IntroGuideSection />
          <CommunityNoticeSection notices={notices} />
          <FaqSection />
        </Stack>
      </Container>

      <BottomCtaSection />
    </Box>
  )
}
