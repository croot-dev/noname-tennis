'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hasAuthFlag, clearAuthFlag } from '@/lib/auth.client'
import { ApiError, request, refreshToken } from '@/lib/api.client'
import { CreateMemberDto, Member, MemberWithRole } from '@/domains/member'

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

/**
 * Sign Up mutataion (프로필 생성)
 */
interface MemberJoinResponse {
  success: boolean
  user: Member
  accessToken: string
}

export function useMemberJoin() {
  return useMutation({
    mutationFn: (data: CreateMemberDto) =>
      request<MemberJoinResponse>('/api/member', {
        method: 'POST',
        body: data,
      }),
  })
}

/**
 * 현재 사용자 정보 조회
 */
export function useUserInfo() {
  return useQuery({
    queryKey: authKeys.user(),
    enabled: typeof window !== 'undefined' && hasAuthFlag(),
    staleTime: 1000 * 60 * 1,
    retry: false,

    queryFn: async () => {
      if (!hasAuthFlag()) return null

      try {
        return await request<MemberWithRole>('/api/auth/me')
      } catch (error) {
        // 인증 만료 케이스만 정책 처리
        if (error instanceof ApiError && error.status === 401) {
          const refreshed = await refreshToken()

          if (!refreshed) {
            clearAuthFlag()
            return null
          }

          // refresh 성공 → 재시도
          try {
            return await request<MemberWithRole>('/api/auth/me')
          } catch {
            clearAuthFlag()
            return null
          }
        }

        // 그 외 에러는 비로그인으로 취급
        return null
      }
    },
  })
}

/**
 * 로그아웃 mutation
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      request<void>('/api/auth/logout', {
        method: 'POST',
        auth: false, // 이미 세션 만료됐을 수 있음
      }),

    onSettled: () => {
      clearAuthFlag()
      localStorage.removeItem('kakaoUserTemp')
      queryClient.clear()
      window.location.href = '/'
    },
  })
}
