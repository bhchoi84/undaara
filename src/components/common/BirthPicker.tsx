"use client";

import { useState, useCallback } from "react";

const MAX_YEAR = new Date().getFullYear();
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

interface BirthPickerProps {
  value: { y: string; m: string; d: string };
  onChange: (v: { y: string; m: string; d: string }) => void;
  calendar?: string;
}

type PickerMode = "year" | "month" | "day" | null;

export default function BirthPicker({ value, onChange, calendar = "양력" }: BirthPickerProps) {
  const [mode, setMode] = useState<PickerMode>(null);
  const [decade, setDecade] = useState(() => Math.floor(MAX_YEAR / 10) * 10);

  const close = useCallback(() => setMode(null), []);

  const hasY = !!value.y;
  const hasM = !!value.m;
  const hasD = !!value.d;

  return (
    <>
      <div className="birth-select-row">
        <button
          type="button"
          className={`birth-pick-btn birth-sel ${hasY ? "has-value" : ""}`}
          onClick={() => { setDecade(Math.floor(MAX_YEAR / 10) * 10); setMode("year"); }}
        >
          {hasY ? `${value.y}년` : "년"}
        </button>
        <button
          type="button"
          className={`birth-pick-btn birth-sel ${hasM ? "has-value" : ""}`}
          onClick={() => setMode("month")}
        >
          {hasM ? `${parseInt(value.m)}월` : "월"}
        </button>
        <button
          type="button"
          className={`birth-pick-btn birth-sel ${hasD ? "has-value" : ""}`}
          onClick={() => setMode("day")}
        >
          {hasD ? `${parseInt(value.d)}일` : "일"}
        </button>
      </div>

      {mode && (
        <div className="bp-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="bp-popup">
            {mode === "year" && (
              <YearPicker
                decade={decade}
                setDecade={setDecade}
                selected={value.y}
                onSelect={(y) => { onChange({ ...value, y }); close(); }}
              />
            )}
            {mode === "month" && (
              <MonthPicker
                selected={value.m}
                onSelect={(m) => { onChange({ ...value, m }); close(); }}
              />
            )}
            {mode === "day" && (
              <DayPicker
                year={parseInt(value.y) || new Date().getFullYear()}
                month={parseInt(value.m) || new Date().getMonth() + 1}
                selected={value.d}
                calendar={calendar}
                onSelect={(d) => { onChange({ ...value, d }); close(); }}
              />
            )}
            <button className="bp-close-bottom" onClick={close}>닫기</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── 년 선택 ── */
function YearPicker({
  decade, setDecade, selected, onSelect,
}: {
  decade: number; setDecade: (d: number) => void; selected: string; onSelect: (y: string) => void;
}) {
  const start = decade;
  const end = Math.min(decade + 9, MAX_YEAR);

  return (
    <>
      <div className="bp-header">
        <button
          className="bp-nav"
          style={{ visibility: decade > 1940 ? "visible" : "hidden" }}
          onClick={() => setDecade(decade - 10)}
        >◀</button>
        <span className="bp-title">{start}~{end}</span>
        <button
          className="bp-nav"
          style={{ visibility: decade + 10 <= MAX_YEAR ? "visible" : "hidden" }}
          onClick={() => setDecade(decade + 10)}
        >▶</button>
      </div>
      <div className="bp-grid bp-grid-year">
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((y) => (
          <button
            key={y}
            className={`bp-item ${selected === String(y) ? "selected" : ""}`}
            onClick={() => onSelect(String(y))}
          >
            {y}년
          </button>
        ))}
      </div>
    </>
  );
}

/* ── 월 선택 ── */
function MonthPicker({
  selected, onSelect,
}: {
  selected: string; onSelect: (m: string) => void;
}) {
  return (
    <>
      <div className="bp-header">
        <span className="bp-title">월 선택</span>
      </div>
      <div className="bp-grid bp-grid-month">
        {Array.from({ length: 12 }, (_, i) => {
          const mv = String(i + 1).padStart(2, "0");
          return (
            <button
              key={mv}
              className={`bp-item ${selected === mv ? "selected" : ""}`}
              onClick={() => onSelect(mv)}
            >
              {i + 1}월
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ── 일 선택 (달력형) ── */
function DayPicker({
  year, month, selected, calendar, onSelect,
}: {
  year: number; month: number; selected: string; calendar: string; onSelect: (d: string) => void;
}) {
  const days = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  return (
    <>
      <div className="bp-header">
        <span className="bp-title">
          {year}년 {month}월 <span className="bp-cal-tag">{calendar}</span>
        </span>
      </div>
      <div className="bp-grid bp-grid-day">
        {DAY_NAMES.map((d, i) => (
          <span key={d} className={`bp-day-name ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>
            {d}
          </span>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <span key={`empty-${i}`} className="bp-empty" />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const dv = String(d).padStart(2, "0");
          const dow = (firstDay + i) % 7;
          const dayClass = dow === 0 ? " sun" : dow === 6 ? " sat" : "";
          return (
            <button
              key={d}
              className={`bp-item${dayClass} ${selected === dv ? "selected" : ""}`}
              onClick={() => onSelect(dv)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </>
  );
}
