import type { ReactNode } from 'react';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  title: string;
  children: ReactNode;
  isPrimary?: boolean;
}

export function Card({ 
  title, 
  children, 
  isPrimary = false,
  className = '',
  ...props 
}: CardProps) {
  return (
    <article
      className={`
        rounded-sm
        bg-black/60 backdrop-blur-md
        border transition-all duration-200
        ${isPrimary 
          ? 'border-[#06D6A0] shadow-[0_0_20px_rgba(6,214,160,0.2)]' 
          : 'border-white/10 hover:border-white/20'
        }
        ${className}
      `}
      {...props}
    >
      <div className="p-4">
        <h2 className="font-mono text-sm uppercase tracking-wide text-[#06D6A0] mb-2">
          {title}
        </h2>
        <p className="text-white/70 text-sm leading-relaxed">
          {children}
        </p>
      </div>
    </article>
  );
}
