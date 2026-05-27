import { Layers } from 'lucide-react';

import CategoryManagementList from '@features/expenses/components/CategoryManagementList';

const CategoryManagement = () => {
  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Layers className="text-text-secondary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-text-primary text-lg font-semibold">Categories</h2>
            <p className="text-text-muted text-sm">Manage your expense categories — pick names, icons, and colors</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <CategoryManagementList />
      </div>
    </div>
  );
};

export default CategoryManagement;
