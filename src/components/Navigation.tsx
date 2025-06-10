import LogoClient from './Logo';

export default function Navigation() {

  return (
    <header className="flex items-center w-full justify-center relative z-30">
      <div className="container mx-auto pt-5 pb-5 flex justify-center items-center">
        <LogoClient />
      </div>
    </header>
  );
}
