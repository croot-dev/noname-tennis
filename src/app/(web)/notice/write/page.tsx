import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import NoticeForm from './_components/NoticeForm'

export const metadata = {
  title: '공지사항 작성 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임 공지사항을 작성합니다.',
}

function NoticeFormFallback() {
  return (
    <Stack gap={6}>
      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="40px" />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="300px" />
      </Box>

      <Box display="flex" gap={3} justifyContent="flex-end">
        <Skeleton height="40px" width="80px" />
        <Skeleton height="40px" width="100px" />
      </Box>
    </Stack>
  )
}

export default function NoticeWritePage() {
  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Heading size="2xl">공지사항 작성</Heading>

        <Suspense fallback={<NoticeFormFallback />}>
          <NoticeForm />
        </Suspense>
      </Stack>
    </Container>
  )
}
