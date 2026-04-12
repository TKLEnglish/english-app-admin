'use client';
import Link from 'next/link';

interface GlassCardProps {
  icon?: string;
  iconColor?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose';
  title?: string;
  description?: string;
  route?: string;
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function GlassCard({
  icon,
  iconColor = 'blue',
  title,
  description,
  route,
  href,
  onClick,
  children,
}: GlassCardProps) {
  const content = (
    <>
      {icon && (
        <span className="card-icon" data-color={iconColor}>
          {icon}
        </span>
      )}
      <div className="card-body">
        {title && <span className="card-title">{title}</span>}
        {description && <span className="card-desc">{description}</span>}
        {children}
      </div>
    </>
  );

  if (route)
    return (
      <Link className="card" href={route} onClick={onClick}>
        {content}
      </Link>
    );
  if (href)
    return (
      <a className="card" href={href} onClick={onClick}>
        {content}
      </a>
    );
  return (
    <div className="card" onClick={onClick}>
      {content}
    </div>
  );
}
