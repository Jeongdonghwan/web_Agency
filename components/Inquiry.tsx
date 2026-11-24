'use client';
import { useState } from 'react';

// 상담 문의란 — server/inquiry.py 의 POST /api/inquiry 로 보낸다. 받은 내용은 /admin/ 에서 확인한다.
export default function Inquiry({ endpoint }: { endpoint: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('sending');
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || '전송하지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
      setState('done');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : '전송하지 못했습니다. 잠시 뒤 다시 시도하거나 카톡으로 문의해 주세요.');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="inq inq-done" role="status">
        <b>문의가 접수되었습니다.</b>
        <p>확인하는 대로 남겨 주신 연락처로 연락드리겠습니다.</p>
      </div>
    );
  }

  return (
    <form className="inq" onSubmit={submit}>
      <label>
        <span>상호 또는 성함 <i>필수</i></span>
        <input name="name" required maxLength={40} autoComplete="name" />
      </label>
      <label>
        <span>연락처 <i>필수</i></span>
        <input name="phone" required maxLength={20} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" pattern="[0-9+\- ]{8,20}" title="숫자와 - 만 입력해 주세요" />
      </label>
      <label>
        <span>업종</span>
        <input name="industry" maxLength={40} placeholder="예: 하수구, 입주청소" />
      </label>
      <label>
        <span>홍보할 지역</span>
        <input name="region" maxLength={60} placeholder="예: 수원·화성·용인" />
      </label>
      <label className="inq-wide">
        <span>문의 내용</span>
        <textarea name="message" rows={4} maxLength={1000} />
      </label>
      {/* 사람 눈에는 안 보이는 칸 — 자동 등록 프로그램이 채우면 서버가 버린다 */}
      <input name="website" tabIndex={-1} autoComplete="off" className="inq-hp" aria-hidden="true" />
      <label className="inq-wide inq-agree">
        <input type="checkbox" name="agree" value="1" required />
        <span>개인정보 수집·이용에 동의합니다. <small>수집 항목: 상호·성함, 연락처, 업종, 지역, 문의 내용 / 목적: 상담 안내 / 보유 기간: 상담 종료 후 1년, 요청하시면 바로 삭제합니다.</small></span>
      </label>
      <div className="inq-wide inq-foot">
        <button className="inq-btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? '보내는 중…' : '상담 문의 보내기'}</button>
        {state === 'error' && <p className="inq-err" role="alert">{msg}</p>}
      </div>
    </form>
  );
}
