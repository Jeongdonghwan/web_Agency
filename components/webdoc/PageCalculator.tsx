'use client';
import { useState } from 'react';

// 영업 지역 수 × 서비스 수 = 필요한 페이지 수. 숫자는 사용자가 넣는 값으로만 계산한다.
export default function PageCalculator({ regions = 10, services = 5, label = '서비스', title = '우리 업체는 페이지가 몇 개 필요할까?' }: { regions?: number; services?: number; label?: string; title?: string }) {
  const [r, setR] = useState(regions);
  const [s, setS] = useState(services);
  const clamp = (v: string) => Math.max(1, Math.min(500, Number(v.replace(/\D/g, '')) || 1));
  return (
    <div className="wd-calc">
      <p className="wd-calc-title">{title}</p>
      <div className="wd-calc-row">
        <label>
          영업 지역
          <input inputMode="numeric" value={r} onChange={(e) => setR(clamp(e.target.value))} aria-label="영업 지역 수" />
          곳
        </label>
        <span className="wd-calc-op" aria-hidden="true">×</span>
        <label>
          {label}
          <input inputMode="numeric" value={s} onChange={(e) => setS(clamp(e.target.value))} aria-label={`${label} 수`} />
          가지
        </label>
        <span className="wd-calc-op" aria-hidden="true">=</span>
        <output className="wd-calc-out">{(r * s).toLocaleString('ko-KR')}페이지</output>
      </div>
      <p className="wd-calc-note">{label} {s}가지 중 검색이 거의 없는 조합은 빼고 시작하므로 실제 제작 수는 상담에서 정합니다.</p>
    </div>
  );
}
