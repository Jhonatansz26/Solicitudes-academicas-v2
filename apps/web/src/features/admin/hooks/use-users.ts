import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  fetchRoles,
  fetchUsersStats,
  fetchUserRequestStats,
  fetchUserActivity,
  type UsersQuery,
  type UserActivity,
} from '@/features/admin/api/users-api'
import { notify, NOTIFY } from '@/shared/lib/notify'

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: UsersQuery) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  roles: () => [...usersKeys.all, 'roles'] as const,
  stats: () => [...usersKeys.all, 'stats'] as const,
}

export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: usersKeys.list(query),
    queryFn: () => fetchUsers(query),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  })
}

export function useRoles() {
  return useQuery({
    queryKey: usersKeys.roles(),
    queryFn: fetchRoles,
    staleTime: 10 * 60 * 1000,
  })
}

export function useUsersStats() {
  return useQuery({
    queryKey: usersKeys.stats(),
    queryFn: fetchUsersStats,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUserRequestStats(userId: string) {
  return useQuery({
    queryKey: [...usersKeys.all, 'request-stats', userId],
    queryFn: () => fetchUserRequestStats(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUserActivity(userId: string) {
  return useQuery<UserActivity[]>({
    queryKey: [...usersKeys.all, 'activity', userId],
    queryFn: () => fetchUserActivity(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      notify.success(NOTIFY.user.created, user.fullName)
    },
    onError: (err) => notify.error(NOTIFY.user.createdError, err),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) })
      notify.success(NOTIFY.user.updated)
    },
    onError: (err) => notify.error(NOTIFY.user.updatedError, err),
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      notify.success(variables.isActive ? NOTIFY.user.activated : NOTIFY.user.deactivated)
    },
    onError: (err) => notify.error(NOTIFY.user.statusError, err),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      notify.success(NOTIFY.user.deleted)
    },
    onError: (err) => notify.error(NOTIFY.user.deletedError, err),
  })
}
