import React from 'react';

// Utility function to combine classNames
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Button group variants helper
function getButtonGroupVariants(
  orientation: 'horizontal' | 'vertical'
): string {
  const baseStyles =
    'flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*="w-"])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2';

  const orientationStyles = {
    horizontal:
      '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
    vertical:
      'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
  };

  return cn(baseStyles, orientationStyles[orientation]);
}

interface ButtonGroupProps extends React.ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

function ButtonGroup({
  className,
  orientation = 'horizontal',
  ...props
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(getButtonGroupVariants(orientation), className)}
      {...props}
    />
  );
}

interface ButtonGroupTextProps extends React.ComponentProps<'div'> {
  asChild?: boolean;
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: ButtonGroupTextProps) {
  const Comp = asChild ? 'div' : 'div';
  return (
    <Comp
      data-slot="button-group-text"
      className={cn(
        'bg-muted flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
        className
      )}
      {...props}
    />
  );
}

interface ButtonGroupSeparatorProps extends React.ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps) {
  const separatorClasses =
    orientation === 'vertical' ? 'w-px h-auto' : 'h-px w-auto';

  return (
    <div
      data-slot="button-group-separator"
      className={cn(
        'bg-border relative !m-0 self-stretch',
        separatorClasses,
        className
      )}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
export type {
  ButtonGroupProps,
  ButtonGroupTextProps,
  ButtonGroupSeparatorProps,
};
