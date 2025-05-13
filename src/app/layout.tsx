import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';

type Props = {
  children: ReactNode;
};

// Optional metadata
export const metadata: Metadata = {
  // e.g., title, description, etc.
};

// Correct viewport config with proper types
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Props) {
  return children;
}