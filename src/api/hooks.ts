// TanStack Query hooks, one per API call (same pattern as mobile/src/api/hooks.ts).
// Query keys include the locale where the API localizes the response.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, type Schemas } from './client';

export type TransactionType = Schemas['TransactionType'];
export type PerformanceRange = Schemas['PerformanceRange'];

export const queryKeys = {
  dashboard: (locale: string) => ['dashboard', locale] as const,
  profile: ['profile'] as const,
  preferences: ['preferences'] as const,
  accounts: (page: number) => ['accounts', page] as const,
  account: (id: string) => ['account', id] as const,
  transactions: (id: string, page: number, type?: TransactionType) => ['transactions', id, page, type ?? 'all'] as const,
  performance: (id: string, range: PerformanceRange) => ['performance', id, range] as const,
  documents: (filters: { year?: number; category?: string }) => ['documents', filters] as const,
  notifications: ['notifications'] as const,
};

export function useDashboard() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: queryKeys.dashboard(i18n.language),
    queryFn: async () => unwrap(await api.GET('/api/wealth/dashboard')),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => unwrap(await api.GET('/api/profile')),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Schemas['ProfileAddressUpdate']) => unwrap(await api.PUT('/api/profile/address', { body })),
    onSuccess: (profile) => qc.setQueryData(queryKeys.profile, profile),
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.preferences,
    queryFn: async () => unwrap(await api.GET('/api/preferences')),
    staleTime: 5 * 60_000,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Schemas['PreferencesUpdate']) => unwrap(await api.PUT('/api/preferences', { body })),
    // Show the change straight away; roll back if the API rejects it.
    onMutate: async (change) => {
      await qc.cancelQueries({ queryKey: queryKeys.preferences });
      const previous = qc.getQueryData<Schemas['PreferencesResponse']>(queryKeys.preferences);
      if (previous) {
        qc.setQueryData(queryKeys.preferences, {
          ...previous,
          ...change,
          notifications: { ...previous.notifications, ...change.notifications },
        });
      }
      return { previous };
    },
    onError: (_error, _change, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.preferences, context.previous);
    },
    onSuccess: (prefs) => qc.setQueryData(queryKeys.preferences, prefs),
  });
}

export function useAccounts(page = 1) {
  return useQuery({
    queryKey: queryKeys.accounts(page),
    queryFn: async () => unwrap(await api.GET('/api/wealth/accounts', { params: { query: { page, pageSize: 20 } } })),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.account(id),
    queryFn: async () => unwrap(await api.GET('/api/wealth/accounts/{id}', { params: { path: { id } } })),
  });
}

export function useUpdateAccount(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Schemas['AccountPatchRequest']) =>
      unwrap(await api.PATCH('/api/wealth/accounts/{id}', { params: { path: { id } }, body })),
    onSuccess: (account) => {
      qc.setQueryData(queryKeys.account(id), account);
      void qc.invalidateQueries({ queryKey: ['accounts'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useTransactions(id: string, page: number, type?: TransactionType) {
  return useQuery({
    queryKey: queryKeys.transactions(id, page, type),
    queryFn: async () =>
      unwrap(
        await api.GET('/api/wealth/accounts/{id}/transactions', {
          params: { path: { id }, query: { page, pageSize: 10, type } },
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function usePerformance(id: string, range: PerformanceRange) {
  return useQuery({
    queryKey: queryKeys.performance(id, range),
    queryFn: async () =>
      unwrap(await api.GET('/api/wealth/accounts/{id}/performance', { params: { path: { id }, query: { range } } })),
  });
}

export function useDocuments(filters: { year?: number; category?: string }) {
  return useQuery({
    queryKey: queryKeys.documents(filters),
    queryFn: async () =>
      unwrap(await api.GET('/api/wealth/documents', { params: { query: { ...filters, pageSize: 100 } } })),
    placeholderData: keepPreviousData,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => unwrap(await api.GET('/api/notifications')),
    refetchInterval: 60_000, // keeps the unread badge in the top bar current
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await api.POST('/api/notifications/{id}/read', { params: { path: { id } } })),
    onSuccess: ({ id }) =>
      qc.setQueryData<Schemas['Notification'][]>(queryKeys.notifications, (list) =>
        list?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      ),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => unwrap(await api.POST('/api/notifications/read-all')),
    onSuccess: () =>
      qc.setQueryData<Schemas['Notification'][]>(queryKeys.notifications, (list) =>
        list?.map((n) => ({ ...n, read: true })),
      ),
  });
}
