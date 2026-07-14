import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Loader2, User } from 'lucide-react';

import Button from '@components/Button';

import { useAuth } from '@hooks/use-auth';
import { useUpdateUserProfile } from '@hooks/use-user-profile';

import { useToast } from '@stores/toast';

import { ensureError } from '@utils';

const ProfileCard = () => {
  // States
  const [editedName, setEditedName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Customs
  const t = useTranslations('settings.profile');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const { showToast } = useToast();
  const updateProfile = useUpdateUserProfile();

  // Variables
  const nameValue = isEditing ? editedName : (user?.name ?? '');

  // Callbacks
  const handleEdit = () => {
    setEditedName(user?.name ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      showToast(t('nameEmpty'), 'error');
      return;
    }

    if (editedName.trim() === user?.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProfile.mutateAsync({ name: editedName.trim() });
      showToast(t('updated'), 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <User className="text-text-secondary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-text-primary text-lg font-semibold">{t('title')}</h2>
            <p className="text-text-muted text-sm">{t('subtitle')}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* me-auto: a block with a max-width and no margin always hugs the
            physical left (that's how CSS resolves margin:0, direction doesn't
            enter into it) — under RTL that reads as floating away from the
            right-aligned labels/inputs inside it. me-auto pushes the leftover
            width to the logical *end* (left in LTR, right in RTL), so the
            block hugs whichever side text actually starts from in both. */}
        <div className="me-auto grid max-w-2xl gap-4">
          {/* Email - Read Only */}
          <div>
            <label className="text-text-secondary mb-2 block text-sm font-medium">{t('email')}</label>
            <div className="border-border-subtle bg-background-secondary text-text-muted w-full rounded-lg border px-4 py-2.5">
              {user?.email || t('emailLoading')}
            </div>
            <p className="text-text-muted mt-1 text-xs">{t('emailHint')}</p>
          </div>

          {/* Name - Editable */}
          <div>
            <label className="text-text-secondary mb-2 block text-sm font-medium">{t('name')}</label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder={t('namePlaceholder')}
              disabled={!isEditing}
              className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-4 py-2.5 transition-[opacity,border-color] duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Action Buttons — Cancel sits on the physical right, Save/primary on
              the left, under RTL (mirrors LTR's reading order rather than its
              physical layout). rtl:flex-row-reverse swaps Save (coded first) to
              the left; rtl:justify-end keeps the pair anchored to the row's own
              right edge instead of drifting to the left once reversed. */}
          <div className="flex min-h-[42px] gap-3 pt-2 rtl:flex-row-reverse rtl:justify-end">
            {!isEditing ? (
              <Button variant="outline" onClick={handleEdit}>
                {t('editProfile')}
              </Button>
            ) : (
              <>
                <Button variant="primary" onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
                  <span>{updateProfile.isPending ? t('saving') : t('saveChanges')}</span>
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={updateProfile.isPending}>
                  {tCommon('cancel')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
