import React from 'react';

// Utility function to combine classNames
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Item variants helper
function getItemVariants(
  variant: 'default' | 'outline' | 'muted',
  size: 'default' | 'sm'
): string {
  const baseStyles =
    'group/item flex items-center border border-transparent text-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

  const variantStyles = {
    default: 'bg-transparent',
    outline: 'border-border',
    muted: 'bg-muted/50',
  };

  const sizeStyles = {
    default: 'p-4 gap-4',
    sm: 'py-3 px-4 gap-2.5',
  };

  return cn(baseStyles, variantStyles[variant], sizeStyles[size]);
}

// Item media variants helper
function getItemMediaVariants(variant: 'default' | 'icon' | 'image'): string {
  const baseStyles =
    'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5';

  const variantStyles = {
    default: 'bg-transparent',
    icon: "size-8 border border-border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4",
    image:
      'size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover',
  };

  return cn(baseStyles, variantStyles[variant]);
}

interface ItemGroupProps extends React.ComponentProps<'div'> {}

function ItemGroup({ className, ...props }: ItemGroupProps) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn('group/item-group flex flex-col', className)}
      {...props}
    />
  );
}

interface ItemSeparatorProps extends React.ComponentProps<'div'> {}

function ItemSeparator({ className, ...props }: ItemSeparatorProps) {
  return (
    <div
      data-slot="item-separator"
      className={cn('my-0 border-t border-border', className)}
      {...props}
    />
  );
}

interface ItemProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'outline' | 'muted';
  size?: 'default' | 'sm';
  asChild?: boolean;
}

function Item({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ItemProps) {
  const Comp = asChild ? 'div' : 'div';
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(getItemVariants(variant, size), className)}
      {...props}
    />
  );
}

interface ItemMediaProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'icon' | 'image';
}

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: ItemMediaProps) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(getItemMediaVariants(variant), className)}
      {...props}
    />
  );
}

interface ItemContentProps extends React.ComponentProps<'div'> {}

function ItemContent({ className, ...props }: ItemContentProps) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
        className
      )}
      {...props}
    />
  );
}

interface ItemTitleProps extends React.ComponentProps<'div'> {}

function ItemTitle({ className, ...props }: ItemTitleProps) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
        className
      )}
      {...props}
    />
  );
}

interface ItemDescriptionProps extends React.ComponentProps<'p'> {}

function ItemDescription({ className, ...props }: ItemDescriptionProps) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className
      )}
      {...props}
    />
  );
}

interface ItemActionsProps extends React.ComponentProps<'div'> {}

function ItemActions({ className, ...props }: ItemActionsProps) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

interface ItemHeaderProps extends React.ComponentProps<'div'> {}

function ItemHeader({ className, ...props }: ItemHeaderProps) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className
      )}
      {...props}
    />
  );
}

interface ItemFooterProps extends React.ComponentProps<'div'> {}

function ItemFooter({ className, ...props }: ItemFooterProps) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className
      )}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
