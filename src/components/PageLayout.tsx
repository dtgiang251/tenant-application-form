'use client'; // Thêm dòng này để chuyển thành Client Component

import {ReactNode} from 'react';
import BookingForm from './BookingForm';

type Props = {
  children?: ReactNode;
  title: ReactNode;
  isNotFoundPage?: boolean;
};

export default function PageLayout({children, title, isNotFoundPage = false}: Props) {

  if (isNotFoundPage) {
    return (
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-6 text-center text-red-500">{title}</h1>
        {children}
      </div>
    );
  }

  return (
    <>
      <div id="booking_form" className="relative z-10 booking-form">
        <BookingForm/>
      </div>
    </>
  );
}
