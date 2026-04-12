'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface NavItem {
  label: string;
  route?: string;
  href?: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
}

interface NavbarProps {
  logo?: string;
  brand?: string;
  items?: NavItem[];
  align?: 'left' | 'right' | 'spread';
  onItemClicked?: (item: NavItem) => void;
  children?: React.ReactNode;
}

export function Navbar({
  logo,
  brand,
  items = [],
  align = 'spread',
  onItemClicked,
  children,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdownLabel, setOpenDropdownLabel] = useState<string | null>(null);
  const [dropdownLeftPx, setDropdownLeftPx] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hostRef.current?.contains(e.target as Node)) {
        setOpenDropdownLabel(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function toggleNavDropdown(item: NavItem, e: React.MouseEvent) {
    e.stopPropagation();
    if (openDropdownLabel === item.label) {
      setOpenDropdownLabel(null);
      return;
    }
    const trigger = e.currentTarget as HTMLElement;
    const hostRect = hostRef.current!.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    setDropdownLeftPx(triggerRect.left - hostRect.left);
    setOpenDropdownLabel(item.label);
  }

  function onNavItemClick(item: NavItem) {
    onItemClicked?.(item);
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="navbar-host" ref={hostRef}>
      <nav className="navbar">
        <div className="navbar-container">
          {(logo || brand) && (
            <Link className="navbar-brand" href="/">
              {logo && <img src={logo} alt={brand || 'Logo'} className="navbar-logo" />}
              {brand && <span className="navbar-text">{brand}</span>}
            </Link>
          )}
          <div className={`navbar-menu align-${align}`}>
            {items.map((item) =>
              item.children?.length ? (
                <button
                  key={item.label}
                  className={`navbar-item${openDropdownLabel === item.label ? ' is-active' : ''}`}
                  onClick={(e) => toggleNavDropdown(item, e)}
                >
                  {item.icon && <span className="navbar-item-icon">{item.icon}</span>}
                  <span className="navbar-item-label">{item.label}</span>
                  {item.badge != null && <span className="navbar-badge">{item.badge}</span>}
                  <svg
                    className={`navbar-chevron${openDropdownLabel === item.label ? ' rotated' : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 4l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : item.route ? (
                <Link
                  key={item.label}
                  className="navbar-item"
                  href={item.route}
                  onClick={() => onNavItemClick(item)}
                >
                  {item.icon && <span className="navbar-item-icon">{item.icon}</span>}
                  <span className="navbar-item-label">{item.label}</span>
                  {item.badge != null && <span className="navbar-badge">{item.badge}</span>}
                </Link>
              ) : (
                <a
                  key={item.label}
                  className="navbar-item"
                  href={item.href || '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavItemClick(item);
                  }}
                >
                  {item.icon && <span className="navbar-item-icon">{item.icon}</span>}
                  <span className="navbar-item-label">{item.label}</span>
                  {item.badge != null && <span className="navbar-badge">{item.badge}</span>}
                </a>
              ),
            )}
          </div>
          <div className="navbar-actions">{children}</div>
          <button
            className={`navbar-toggle${isMobileMenuOpen ? ' active' : ''}`}
            onClick={() => {
              setIsMobileMenuOpen((v) => !v);
              setOpenDropdownLabel(null);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {items.map((item) =>
        item.children?.length && openDropdownLabel === item.label ? (
          <div
            key={item.label}
            className="navbar-nav-dropdown"
            style={{ left: dropdownLeftPx }}
            role="menu"
          >
            {item.children.map((child) =>
              child.route ? (
                <Link
                  key={child.label}
                  className="navbar-nav-option"
                  href={child.route}
                  onClick={() => {
                    setOpenDropdownLabel(null);
                    onNavItemClick(child);
                  }}
                  role="menuitem"
                >
                  {child.icon && <span className="navbar-option-icon">{child.icon}</span>}
                  {child.label}
                </Link>
              ) : (
                <a
                  key={child.label}
                  className="navbar-nav-option"
                  href={child.href || '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDropdownLabel(null);
                    onNavItemClick(child);
                  }}
                  role="menuitem"
                >
                  {child.icon && <span className="navbar-option-icon">{child.icon}</span>}
                  {child.label}
                </a>
              ),
            )}
          </div>
        ) : null,
      )}

      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu" role="navigation">
          {items.map((item) =>
            item.children?.length ? (
              <div key={item.label} className="navbar-mobile-group">
                <div className="navbar-mobile-group-label">
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </div>
                {item.children.map((child) =>
                  child.route ? (
                    <Link
                      key={child.label}
                      className="navbar-mobile-item navbar-mobile-child"
                      href={child.route}
                      onClick={() => onNavItemClick(child)}
                    >
                      {child.icon && <span className="navbar-item-icon">{child.icon}</span>}
                      {child.label}
                    </Link>
                  ) : null,
                )}
              </div>
            ) : item.route ? (
              <Link
                key={item.label}
                className="navbar-mobile-item"
                href={item.route}
                onClick={() => onNavItemClick(item)}
              >
                {item.icon && <span className="navbar-item-icon">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge != null && <span className="navbar-badge">{item.badge}</span>}
              </Link>
            ) : (
              <a
                key={item.label}
                className="navbar-mobile-item"
                href={item.href || '#'}
                onClick={(e) => {
                  e.preventDefault();
                  onNavItemClick(item);
                }}
              >
                {item.icon && <span className="navbar-item-icon">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge != null && <span className="navbar-badge">{item.badge}</span>}
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}
