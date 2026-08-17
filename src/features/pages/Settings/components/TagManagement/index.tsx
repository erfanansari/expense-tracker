'use client';

import { useTranslations } from 'next-intl';

import { Tag } from 'lucide-react';

import TagManagementList from '@features/expenses/components/TagManagementList';

import SectionCard from '@components/SectionCard';

const TagManagement = () => {
  const t = useTranslations('settings.tags');
  return (
    <SectionCard icon={Tag} title={t('title')} subtitle={t('subtitle')}>
      <div className="p-6">
        <TagManagementList />
      </div>
    </SectionCard>
  );
};

export default TagManagement;
