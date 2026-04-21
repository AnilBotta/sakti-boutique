import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type ContainerWidth = 'default' | 'editorial' | 'text';

const widthClass: Record<ContainerWidth, string> = {
  default: 'max-w-container-default',
  editorial: 'max-w-container-editorial',
  text: 'max-w-container-text',
};

interface ContainerProps {
  as?: ElementType;
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}

export function Container({
  as: Tag = 'div',
  width = 'default',
  className,
  children,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-5 md:px-8 lg:px-12',
        widthClass[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
