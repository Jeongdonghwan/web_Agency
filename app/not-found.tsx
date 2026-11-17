import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: '96px 20px' }}>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p style={{ marginTop: 16 }}>주소가 바뀌었거나 없는 페이지입니다.</p>
      <p><Link href="/">첫 화면으로 가기</Link></p>
    </main>
  );
}
