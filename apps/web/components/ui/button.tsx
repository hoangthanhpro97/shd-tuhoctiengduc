import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' };

/** Local shadcn-style primitive: variants stay token-driven and keyboard accessible. */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`button ${variant === 'primary' ? 'button-primary' : 'button-quiet'} ${className}`.trim()} {...props} />;
}
