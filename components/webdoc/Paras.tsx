// 긴 조합 문단을 2문장씩 끊어 여러 문단으로 — 모바일에서 한 덩어리 글이 되지 않게
export default function Paras({ text, per = 2 }: { text: string; per?: number }) {
  const sentences = text.split(/(?<=[다요]\.)\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += per) chunks.push(sentences.slice(i, i + per).join(' '));
  return (
    <>
      {chunks.map((c, i) => (
        <p key={i} className="wd-p">
          {c}
        </p>
      ))}
    </>
  );
}
