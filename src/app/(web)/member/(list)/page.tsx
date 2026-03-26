import { Box, Container, Heading, Stack, Skeleton } from '@chakra-ui/react'
import { Suspense } from 'react'
import MemberList from './_components/MemberList'

export const metadata = {
  title: '회원 목록 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임 회원 목록을 확인합니다.',
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

function MemberListFallback() {
  return (
    <>
      <Box>
        <Stack gap={3}>
          {Array.from({ length: 3 }).map((_, index) => (
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

export default async function ManagementMemberPage({
  searchParams,
}: PageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1

  return (
    <Container maxW="container.xl" py={10}>
      <Stack gap={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="2xl">회원 목록</Heading>
        </Box>

        <Suspense key={currentPage} fallback={<MemberListFallback />}>
          <MemberList currentPage={currentPage} />
        </Suspense>
      </Stack>
    </Container>
  )
}
