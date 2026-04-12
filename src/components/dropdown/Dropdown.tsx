'use client';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

export interface DropdownItem {
  label?: string;
  value?: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  children?: DropdownItem[];
}

export interface DropdownGroup {
  label?: string;
  items: DropdownItem[];
}

interface FlatItem {
  item: DropdownItem;
  gi: number;
  i: number;
}

interface DropdownProps {
  items?: DropdownItem[];
  groups?: DropdownGroup[];
  placement?: 'bottom-start' | 'bottom-end';
  onSelected?: (item: DropdownItem) => void;
  children: React.ReactNode;
}

export function Dropdown({
  items = [],
  groups = [],
  placement = 'bottom-start',
  onSelected,
  children,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenuKey, setOpenSubmenuKey] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resolvedGroups: DropdownGroup[] = groups.length ? groups : items.length ? [{ items }] : [];

  const flatItems: FlatItem[] = [];
  for (const [gi, group] of resolvedGroups.entries()) {
    for (const [i, item] of group.items.entries()) {
      if (!item.separator && !item.disabled) flatItems.push({ item, gi, i });
    }
  }

  function key(gi: number, i: number) {
    return `${gi}:${i}`;
  }
  function isSubmenuOpen(gi: number, i: number) {
    return openSubmenuKey === key(gi, i);
  }
  function isFocused(gi: number, i: number) {
    const f = flatItems[focusedIdx];
    return f ? f.gi === gi && f.i === i : false;
  }

  function close() {
    setIsOpen(false);
    setOpenSubmenuKey('');
    setFocusedIdx(-1);
  }

  function emitItem(item: DropdownItem) {
    onSelected?.(item);
    close();
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  function onTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isOpen) close();
    else {
      setIsOpen(true);
      setFocusedIdx(-1);
    }
  }

  function onTriggerKeydown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIdx(0);
    }
  }

  function onPanelKeydown(e: React.KeyboardEvent) {
    const idx = focusedIdx;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, flatItems.length - 1));
        setOpenSubmenuKey('');
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        setOpenSubmenuKey('');
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (idx >= 0 && flatItems[idx]?.item.children?.length)
          setOpenSubmenuKey(key(flatItems[idx].gi, flatItems[idx].i));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setOpenSubmenuKey('');
        break;
      case 'Enter': {
        e.preventDefault();
        if (idx >= 0 && flatItems[idx]) {
          const { item, gi, i } = flatItems[idx];
          if (item.children?.length) setOpenSubmenuKey(key(gi, i));
          else emitItem(item);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        if (openSubmenuKey) setOpenSubmenuKey('');
        else close();
        break;
      case 'Tab':
        close();
        break;
    }
  }

  return (
    <div ref={wrapperRef} className="dropdown-host" onClick={(e) => e.stopPropagation()}>
      <div
        className="dropdown-trigger"
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeydown}
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        {children}
      </div>

      {isOpen && (
        <div
          className={`dropdown-panel${placement === 'bottom-end' ? ' align-end' : ''}`}
          role="menu"
          onKeyDown={onPanelKeydown}
          tabIndex={-1}
        >
          {resolvedGroups.map((group, gi) => (
            <div key={gi} className="dropdown-group">
              {group.label && <div className="dropdown-group-label">{group.label}</div>}
              {group.items.map((item, i) => {
                if (item.separator) {
                  return <div key={i} className="dropdown-sep" role="separator" />;
                }
                const focused = isFocused(gi, i);
                const hasChildren = !!item.children?.length;
                return (
                  <div key={i} className="dropdown-item-wrapper" style={{ position: 'relative' }}>
                    <div
                      className={`dropdown-item${item.disabled ? ' disabled' : ''}${item.danger ? ' danger' : ''}${focused ? ' focused' : ''}`}
                      role="menuitem"
                      aria-disabled={item.disabled}
                      aria-haspopup={hasChildren || undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!item.disabled && !item.separator) {
                          if (hasChildren) return;
                          emitItem(item);
                        }
                      }}
                      onMouseEnter={() => {
                        const idx = flatItems.findIndex((f) => f.gi === gi && f.i === i);
                        if (idx >= 0) setFocusedIdx(idx);
                        if (hasChildren) setOpenSubmenuKey(key(gi, i));
                        else setOpenSubmenuKey('');
                      }}
                    >
                      {item.icon && <span className="item-icon">{item.icon}</span>}
                      <span className="item-label">{item.label}</span>
                      {hasChildren && (
                        <svg
                          className="item-arrow"
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </div>
                    {hasChildren && isSubmenuOpen(gi, i) && (
                      <div className="dropdown-submenu" role="menu">
                        {item.children!.map((child, ci) =>
                          child.separator ? (
                            <div key={ci} className="dropdown-sep" role="separator" />
                          ) : (
                            <div
                              key={ci}
                              className={`dropdown-item${child.disabled ? ' disabled' : ''}${child.danger ? ' danger' : ''}`}
                              role="menuitem"
                              aria-disabled={child.disabled}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!child.disabled) emitItem(child);
                              }}
                            >
                              {child.icon && <span className="item-icon">{child.icon}</span>}
                              <span className="item-label">{child.label}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
