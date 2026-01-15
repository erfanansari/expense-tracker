'use client';

import { ArrowLeftRight, Calendar, Clock, DollarSign, FileText, FolderOpen, Tag } from 'lucide-react';

import { type Expense } from '@/@types/expense';
import Modal from '@/components/Modal';
import { formatNumber, formatToFarsiDate, getCategoryLabel } from '@/utils';

interface TransactionDetailsModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  labelFa: string;
  value: React.ReactNode;
}

const DetailRow = ({ icon, label, labelFa, value }: DetailRowProps) => (
  <div className="flex items-start gap-3 sm:gap-4">
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fafafa] sm:h-10 sm:w-10"
      aria-hidden="true"
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1 pt-0.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-xs font-medium text-[#a3a3a3]">{label}</span>
        <span className="text-xs text-[#a3a3a3]" dir="rtl">
          {labelFa}
        </span>
      </div>
      <div className="mt-1 text-sm font-medium text-[#171717] sm:text-base">{value}</div>
    </div>
  </div>
);

const TransactionDetailsModal = ({ expense, isOpen, onClose }: TransactionDetailsModalProps) => {
  if (!expense) {
    return null;
  }

  const categoryLabels = getCategoryLabel(expense.category);
  const farsiDate = formatToFarsiDate(expense.date);
  const exchangeRate = Math.round(expense.price_toman / expense.price_usd);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details" titleFa="جزئیات تراکنش">
      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Description */}
        <DetailRow
          icon={<FileText className="h-4 w-4 text-[#525252]" />}
          label="Description"
          labelFa="توضیحات"
          value={<span className="break-words">{expense.description}</span>}
        />

        {/* Category */}
        <DetailRow
          icon={<FolderOpen className="h-4 w-4 text-[#525252]" />}
          label="Category"
          labelFa="دسته‌بندی"
          value={
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{categoryLabels.en}</span>
              <span className="text-[#a3a3a3]" dir="rtl">
                ({categoryLabels.fa})
              </span>
            </div>
          }
        />

        {/* Date */}
        <DetailRow
          icon={<Calendar className="h-4 w-4 text-[#525252]" />}
          label="Date"
          labelFa="تاریخ"
          value={
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{expense.date}</span>
              <span className="text-[#a3a3a3]" dir="rtl">
                ({farsiDate})
              </span>
            </div>
          }
        />

        {/* Divider */}
        <div className="border-t border-[#e5e5e5]" role="separator" />

        {/* Amount in Toman */}
        <DetailRow
          icon={<DollarSign className="h-4 w-4 text-[#525252]" />}
          label="Amount (Toman)"
          labelFa="مبلغ (تومان)"
          value={
            <span className="font-semibold text-[#171717] tabular-nums" dir="rtl">
              {formatNumber(expense.price_toman)} تومان
            </span>
          }
        />

        {/* Amount in USD */}
        <DetailRow
          icon={<DollarSign className="h-4 w-4 text-[#525252]" />}
          label="Amount (USD)"
          labelFa="مبلغ (دلار)"
          value={<span className="text-[#171717] tabular-nums">${expense.price_usd.toFixed(2)} USD</span>}
        />

        {/* Exchange Rate */}
        <DetailRow
          icon={<ArrowLeftRight className="h-4 w-4 text-[#525252]" />}
          label="Exchange Rate"
          labelFa="نرخ ارز"
          value={<span className="text-[#525252] tabular-nums">{formatNumber(exchangeRate)} Toman/USD</span>}
        />

        {/* Tags */}
        {expense.tags && expense.tags.length > 0 && (
          <>
            {/* Divider */}
            <div className="border-t border-[#e5e5e5]" role="separator" />

            <DetailRow
              icon={<Tag className="h-4 w-4 text-[#525252]" />}
              label="Tags"
              labelFa="برچسب‌ها"
              value={
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {expense.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-md border border-[#e5e5e5] bg-[#f5f5f5] px-2 py-1 text-xs font-medium text-[#525252]"
                    >
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              }
            />
          </>
        )}

        {/* Divider */}
        <div className="border-t border-[#e5e5e5]" role="separator" />

        {/* Created At */}
        <DetailRow
          icon={<Clock className="h-4 w-4 text-[#525252]" />}
          label="Created At"
          labelFa="تاریخ ثبت"
          value={
            <time dateTime={expense.created_at} className="text-[#525252]">
              {new Date(expense.created_at).toLocaleString()}
            </time>
          }
        />
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;
