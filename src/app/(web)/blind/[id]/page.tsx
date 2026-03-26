import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import BlindRead from './_components/BlindRead'

export const metadata = {
  title: '블라인드 상세 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임 블라인드 상세내용을 조회합니다.',
}

interface PageProps {
  params: Promise<{ id: string }>
}

function BlindReadFallback() {
  return (
    <Stack gap={6}>
      <Box>
        <Skeleton height="20px" width="300px" mb={4} />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="40px" />
      </Box>

      <Box>
        <Skeleton height="20px" width="60px" mb={2} />
        <Skeleton height="300px" />
      </Box>

      <Box display="flex" gap={3} justifyContent="space-between">
        <Skeleton height="40px" width="100px" />
        <Box display="flex" gap={3}>
          <Skeleton height="40px" width="80px" />
          <Skeleton height="40px" width="80px" />
        </Box>
      </Box>
    </Stack>
  )
}

export default async function BlindReadPage({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id)

  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Heading size="2xl">블라인드</Heading>

        <Suspense fallback={<BlindReadFallback />}>
          <BlindRead postId={postId} />
        </Suspense>
      </Stack>
    </Container>
  )
}
