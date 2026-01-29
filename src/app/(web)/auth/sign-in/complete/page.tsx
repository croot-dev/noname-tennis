'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  Box,
  Spinner,
  Stack,
  Text,
  Field,
  Fieldset,
  Input,
  Button,
  NativeSelect,
  SegmentGroup,
  Container,
  Heading,
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { setAuthFlag } from '@/lib/auth.client'
import { MEMBER_GENDER, NTRP_LEVELS } from '@/constants'
import { useMemberJoin, authKeys } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'

interface FormValues {
  name: string
  birthdate: string
  gender: 'M' | 'F'
  nickname: string
  ntrp: string
  phone?: string
}

const GENDER_OPTIONS = [
  { value: MEMBER_GENDER.MALE, label: '남성' },
  { value: MEMBER_GENDER.FEMALE, label: '여성' },
]

export default function AuthSignInComplete() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const memberJoin = useMemberJoin()
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const [redirectUri, setRedirectUri] = useState('')

  // 로그인 후 돌아갈 URL (state에서 디코딩, 기본값: /dashboard)
  const returnUrl = state ? decodeURIComponent(state) : '/dashboard'

  useEffect(() => {
    setRedirectUri(`${window.location.origin}${process.env.KAKAO_REDIRECT_URI}`)
  }, [])

  const [showForm, setShowForm] = useState(false)
  const [kakaoUserInfo, setKakaoUserInfo] = useState({ id: null, email: null })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      gender: 'M',
    },
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['kakaoAuth', code],
    queryFn: async () => {
      const params = new URLSearchParams({
        code: code ?? '',
        redirect_uri: redirectUri,
      })

      const res = await fetch(`/api/auth/kakao?${params.toString()}`)
      if (!res.ok) throw new Error('카카오 인증 실패')
      return res.json()
    },
    enabled: !!code,
  })

  useEffect(() => {
    if (data) {
      // 기존 사용자인 경우 로그인 처리
      if (data.existingUser) {
        console.log('기존 사용자 로그인:', data.existingUser)

        // 인증 플래그 설정
        setAuthFlag()

        // 임시 데이터 정리
        localStorage.removeItem('kakaoUserTemp')

        // 사용자 정보 즉시 캐시에 설정
        queryClient.setQueryData(authKeys.user(), data.existingUser)

        // 대시보드로 이동
        router.push(returnUrl)
      } else {
        setKakaoUserInfo({
          id: data.user.id,
          email: data.user.kakao_account?.email || '',
        })
        setShowForm(true)
      }
    }
  }, [data, router, queryClient, returnUrl])

  const onSubmit = handleSubmit(async (formData) => {
    const memberJoinData = {
      member_id: kakaoUserInfo.id!,
      email: kakaoUserInfo.email!,
      name: formData.name,
      birthdate: formData.birthdate.replace(/-/g, ''),
      gender: formData.gender,
      nickname: formData.name,
      ntrp: formData.ntrp,
      ...(formData.phone && { phone: formData.phone.replace(/-/g, '') }),
    }

    memberJoin.mutate(memberJoinData, {
      onSuccess: async (result) => {
        // 인증 플래그 설정
        setAuthFlag()

        // 임시 데이터 삭제
        localStorage.removeItem('kakaoUserTemp')

        // 사용자 정보 즉시 캐시에 설정
        queryClient.setQueryData(authKeys.user(), result.user)

        // 대시보드로 이동
        router.push(returnUrl)
      },
      onError: (error) => {
        console.error('회원가입 에러:', error)
        alert('회원가입 중 오류가 발생했습니다.')
      },
    })
  })

  if (isLoading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Stack align="center" gap={4}>
          <Spinner size="xl" color="teal.500" />
          <Text fontSize="lg">카카오 인증 중...</Text>
        </Stack>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Stack align="center" gap={4}>
          <Text fontSize="2xl">❌</Text>
          <Text fontSize="lg" color="red.500">
            카카오 인증 실패
          </Text>
          <Text fontSize="sm" color="gray.600">
            다시 시도해주세요.
          </Text>
        </Stack>
      </Box>
    )
  }

  if (showForm) {
    return (
      <Container maxW="md" py={10} width="full">
        <Stack gap={6}>
          <Stack gap={2} textAlign="center">
            <Heading size="xl" color="teal.500">
              프로필 정보 입력
            </Heading>
            <Text color="gray.600">추가 정보를 입력해주세요</Text>
          </Stack>

          <form onSubmit={onSubmit}>
            <Fieldset.Root size="lg">
              <Fieldset.Content>
                {/* 카카오 이메일 표시 */}
                <Box p={4} bg="gray.50" borderRadius="md" mb={4}>
                  <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">
                    카카오 계정
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {kakaoUserInfo.email || '정보 없음'}
                  </Text>
                </Box>

                {/* 이름 */}
                <Field.Root invalid={!!errors.name} required>
                  <Field.Label>이름</Field.Label>
                  <Input
                    {...register('name', {
                      required: '이름을 입력해주세요',
                      minLength: {
                        value: 2,
                        message: '이름은 최소 2자 이상이어야 합니다',
                      },
                    })}
                    placeholder="박보검"
                  />
                  <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>

                {/* 생년월일 */}
                <Field.Root invalid={!!errors.birthdate} required>
                  <Field.Label>생년월일</Field.Label>
                  <Controller
                    name="birthdate"
                    control={control}
                    rules={{
                      required: '생년월일을 입력해주세요',
                      validate: (value) => {
                        if (!value || value.length !== 10) {
                          return '생년월일을 다시 확인해주세요'
                        }
                        const year = parseInt(value.slice(0, 4))
                        const month = parseInt(value.slice(5, 7))
                        const day = parseInt(value.slice(8, 10))
                        const currentYear = new Date().getFullYear()

                        if (
                          year < 1970 ||
                          year > currentYear ||
                          month < 1 ||
                          month > 12 ||
                          day < 1 ||
                          day > 31
                        ) {
                          return '생년월일을 다시 확인해주세요'
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        value={field.value || ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '')
                          const limited = digits.slice(0, 8)
                          let formatted = limited
                          if (limited.length >= 5) {
                            formatted = `${limited.slice(0, 4)}-${limited.slice(
                              4,
                              6,
                            )}`
                            if (limited.length >= 7) {
                              formatted += `-${limited.slice(6, 8)}`
                            }
                          }
                          field.onChange(formatted)
                        }}
                        placeholder="YYYY-MM-DD"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    )}
                  />
                  <Field.HelperText>
                    숫자 8자리 입력 (예: 19900101)
                  </Field.HelperText>
                  <Field.ErrorText>{errors.birthdate?.message}</Field.ErrorText>
                </Field.Root>

                {/* 성별 */}
                <Field.Root invalid={!!errors.gender} required>
                  <Field.Label>성별</Field.Label>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: '성별을 선택해주세요' }}
                    render={({ field }) => (
                      <SegmentGroup.Root
                        value={field.value}
                        onValueChange={(details) => {
                          field.onChange(details.value)
                        }}
                      >
                        <SegmentGroup.Indicator />
                        <SegmentGroup.Items items={GENDER_OPTIONS} />
                      </SegmentGroup.Root>
                    )}
                  />
                  <Field.ErrorText>{errors.gender?.message}</Field.ErrorText>
                </Field.Root>

                {/* NTRP 등급 */}
                <Field.Root invalid={!!errors.ntrp} required>
                  <Field.Label>테니스 등급 (NTRP)</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      {...register('ntrp', {
                        required: '테니스 등급을 선택해주세요',
                        validate: (value) =>
                          value !== '' || '테니스 등급을 선택해주세요',
                      })}
                    >
                      {NTRP_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <Field.HelperText>
                    현재 테니스 실력 수준을 선택해주세요
                  </Field.HelperText>
                  <Field.ErrorText>{errors.ntrp?.message}</Field.ErrorText>
                </Field.Root>

                {/* 전화번호 */}
                <Field.Root invalid={!!errors.phone} required>
                  <Field.Label>전화번호</Field.Label>
                  <Input
                    placeholder="010-0000-0000"
                    maxLength={13}
                    inputMode="numeric"
                    {...register('phone', {
                      validate: (value) => {
                        if (!value) return true
                        const digits = value.replace(/\D/g, '')
                        if (digits.length !== 11)
                          return '전화번호 11자리를 입력해주세요'
                        if (!digits.startsWith('01'))
                          return '올바른 전화번호를 입력해주세요'
                        return true
                      },
                      onChange: (event) => {
                        const value = event.target.value
                        const digits = value.replace(/\D/g, '').slice(0, 11)

                        if (digits.length < 4) return digits
                        if (digits.length < 8)
                          return `${digits.slice(0, 3)}-${digits.slice(3)}`
                        return `${digits.slice(0, 3)}-${digits.slice(
                          3,
                          7,
                        )}-${digits.slice(7)}`
                      },
                    })}
                  />
                  <Field.HelperText>선택사항입니다</Field.HelperText>
                  <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                </Field.Root>
              </Fieldset.Content>

              <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
                회원가입 시{' '}
                <a
                  href="/terms/service"
                  style={{ textDecoration: 'underline' }}
                >
                  이용약관
                </a>{' '}
                및{' '}
                <a
                  href="/terms/privacy"
                  style={{ textDecoration: 'underline' }}
                >
                  개인정보처리방침
                </a>
                에 동의하게 됩니다.
              </Text>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                width="full"
                mt={4}
              >
                완료
              </Button>
            </Fieldset.Root>
          </form>
        </Stack>
      </Container>
    )
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Stack align="center" gap={4}>
        <Spinner size="xl" color="teal.500" />
        <Text fontSize="lg">로그인 처리 중...</Text>
      </Stack>
    </Box>
  )
}
