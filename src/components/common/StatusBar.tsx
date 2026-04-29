"use client";

/**
 * iOS 스타일의 상태바 (시간/시그널/와이파이/배터리)
 * 메인 화면 상단의 장식용 요소.
 */
export default function StatusBar() {
  // 현재 시간을 09:41 같은 형태로 표기 (디자인 톤 유지)
  return (
    <div className="status-bar">
      <span className="sb-time">9:41</span>
      <div className="sb-notch" />
      <div className="sb-icons">
        {/* 시그널 */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="4" rx="0.5" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
        </svg>
        {/* 와이파이 */}
        <svg width="14" height="11" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
          <path d="M8 11.5 L9.5 9.5 L8 8 L6.5 9.5 Z" />
          <path d="M3 6.5 C5 4.5 11 4.5 13 6.5 L11 8.5 C9.5 7 6.5 7 5 8.5 Z" />
          <path d="M0.5 4 C4 0 12 0 15.5 4 L13.5 6 C10.5 3 5.5 3 2.5 6 Z" />
        </svg>
        {/* 배터리 */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="19" height="8" rx="1" fill="currentColor" />
          <rect x="23" y="3.5" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
