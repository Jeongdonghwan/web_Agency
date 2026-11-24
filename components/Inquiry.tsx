'use client';
import { useEffect, useRef, useState } from 'react';
import { COMPANY } from '../lib/site';

// 상담 문의란 — server/inquiry.py 의 POST /api/inquiry 로 보낸다. 받은 내용은 /admin/ 에서 확인한다.
export default function Inquiry({ endpoint }: { endpoint: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  // 완료 창: 열리면 닫기 버튼에 초점, Esc 로 닫기, 뒤 페이지 스크롤 잠금
  useEffect(() => {
    if (state !== 'done') return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setState('idle');
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [state]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('sending');
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || '전송하지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
      form.reset();
      setState('done');
    } catch (err) {
      setMsg(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : '전송하지 못했습니다. 잠시 뒤 다시 시도하거나 카톡으로 문의해 주세요.');
      setState('error');
    }
  };

  return (
    <>
      <form className="inq" onSubmit={submit}>
        <label>
          <span>상호 또는 성함 <i>필수</i></span>
          <input name="name" required maxLength={40} autoComplete="name" />
        </label>
        <label>
          <span>연락처 <i>필수</i></span>
          <input name="phone" required maxLength={20} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" pattern="[0-9+\- ]{8,20}" title="숫자와 - 만 입력해 주세요" />
        </label>
        <label className="inq-wide">
          <span>업종</span>
          <input name="industry" maxLength={40} placeholder="예: 하수구, 입주청소" />
        </label>
        <label className="inq-wide">
          <span>문의 내용</span>
          <textarea name="message" rows={4} maxLength={1000} />
        </label>
        {/* 사람 눈에는 안 보이는 칸 — 자동 등록 프로그램이 채우면 서버가 버린다 */}
        <input name="website" tabIndex={-1} autoComplete="off" className="inq-hp" aria-hidden="true" />
        <label className="inq-wide inq-agree">
          <input type="checkbox" name="agree" value="1" required />
          <span>개인정보 수집·이용에 동의합니다. <small>수집 항목: 상호·성함, 연락처, 업종, 문의 내용 / 목적: 상담 안내 / 보유 기간: 상담 종료 후 1년, 요청하시면 바로 삭제합니다.</small></span>
        </label>
        <div className="inq-wide inq-foot">
          <button className="inq-btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? '보내는 중…' : '상담 신청하기'}</button>
          {state === 'error' && <p className="inq-err" role="alert">{msg}</p>}
        </div>
      </form>

      {state === 'done' && (
        <div className="inq-modal" onClick={(e) => e.target === e.currentTarget && setState('idle')}>
          <div className="inq-card" role="dialog" aria-modal="true" aria-labelledby="inq-done-title" aria-describedby="inq-done-text">
            <svg className="inq-check" viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="32" />
              <path d="M22 37.5l9.5 9.5L51 27" />
            </svg>
            <h3 id="inq-done-title">상담 신청이 완료되었습니다</h3>
            <p id="inq-done-text">
              담당자가 내용을 확인한 뒤 남겨 주신 연락처로 <b>순서대로 연락드립니다.</b>
              <br />
              조금만 기다려 주세요.
            </p>
            <div className="inq-card-act">
              <button ref={closeRef} type="button" className="inq-btn" onClick={() => setState('idle')}>확인</button>
              <a className="inq-kakao" href={COMPANY.kakao} target="_blank" rel="noopener noreferrer">급하시면 카톡으로 바로 문의</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
