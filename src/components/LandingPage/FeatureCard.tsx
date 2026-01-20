import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
}

export default function FeatureCard({ icon, title, titleFa, description, descriptionFa }: FeatureCardProps) {
  return (
    <div className="group border-border-subtle bg-background hover:border-border-default rounded-xl border p-6 transition-all duration-200 hover:shadow-md">
      {/* Icon */}
      <div className="bg-background-secondary text-text-primary group-hover:bg-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200 group-hover:text-white">
        {icon}
      </div>

      {/* Title (English + Farsi) */}
      <div className="mb-2 space-y-1">
        <h3 className="text-text-primary text-lg font-semibold">{title}</h3>
        <p className="text-text-muted text-sm font-medium" dir="rtl">
          {titleFa}
        </p>
      </div>

      {/* Description (English + Farsi) */}
      <div className="space-y-1">
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
        <p className="text-text-tertiary text-xs leading-relaxed" dir="rtl">
          {descriptionFa}
        </p>
      </div>
    </div>
  );
}
