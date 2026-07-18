'use client';

import { useLocale, useTranslations } from 'next-intl';

import { getSessionTokenKeyGenerator } from '@api/getSessionTokenQuery';
import type { GetSessionTokenResponse } from '@api/getSessionTokenQuery';
import { listSessionsKeyGenerator } from '@api/listSessionsQuery';
import type { ListSessionsResponse } from '@api/listSessionsQuery';
import { revokeOtherSessionsKeyGenerator, revokeSessionKeyGenerator } from '@api/revokeSessionMutation';
import type { RevokeSessionRequestData } from '@api/revokeSessionMutation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MonitorSmartphone } from 'lucide-react';

import Button from '@components/Button';

import { useToast } from '@stores/toast';

export function parseUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device';

  let browser = 'Unknown browser';
  if (/Edg\//.test(userAgent)) browser = 'Edge';
  else if (/OPR\//.test(userAgent)) browser = 'Opera';
  else if (/Chrome\//.test(userAgent)) browser = 'Chrome';
  else if (/Firefox\//.test(userAgent)) browser = 'Firefox';
  else if (/Safari\//.test(userAgent)) browser = 'Safari';
  else if (/curl\//.test(userAgent)) browser = 'curl';

  let os = '';
  if (/iPhone|iPad/.test(userAgent)) os = 'iOS';
  else if (/Android/.test(userAgent)) os = 'Android';
  else if (/Macintosh|Mac OS X/.test(userAgent)) os = 'macOS';
  else if (/Windows/.test(userAgent)) os = 'Windows';
  else if (/Linux/.test(userAgent)) os = 'Linux';

  return os ? `${browser} · ${os}` : browser;
}

function formatRelativeTime(iso: string, locale: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSeconds = Math.round((then - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { numeric: 'auto' });
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return rtf.format(diffSeconds, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  return rtf.format(Math.round(diffSeconds / 86400), 'day');
}

const SessionsList = () => {
  // Customs
  const t = useTranslations('settings.security.sessions');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Queries
  const { data: sessions, isLoading } = useQuery<ListSessionsResponse>({ queryKey: listSessionsKeyGenerator() });
  const { data: currentToken } = useQuery<GetSessionTokenResponse>({ queryKey: getSessionTokenKeyGenerator() });

  // Mutations
  const refreshSessions = () => void queryClient.invalidateQueries({ queryKey: listSessionsKeyGenerator() });

  const revokeMutation = useMutation<void, Error, RevokeSessionRequestData>({
    mutationKey: revokeSessionKeyGenerator(),
    onSuccess: () => {
      showToast(t('revoked'), 'success');
      refreshSessions();
    },
    onError: (err) => showToast(err.message || t('revokeFailed'), 'error'),
  });

  const revokeOthersMutation = useMutation<void, Error, void>({
    mutationKey: revokeOtherSessionsKeyGenerator(),
    onSuccess: () => {
      showToast(t('othersSignedOut'), 'success');
      refreshSessions();
    },
    onError: (err) => showToast(err.message || t('othersSignOutFailed'), 'error'),
  });

  // Variables
  const sessionList = sessions ?? [];
  const otherSessionCount = sessionList.filter((session) => session.token !== currentToken).length;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-text-primary text-sm font-semibold">{t('title')}</h3>
          <p className="text-text-muted mt-1 text-xs">{t('subtitle')}</p>
        </div>
        {otherSessionCount > 0 && (
          <Button
            variant="outline"
            onClick={() => revokeOthersMutation.mutate()}
            disabled={revokeOthersMutation.isPending}
          >
            {revokeOthersMutation.isPending ? t('signingOut') : t('signOutOthers')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-text-muted mt-4 flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t('loading')}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {sessionList.map((session) => {
            const isCurrent = session.token === currentToken;
            return (
              <li key={session.token} className="border-border-subtle flex items-center gap-3 rounded-lg border p-3">
                <div className="border-border-subtle bg-background-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                  <MonitorSmartphone className="text-text-secondary h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-text-primary text-sm font-medium">{parseUserAgent(session.userAgent)}</span>
                    {isCurrent && (
                      <span className="bg-success/10 text-success rounded px-2 py-0.5 text-xs font-medium">
                        {t('thisDevice')}
                      </span>
                    )}
                  </div>
                  <div className="text-text-muted text-xs">
                    {t('signedIn', { time: formatRelativeTime(session.createdAt, locale) })}
                    {session.ipAddress ? ` · ${session.ipAddress}` : ''}
                  </div>
                </div>
                {!isCurrent && (
                  <Button
                    variant="danger"
                    onClick={() => revokeMutation.mutate({ token: session.token })}
                    disabled={revokeMutation.isPending}
                  >
                    {t('revoke')}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SessionsList;
