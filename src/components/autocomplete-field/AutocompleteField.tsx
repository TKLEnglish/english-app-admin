'use client';
import { useState, useEffect, useRef } from 'react';

export interface AutocompleteOption {
  label: string;
  value: string | number;
}

interface AutocompleteFieldProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary';
  label?: string;
  hint?: string;
  validateMessage?: string;
  options?: AutocompleteOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multi?: boolean;
  value?: string | number;
  values?: (string | number)[];
  onChange?: (value: string | number) => void;
  onChanges?: (values: (string | number)[]) => void;
}

export function AutocompleteField({
  size = 'md',
  color = 'primary',
  label,
  hint,
  validateMessage,
  options = [],
  placeholder = 'Type to search...',
  disabled = false,
  required = false,
  multi = false,
  value,
  values = [],
  onChange,
  onChanges,
}: AutocompleteFieldProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSingle, setSelectedSingle] = useState<string | number>(value ?? '');
  const [selectedMulti, setSelectedMulti] = useState<(string | number)[]>(values);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) &&
      (multi ? !selectedMulti.includes(o.value) : true),
  );

  function openDropdown() {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setIsOpen(true);
    setHighlighted(-1);
  }

  function selectOption(option: AutocompleteOption) {
    if (multi) {
      const next = [...selectedMulti, option.value];
      setSelectedMulti(next);
      onChanges?.(next);
      setQuery('');
      inputRef.current?.focus();
    } else {
      setSelectedSingle(option.value);
      setQuery(option.label);
      onChange?.(option.value);
      setIsOpen(false);
    }
    setHighlighted(-1);
  }

  function removeChip(val: string | number) {
    const next = selectedMulti.filter((v) => v !== val);
    setSelectedMulti(next);
    onChanges?.(next);
  }

  function onKeydown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filteredOptions.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      selectOption(filteredOptions[highlighted]);
    }
    if (e.key === 'Backspace' && query === '' && multi && selectedMulti.length > 0) {
      removeChip(selectedMulti[selectedMulti.length - 1]);
    }
  }

  const singleLabel = options.find((o) => o.value === selectedSingle)?.label ?? '';

  return (
    <div className="field">
      {label && <label className={`field-label${required ? ' required' : ''}`}>{label}</label>}
      <div
        ref={wrapperRef}
        className={`field-input-wrapper ${size} ${color}${isOpen ? ' open' : ''}${validateMessage ? ' error' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`field-control${disabled ? ' is-disabled' : ''}${selectedSingle !== '' || selectedMulti.length > 0 ? ' has-value' : ''}`}
          onClick={openDropdown}
        >
          {multi &&
            selectedMulti.map((v) => {
              const opt = options.find((o) => o.value === v);
              return opt ? (
                <span key={v} className="chip">
                  {opt.label}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChip(v);
                    }}
                    aria-label={`Remove ${opt.label}`}
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          <input
            ref={inputRef}
            type="text"
            className="field-autocomplete-input"
            placeholder={
              multi
                ? selectedMulti.length === 0
                  ? placeholder
                  : ''
                : selectedSingle === ''
                  ? placeholder
                  : singleLabel
            }
            value={query}
            disabled={disabled}
            onChange={onInputChange}
            onFocus={() => {
              if (!disabled) setIsOpen(true);
            }}
            onKeyDown={onKeydown}
            aria-autocomplete="list"
            aria-expanded={isOpen}
          />
          <svg
            className={`field-trigger-arrow${isOpen ? ' rotated' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((v) => !v);
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {isOpen && (
          <div className="field-dropdown" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, i) => (
                <div
                  key={option.value}
                  className={`field-option${!multi && selectedSingle === option.value ? ' selected' : ''}${highlighted === i ? ' highlighted' : ''}`}
                  role="option"
                  aria-selected={!multi && selectedSingle === option.value}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlighted(i)}
                >
                  <span>{option.label}</span>
                  {!multi && selectedSingle === option.value && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="field-option no-results" style={{ opacity: 0.6, cursor: 'default' }}>
                No results found
              </div>
            )}
          </div>
        )}
      </div>
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  );
}
