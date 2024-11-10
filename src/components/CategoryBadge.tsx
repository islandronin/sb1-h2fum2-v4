<command>import React from 'react';
import type { ContactCategory } from '../types/Contact';

const categoryColors = {
  Purchaser: 'bg-purple-100 text-purple-800',
  Platform: 'bg-green-100 text-green-800',
  Partner: 'bg-blue-100 text-blue-800',
  Promoter: 'bg-orange-100 text-orange-800',
} as const;

interface CategoryBadgeProps {
  category: ContactCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] || categoryColors.Platform;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {category}
    </span>
  );
}</command>