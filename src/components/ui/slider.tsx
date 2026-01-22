'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { forwardRef, ComponentPropsWithoutRef, ElementRef } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const Slider = forwardRef<ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, label, showValue = false, formatValue, value, ...props }, ref) => {
    const displayValue = value?.[0] ?? props.defaultValue?.[0] ?? 0;

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label className="text-sm font-medium text-gray-700">{label}</label>
            )}
            {showValue && (
              <span className="text-sm text-gray-500">
                {formatValue ? formatValue(displayValue) : displayValue}
              </span>
            )}
          </div>
        )}
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            className
          )}
          value={value}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
            <SliderPrimitive.Range className="absolute h-full bg-primary-600" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
        </SliderPrimitive.Root>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
