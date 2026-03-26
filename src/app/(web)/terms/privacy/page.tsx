import { Box, Container, Heading, Stack } from '@chakra-ui/react'
import styles from '../terms.module.css'

export const metadata = {
  title: '개인정보처리방침 - 풀코트 테니스 모임',
  description: '풀코트 테니스 모임의 개인정보처리방침입니다.',
}

export default function PrivacyPolicyPage() {
  return (
    <Container maxW="container.lg" py={10}>
      <Stack gap={8}>
        <Heading size="2xl">개인정보처리방침</Heading>

        <Stack gap={6}>
          <Box className={styles.termsContent}>
            <p>
              <strong>풀코트 테니스 모임</strong>(이하 “NTG”)는 개인정보보호법에
              따라 이용자의 개인정보를 보호하고 권익을 보호하기 위해 다음과 같은
              개인정보처리방침을 수립·공개합니다.
            </p>

            <Heading as="h3" size="lg" mb={2}>
              1. 수집하는 개인정보 항목
            </Heading>
            <ul>
              <li>이름</li>
              <li>생년월일</li>
              <li>휴대폰번호</li>
              <li>성별</li>
              <li>이메일 주소</li>
            </ul>

            <Heading as="h3" size="lg" mb={2}>
              2. 개인정보 수집 및 이용 목적
            </Heading>
            <ul>
              <li>테니스 모임 회원 식별 및 관리</li>
              <li>모임 일정 안내 및 연락</li>
              <li>공지사항 전달 및 운영 관련 안내</li>
            </ul>

            <Heading as="h3" size="lg" mb={2}>
              3. 개인정보 보유 및 이용 기간
            </Heading>
            <p>
              회원의 개인정보는 <strong>회원 탈퇴 시까지</strong> 보유 및
              이용하며, 탈퇴 후에는 지체 없이 파기합니다.
            </p>

            <Heading as="h3" size="lg" mb={2}>
              4. 개인정보의 제3자 제공
            </Heading>
            <p>운영자는 이용자의 개인정보를 외부에 제공하지 않습니다.</p>

            <Heading as="h3" size="lg" mb={2}>
              5. 개인정보 처리 위탁
            </Heading>
            <p>
              운영자는 원활한 로그인 서비스를 위해 다음과 같이 개인정보 처리를
              위탁할 수 있습니다.
            </p>
            <ul>
              <li>위탁 대상: 카카오㈜</li>
              <li>위탁 업무: 카카오 로그인 인증</li>
            </ul>

            <Heading as="h3" size="lg" mb={2}>
              6. 이용자의 권리
            </Heading>
            <p>
              이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제 요청할 수
              있습니다.
            </p>

            <Heading as="h3" size="lg" mb={2}>
              7. 개인정보 보호 책임자
            </Heading>
            <ul>
              <li>책임자: 최근호</li>
              <li>연락처: croot.dev@gmail.com</li>
            </ul>

            <p>
              <strong>시행일:</strong> 2026년 2월 1일
            </p>
          </Box>
        </Stack>
      </Stack>
    </Container>
  )
}
