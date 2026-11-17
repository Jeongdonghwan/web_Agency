'use client';
// 검색 결과 예시 그림을 업종별로 돌려 보여 준다. 아래 업종 이름을 누르면 그 업종으로 바뀐다.
import { useEffect, useState } from 'react';
import { Serp } from './ui';

const ITEMS: { label: string; q: string; rows: string[] }[] = [
  { label: '하수구', q: '김포 하수구', rows: ['일산 하수구 뚫는 업체', '파주 싱크대 막힘'] },
  { label: '누수탐지', q: '분당 누수탐지', rows: ['수지 아랫집 누수', '판교 욕실 누수 비용'] },
  { label: '사다리차', q: '대전 사다리차', rows: ['유성 사다리차 비용', '세종 이삿짐 사다리차'] },
  { label: '포장이사', q: '부산 포장이사', rows: ['해운대 원룸이사', '김해 보관이사 비용'] },
  { label: '입주청소', q: '수원 입주청소', rows: ['동탄 이사청소 비용', '용인 에어컨청소'] },
  { label: '커튼·블라인드', q: '인천 커튼 설치', rows: ['송도 블라인드 시공', '부평 암막커튼 맞춤'] },
  { label: '방충망', q: '고양 방충망 교체', rows: ['일산 미세방충망', '파주 방충망 시공 비용'] },
  { label: '에어컨 설치', q: '창원 에어컨 설치', rows: ['마산 시스템에어컨', '진해 에어컨 이전 설치'] },
  { label: '철거', q: '성남 상가 철거', rows: ['분당 원상복구 비용', '하남 인테리어 철거'] },
  { label: '변호사', q: '서울 이혼 변호사', rows: ['서초 상속 변호사 상담', '강남 형사 변호사'] },
  { label: '개인회생', q: '광주 개인회생', rows: ['광주 개인회생 비용', '전남 개인파산 절차'] },
  { label: '세무사', q: '대구 세무사', rows: ['수성구 종합소득세 신고', '대구 법인 기장'] },
  { label: '치과', q: '천안 임플란트', rows: ['불당동 치과 추천', '아산 교정 비용'] },
  { label: '피부과', q: '강남 피부과', rows: ['역삼 여드름 흉터', '신사 리프팅 가격'] },
  { label: '학원', q: '일산 수학학원', rows: ['마두동 중등 수학', '후곡 영어학원'] },
  { label: '렌트카', q: '제주 렌트카', rows: ['제주공항 장기렌트', '서귀포 렌트카 가격'] },
  { label: '반려동물', q: '수원 강아지 분양', rows: ['영통 애견미용', '동탄 고양이 호텔'] },
  { label: '인쇄', q: '을지로 명함 인쇄', rows: ['충무로 현수막 제작', '성수 스티커 인쇄'] },
];

export default function SerpRotate() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 2600);
    return () => clearInterval(t);
  }, [auto]);
  const it = ITEMS[i];
  return (
    <div className="serp-rot">
      <div className="serp-rot-view" key={it.q}>
        <Serp query={it.q} rows={it.rows} />
      </div>
      <ul className="serp-rot-list" aria-label="업종 고르기">
        {ITEMS.map((x, k) => (
          <li key={x.label}>
            <button type="button" className={k === i ? 'on' : ''} aria-pressed={k === i} onClick={() => { setI(k); setAuto(false); }}>
              {x.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
