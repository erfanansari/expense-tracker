'use client';

import { useTranslations } from 'next-intl';

import { Layers } from 'lucide-react';

import CategoryManagementList from '@features/expenses/components/CategoryManagementList';

import SectionCard from '@components/SectionCard';

const CategoryManagement = () => {
  const t = useTranslations('settings.categories');
  return (
    <SectionCard icon={Layers} title={t('title')} subtitle={t('subtitle')}>
      <div className="p-6">
        <CategoryManagementList />
      </div>
    </SectionCard>
  );
};

export default CategoryManagement;
