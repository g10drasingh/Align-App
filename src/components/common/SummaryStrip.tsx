/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flag, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SummaryStripProps {
  selectedSegment?: string | null;
  onSelectSegment?: (segment: 'open' | 'overdue' | 'due_soon' | 'active' | 'ceo') => void;
  size?: 'normal' | 'large'; // 'large' for dashboard (32px numbers)
}

export const SummaryStrip: React.FC<SummaryStripProps> = ({
  selectedSegment,
  onSelectSegment,
  size = 'normal',
}) => {
  const {
    summaryCounts,
    dueSoonWindow,
    setDueSoonWindow,
    dueSoonUnit,
    setDueSoonUnit,
    setActiveNav,
  } = useApp();

  const handleSegmentClick = (segment: 'open' | 'overdue' | 'due_soon' | 'active' | 'ceo') => {
    if (onSelectSegment) {
      onSelectSegment(segment);
    } else {
      // Default: jump to Tasks with that filter
      setActiveNav(segment === 'ceo' ? 'ceo' : 'tasks');
    }
  };

  const isLarge = size === 'large';

  return (
    <div className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-2xs overflow-hidden select-none">
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
        {/* 1. Open Tasks */}
        <button
          onClick={() => handleSegmentClick('open')}
          className={`flex flex-col justify-between p-3.5 text-left transition-colors cursor-pointer group ${
            selectedSegment === 'open'
              ? 'bg-[var(--brand-subtle)] ring-1 ring-inset ring-[var(--brand-border)]'
              : 'hover:bg-[var(--surface-2)]'
          }`}
        >
          <span className="text-xs font-medium text-[var(--text-2)] group-hover:text-[var(--text)]">
            Open
          </span>
          <span
            className={`font-semibold tabular-nums mt-1 text-[var(--text)] ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            {summaryCounts.open}
          </span>
        </button>

        {/* 2. Overdue */}
        <button
          onClick={() => handleSegmentClick('overdue')}
          className={`flex flex-col justify-between p-3.5 text-left transition-colors cursor-pointer group ${
            selectedSegment === 'overdue'
              ? 'bg-red-50 dark:bg-red-950/40 ring-1 ring-inset ring-red-300 dark:ring-red-800'
              : 'hover:bg-[var(--surface-2)]'
          }`}
        >
          <span className="text-xs font-medium text-[var(--text-2)] group-hover:text-[var(--text)]">
            Overdue
          </span>
          <span
            className={`font-semibold tabular-nums mt-1 ${
              summaryCounts.overdue > 0 ? 'text-[var(--danger-fg)]' : 'text-[var(--text-3)]'
            } ${isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'}`}
          >
            {summaryCounts.overdue}
          </span>
        </button>

        {/* 3. Due in next X [days/weeks/month] */}
        <div
          className={`flex flex-col justify-between p-3.5 text-left transition-colors cursor-pointer group ${
            selectedSegment === 'due_soon'
              ? 'bg-[var(--brand-subtle)] ring-1 ring-inset ring-[var(--brand-border)]'
              : 'hover:bg-[var(--surface-2)]'
          }`}
          onClick={(e) => {
            // Only trigger segment click if not interacting with input/select
            if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
              handleSegmentClick('due_soon');
            }
          }}
        >
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-medium text-[var(--text-2)]">
            <span>Due next</span>
            <input
              type="number"
              min={1}
              max={90}
              value={dueSoonWindow}
              onChange={(e) => setDueSoonWindow(Math.max(1, parseInt(e.target.value) || 1))}
              onClick={(e) => e.stopPropagation()}
              className="w-10 rounded border border-[var(--border-strong)] bg-[var(--surface)] px-1 py-0.5 text-center text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-600)]"
            />
            <select
              value={dueSoonUnit}
              onChange={(e) => setDueSoonUnit(e.target.value as any)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border border-[var(--border-strong)] bg-[var(--surface)] px-1 py-0.5 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-600)]"
            >
              <option value="days">days</option>
              <option value="weeks">wks</option>
              <option value="months">mo</option>
            </select>
          </div>
          <span
            className={`font-semibold tabular-nums mt-1 text-[var(--text)] ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            {summaryCounts.dueSoon}
          </span>
        </div>

        {/* 4. Active */}
        <button
          onClick={() => handleSegmentClick('active')}
          className={`flex flex-col justify-between p-3.5 text-left transition-colors cursor-pointer group ${
            selectedSegment === 'active'
              ? 'bg-[var(--brand-subtle)] ring-1 ring-inset ring-[var(--brand-border)]'
              : 'hover:bg-[var(--surface-2)]'
          }`}
        >
          <span className="text-xs font-medium text-[var(--text-2)] group-hover:text-[var(--text)]">
            Active
          </span>
          <span
            className={`font-semibold tabular-nums mt-1 text-[var(--text)] ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            {summaryCounts.active}
          </span>
        </button>

        {/* 5. Needs CEO Attention (Plum) */}
        <button
          onClick={() => handleSegmentClick('ceo')}
          className={`col-span-2 sm:col-span-1 flex flex-col justify-between p-3.5 text-left transition-colors cursor-pointer group ${
            selectedSegment === 'ceo'
              ? 'bg-[var(--attention-bg)] ring-1 ring-inset ring-[var(--attention-border)]'
              : 'hover:bg-[var(--surface-2)]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--attention-fg)]">
            <Flag className="h-3.5 w-3.5 fill-[var(--attention-fg)]" />
            <span>Needs CEO</span>
          </div>
          <span
            className={`font-semibold tabular-nums mt-1 text-[var(--attention-fg)] ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            {summaryCounts.needsCeo}
          </span>
        </button>
      </div>
    </div>
  );
};
