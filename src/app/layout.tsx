import {ReactNode} from 'react';
import { Metadata } from 'next'

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
}

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({children}: Props) {
  return children;
}
