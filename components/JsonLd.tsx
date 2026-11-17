// JSON-LD 출력 컴포넌트 (서버 컴포넌트에서 사용)
const JsonLd = ({ data }: { data: object | object[] }) => {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
};

export default JsonLd;
