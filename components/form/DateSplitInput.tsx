'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  name: string;
  value?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
};

function splitDate(value?: string) {
  if (!value) return { day: '', month: '', year: '' };

  const normalized = value.includes('/')
    ? value.split('/').reverse().join('-')
    : value;

  const parts = normalized.split('-');
  if (parts.length !== 3) return { day: '', month: '', year: '' };

  return {
    year: parts[0] ?? '',
    month: parts[1] ?? '',
    day: parts[2] ?? '',
  };
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function DateSplitInput({
  name,
  value,
  required,
  onValueChange,
}: Props) {
  const initial = useMemo(() => splitDate(value), [value]);

  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDay(initial.day);
    setMonth(initial.month);
    setYear(initial.year);
  }, [initial.day, initial.month, initial.year]);

  const normalizedDate =
    day.length === 2 && month.length === 2 && year.length === 4
      ? `${year}-${month}-${day}`
      : '';

  useEffect(() => {
    if (onValueChange) {
      onValueChange(normalizedDate);
    }
  }, [normalizedDate, onValueChange]);

  function handleDayChange(value: string) {
    const cleaned = onlyDigits(value).slice(0, 2);
    setDay(cleaned);
    if (cleaned.length === 2) monthRef.current?.focus();
  }

  function handleMonthChange(value: string) {
    const cleaned = onlyDigits(value).slice(0, 2);
    setMonth(cleaned);
    if (cleaned.length === 2) yearRef.current?.focus();
  }

  function handleYearChange(value: string) {
    const cleaned = onlyDigits(value).slice(0, 4);
    setYear(cleaned);
  }

  function handleBackspace(
    e: React.KeyboardEvent<HTMLInputElement>,
    currentValue: string,
    previousRef?: React.RefObject<HTMLInputElement | null>
  ) {
    if (e.key === 'Backspace' && currentValue.length === 0) {
      previousRef?.current?.focus();
    }
  }

  return (
    <div className="date-split">
      <input
        ref={dayRef}
        className="input date-split-part"
        inputMode="numeric"
        placeholder="GG"
        value={day}
        onChange={(e) => handleDayChange(e.target.value)}
        onKeyDown={(e) => handleBackspace(e, day)}
        maxLength={2}
      />

      <span className="date-split-sep">/</span>

      <input
        ref={monthRef}
        className="input date-split-part"
        inputMode="numeric"
        placeholder="MM"
        value={month}
        onChange={(e) => handleMonthChange(e.target.value)}
        onKeyDown={(e) => handleBackspace(e, month, dayRef)}
        maxLength={2}
      />

      <span className="date-split-sep">/</span>

      <input
        ref={yearRef}
        className="input date-split-part date-split-year"
        inputMode="numeric"
        placeholder="AAAA"
        value={year}
        onChange={(e) => handleYearChange(e.target.value)}
        onKeyDown={(e) => handleBackspace(e, year, monthRef)}
        maxLength={4}
      />

      <input type="hidden" name={name} value={normalizedDate} required={required} />
    </div>
  );
}