'use client'

import { Box, Button } from '@chakra-ui/react'
import Link from 'next/link'
import { useUserInfo } from '@/hooks/useAuth'

interface NoticeActionsProps {
  postId: number
  writerId: number
}

export default function NoticeActions({
  postId,
  writerId,
}: NoticeActionsProps) {
  const { data: user } = useUserInfo()
  const isAuthor = user?.seq === writerId

  if (!isAuthor) {
    return null
  }

  return (
    <Box display="flex" gap={3}>
      <Link href={`/notice/write?edit=${postId}`}>
        <Button colorScheme="blue">수정</Button>
      </Link>
      <Button colorScheme="red" variant="outline">
        삭제
      </Button>
    </Box>
  )
}
