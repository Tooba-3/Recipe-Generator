import * as React from 'react';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full p-3 rounded-xl border border-gray-300 bg-mint text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 ${className}`}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
