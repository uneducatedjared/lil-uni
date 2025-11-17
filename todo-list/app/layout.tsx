import './global.css';
import React from 'react';

export const metadata = {
  title: 'Todo - Lil Uni',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
