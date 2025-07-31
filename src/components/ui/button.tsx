import * as React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`bg-mint hover:bg-green-300 text-white font-semibold py-2 px-4 rounded-xl ${className}`}
    {...props}
  />
));
Button.displayName = 'Button';
