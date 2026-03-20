import type React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
  index: number;
}

const FeatureCard = ({ icon, title, titleFa, description, descriptionFa, index }: FeatureCardProps) => {
  // Alternate accent position for visual variety
  const isHighlighted = index === 0 || index === 3;

  return (
    <div
      className={`group border-border-subtle bg-background relative overflow-hidden rounded-xl border p-6 transition-all duration-300 sm:p-7 ${
        isHighlighted ? 'hover:border-primary/20 hover:shadow-md' : 'hover:border-border-default hover:shadow-sm'
      }`}
    >
      {/* Subtle corner accent for highlighted cards */}
      {isHighlighted && (
        <div className="bg-primary pointer-events-none absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06]" />
      )}

      {/* Icon */}
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-300 ${
          isHighlighted
            ? 'bg-primary text-white group-hover:scale-105'
            : 'border-border-subtle bg-background-secondary text-text-primary group-hover:bg-primary border group-hover:text-white'
        }`}
      >
        {icon}
      </div>

      {/* Title */}
      <div className="mb-3">
        <h3 className="text-text-primary text-base font-semibold sm:text-lg">{title}</h3>
        <p className="text-text-muted mt-0.5 text-xs font-medium" dir="rtl">
          {titleFa}
        </p>
      </div>

      {/* Description */}
      <div>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
        <p className="text-text-tertiary mt-1 text-xs leading-relaxed" dir="rtl">
          {descriptionFa}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
