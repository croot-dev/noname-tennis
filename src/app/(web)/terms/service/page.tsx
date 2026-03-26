import { Box, Container, Heading, Stack } from '@chakra-ui/react'
import styles from '../terms.module.css'

export const metadata = {
  title: '이용약관 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임의 이용약관입니다.',
}

export default function ServiceTermsPage() {
  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Heading size="2xl">이용약관</Heading>

        <Stack gap={6}>
          <Box className={styles.termsContent}>
            <p>
              본 약관은 <strong>풀코트 테니스 모임</strong>(이하
              &ldquo;NTG&rdquo;)이 제공하는 테니스 모임 관리 서비스의 이용과
              관련하여 회원과 운영자 간의 권리·의무 및 책임사항을 규정함을
              목적으로 합니다.
            </p>

            <Heading as="h3" size="lg" mb={2}>
              제1조 (회원가입)
            </Heading>
            <p>
              회원은 서비스에서 정한 절차에 따라 회원가입을 완료함으로써 본
              약관에 동의한 것으로 봅니다.
            </p>

            <Heading as="h3" size="lg" mb={2}>
              제2조 (서비스 내용)
            </Heading>
            <ul>
              <li>테니스 모임 참가자 관리</li>
              <li>모임 일정 및 출석 관리</li>
              <li>모임 관련 공지 및 안내</li>
            </ul>

            <Heading as="h3" size="lg" mb={2}>
              제3조 (회원의 의무)
            </Heading>
            <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul>
              <li>허위 정보 입력</li>
              <li>타인의 개인정보 도용</li>
              <li>서비스 운영을 방해하는 행위</li>
            </ul>

            <Heading as="h3" size="lg" mb={2}>
              제4조 (서비스 이용 제한)
            </Heading>
            <p>
              운영자는 회원이 본 약관을 위반하거나 서비스 운영에 지장을 주는
              경우 사전 통보 없이 서비스 이용을 제한할 수 있습니다.
            </p>

            <Heading as="h3" size="lg" mb={2}>
              제5조 (면책)
            </Heading>
            <p>
              운영자는 무료로 제공되는 서비스와 관련하여 법령에 특별한 규정이
              없는 한 책임을 지지 않습니다.
            </p>

            <Heading as="h3" size="lg" mb={2}>
              제6조 (약관의 변경)
            </Heading>
            <p>
              본 약관은 필요 시 변경될 수 있으며, 변경 사항은 서비스 내 공지를
              통해 안내합니다.
            </p>

            <p>
              <strong>시행일:</strong> 2026년 2월 1일
            </p>
          </Box>
        </Stack>
      </Stack>
    </Container>
  )
}
