// V4 프로세스 — 아웃라인 넘버 카드
const steps = [
  { num: '01', title: '상담', desc: '카톡·전화로 업종과 목적만 말씀해주세요. 자료가 없어도 시작할 수 있습니다.' },
  { num: '02', title: '기획', desc: '업종 가이드를 바탕으로 구성과 문구, 검색 키워드 방향을 잡습니다.' },
  { num: '03', title: '제작', desc: '1:1 맞춤 디자인과 개발을 진행하고 중간 시안을 보여드립니다.' },
  { num: '04', title: '완성', desc: '검수 후 오픈. 검색엔진 등록 안내와 수정 1회까지 챙겨드립니다.' },
];

const ProcessSection = () => {
  return (
    <section className="lp-process" id="process">
      <div className="lp-container">
        <span className="lp-eyebrow">PROCESS</span>
        <h2 className="lp-h2">복잡한 건 저희가, 사장님은 영업만</h2>
        <p className="lp-sub">상담부터 오픈까지 전 과정 비대면, 평균 7일</p>

        <div className="lp-proc-grid">
          {steps.map((s) => (
            <div className="lp-proc-step" key={s.num}>
              <span className="num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
