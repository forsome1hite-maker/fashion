import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오지랖 패션 - 따뜻한 참견 커뮤니티',
  description: '착샷 올리면 오지랖퍼들이 쇼핑몰 링크와 함께 훈수를 둡니다 💅',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
