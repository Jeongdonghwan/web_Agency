'use client';
import { useState } from 'react';

const won = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^0-9]/g, '')) || 0);

function Field({ label, value, set }: { label: string; value: number; set: (v: number) => void }) {
  return (
    <label>
      {label}
      <input inputMode="numeric" value={value.toLocaleString('ko-KR')} onChange={(e) => set(num(e.target.value))} />
    </label>
  );
}

// 광고비 환산: 하루 클릭 × 클릭당 광고비. 기본값은 예시이며 실제 값은 사용자가 넣는다.
export function AdCalc() {
  const [clicks, setClicks] = useState(30);
  const [cpc, setCpc] = useState(3000);
  const day = clicks * cpc;
  return (
    <div className="calc">
      <h3>광고로 샀다면 얼마였을까</h3>
      <Field label="하루 클릭 수" value={clicks} set={setClicks} />
      <Field label="클릭당 광고비(원)" value={cpc} set={setCpc} />
      <dl className="calc-out" aria-live="polite">
        <div><dt>하루</dt><dd>{won(day)}</dd></div>
        <div className="big"><dt>30일</dt><dd>{won(day * 30)}</dd></div>
      </dl>
      <small>처음 들어 있는 숫자는 예시입니다. 클릭당 광고비는 업종·지역마다 크게 다르니 검색광고 관리 화면의 실제 값을 넣어 보세요. 환산 금액은 참고값이며 매출을 뜻하지 않습니다.</small>
    </div>
  );
}

// 페이지 수: 지역 × 서비스
export function PageCalc({ regions = 20, services = 8, name = '' }: { regions?: number; services?: number; name?: string }) {
  const [r, setR] = useState(regions);
  const [s, setS] = useState(services);
  return (
    <div className="calc">
      <h3>{name ? `${name} 페이지 수 계산` : '페이지 수 계산'}</h3>
      <Field label="영업 지역 수(곳)" value={r} set={setR} />
      <Field label="서비스 수(가지)" value={s} set={setS} />
      <dl className="calc-out" aria-live="polite">
        <div className="big"><dt>기본 페이지 수</dt><dd>{(r * s).toLocaleString('ko-KR')}개</dd></div>
      </dl>
      <small>실제로 가는 지역과 하는 서비스만 넣으세요. 비용·시기 같은 정보글은 여기에 더해집니다.</small>
    </div>
  );
}
