import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import BlindList from './_components/BlindList'
import BlindWriteButton from './_components/BlindWriteButton'

export const metadata = {
  title: '블라인드 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임의 블라인드 글을 확인하세요.',
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

function BlindListFallback() {
  return (
    <>
      <Box>
        <Stack gap={3}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} height="60px" />
          ))}
        </Stack>
      </Box>
      <Box display="flex" justifyContent="center" gap={2} mt={6}>
        <Skeleton height="40px" width="200px" />
      </Box>
    </>
  )
}

export default async function BlindListPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1

  return (
    <Container maxW="container.xl" py={10}>
      <Stack gap={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="2xl">블라인드</Heading>
          <BlindWriteButton />
        </Box>

        <Suspense key={currentPage} fallback={<BlindListFallback />}>
          <BlindList currentPage={currentPage} />
        </Suspense>
      </Stack>
    </Container>
  )
}
