import { useTranslations } from 'next-intl';

import { Tag } from 'lucide-react';

import TagManagementList from '@features/expenses/components/TagManagementList';

const TagManagement = () => {
  const t = useTranslations('settings.tags');
  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Tag className="text-text-secondary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-text-primary text-lg font-semibold">{t('title')}</h2>
            <p className="text-text-muted text-sm">{t('subtitle')}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <TagManagementList />
      </div>
    </div>
  );
};

export default TagManagement;
