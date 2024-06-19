import type { Metadata } from 'next';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.css';
import styles from './styles.module.css';
import './global.css';

export const metadata: Metadata = {
  title: 'Lessons'
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className='navbar small navbar-dark'>
        <nav className='container navbar-expand-md px-0 px-md-3'>
          <Image className={ styles.NavTitle} src='/head.svg' alt='title'/>
          <div>
            <a className='btn btn-outline-light btn-sm' href='/homepage'   >Начало</a>
            <a className='btn btn-outline-light btn-sm' href='/lessons'    >Уроци</a>
            <a className='btn btn-outline-light btn-sm' href='/code_editor'>Кодов редактор</a>
            <a className='btn btn-outline-light btn-sm' href='/contacts'   >Контакти</a>
          </div>
        </nav>
      </header>
      <div className={ styles.Splash }>
        <div className='container'>
          <div className='my-2'>
            <h2>The Platform</h2>
            <p>Добре дошли в най-достъпната платформа за начинаещи програмисти. Започни обучението си <a className='text-secondary' href='/lessons'>тук</a>!</p>
          </div>
          <Image className='my-2' src='/splash.svg' alt='splash'/>
        </div>
      </div>
      <main>
        { children }
      </main>
      <div className='bg-dark'>
        <footer className='container py-3 d-flex justify-content-center flex-wrap'>
          <div className='d-flex justify-content-center flex-wrap gap-1 border-bottom pb-2 mb-2'>
            <a className='btn btn-dark' href='/homepage'   >Начало</a>
            <a className='btn btn-dark' href='/lessons'    >Уроци</a>
            <a className='btn btn-dark' href='/code_editor'>Кодов редактор</a>
            <a className='btn btn-dark' href='/contacts'   >Контакти</a>
          </div>
          <div className='w-100'></div>
          <Image className={ styles.FooterImg } src='/book.svg' alt='logo'/>
        </footer>
      </div>
    </>
  );
}