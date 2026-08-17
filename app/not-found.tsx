import Link from 'next/link';

export const metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-inner">
        <p className="not-found-code">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="not-found-desc">
          주소가 변경되었거나 삭제된 페이지입니다.<br />
          아래 링크에서 원하시는 내용을 찾아보세요.
        </p>
        <div className="not-found-links">
          <Link href="/" className="nf-btn primary">홈으로</Link>
          <Link href="/homepage/" className="nf-btn">업종별 홈페이지 제작</Link>
          <Link href="/blog/" className="nf-btn">블로그</Link>
        </div>
      </div>
    </main>
  );
}
