import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-tobacco-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-tobacco-50 disabled:cursor-not-allowed',
            {
              'border-tobacco-300 focus:border-ember-500 focus:ring-ember-500': !error,
              'border-red-500 focus:border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-tobacco-500">{helperText}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
