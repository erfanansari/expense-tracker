'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { linkGoogleKeyGenerator } from '@api/linkGoogleMutation';
import type { LinkGoogleResponse } from '@api/linkGoogleMutation';
import { listAccountsKeyGenerator } from '@api/listAccountsQuery';
import type { ListAccountsResponse } from '@api/listAccountsQuery';
import { unlinkGoogleKeyGenerator } from '@api/unlinkGoogleMutation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail } from 'lucide-react';

import Button from '@components/Button';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import { GoogleIcon } from '@components/GoogleSignInButton';

import { useAuth } from '@hooks/use-auth';

import { useToast } from '@stores/toast';

const ConnectedAccounts = () => {
  // Customs
  const t = useTranslations('settings.security.connected');
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();

  // States
  const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);

  // Queries
  const { data: accounts, isLoading } = useQuery<ListAccountsResponse>({ queryKey: listAccountsKeyGenerator() });
  const hasCredential = (accounts ?? []).some((account) => account.providerId === 'credential');
  const hasGoogle = (accounts ?? []).some((account) => account.providerId === 'google');
  const googleIsOnlyAccount = hasGoogle && !hasCredential;

  // Mutations
  const linkMutation = useMutation<LinkGoogleResponse, Error, void>({
    mutationKey: linkGoogleKeyGenerator(),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err) => showToast(err.message || t('linkFailed'), 'error'),
  });

  const unlinkMutation = useMutation<void, Error, void>({
    mutationKey: unlinkGoogleKeyGenerator(),
    onSuccess: () => {
      setIsUnlinkOpen(false);
      showToast(t('disconnected'), 'success');
      void queryClient.invalidateQueries({ queryKey: listAccountsKeyGenerator() });
    },
    onError: (err) => {
      setIsUnlinkOpen(false);
      showToast(err.message || t('disconnectFailed'), 'error');
    },
  });

  return (
    <div className="max-w-2xl">
      <h3 className="text-text-primary text-sm font-semibold">{t('title')}</h3>
      <p className="text-text-muted mt-1 text-xs">{t('subtitle')}</p>

      <div className="mt-4 space-y-3">
        <div className="border-border-subtle flex items-center gap-3 rounded-lg border p-3">
          <div className="border-border-subtle bg-background-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
            <Mail className="text-text-secondary h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-text-primary text-sm font-medium">{t('emailPassword')}</div>
            <div className="text-text-muted truncate text-xs">{user?.email}</div>
          </div>
          {hasCredential ? (
            <span className="bg-success/10 text-success rounded px-2 py-0.5 text-xs font-medium">{t('connected')}</span>
          ) : (
            <span className="bg-background-elevated text-text-muted rounded px-2 py-0.5 text-xs font-medium">
              {t('noPassword')}
            </span>
          )}
        </div>

        <div className="border-border-subtle flex items-center gap-3 rounded-lg border p-3">
          <div className="border-border-subtle bg-background-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
            <GoogleIcon />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-text-primary text-sm font-medium">{t('google')}</div>
            <div className="text-text-muted text-xs">{hasGoogle ? t('googleConnected') : t('notConnected')}</div>
          </div>
          {hasGoogle ? (
            <Button
              variant="danger"
              onClick={() => setIsUnlinkOpen(true)}
              disabled={googleIsOnlyAccount || unlinkMutation.isPending}
              title={googleIsOnlyAccount ? t('disconnectLockoutHint') : undefined}
            >
              {t('disconnect')}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => linkMutation.mutate()}
              disabled={isLoading || linkMutation.isPending}
            >
              {linkMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t('connecting')}
                </span>
              ) : (
                t('connect')
              )}
            </Button>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isUnlinkOpen}
        title={t('disconnectTitle')}
        message={t('disconnectMessage')}
        onConfirm={() => unlinkMutation.mutate()}
        onCancel={() => setIsUnlinkOpen(false)}
        isDeleting={unlinkMutation.isPending}
      />
    </div>
  );
};

export default ConnectedAccounts;
