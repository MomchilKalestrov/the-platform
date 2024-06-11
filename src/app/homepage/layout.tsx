import type { Metadata } from 'next';
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
          <img className={ styles.NavTitle} src='/head.svg' alt='title'/>
          <div>
            <a className='btn btn-outline-light btn-sm' href='/homepage'>Начало</a>
            <a className='btn btn-outline-light btn-sm' href='/lessons'>Уроци</a>
            <a className='btn btn-outline-light btn-sm' href='/code_editor'>Кодов редактор</a>
            <a className='btn btn-outline-light btn-sm' href='/contacts'>Контакти</a>
          </div>
        </nav>
      </header>
      <div className={ styles.Splash }>
        <div className='container'>
          <div className='my-2'>
            <h2>The Platform</h2>
            <p>Добре дошли в най-достъпната платформа за начинаещи програмисти. Започни обучението си <a className='text-secondary' href='/lessons'>тук!</a></p>
          </div>
          <img className='my-2' src='/splash.svg' />
        </div>
      </div>
      <main>
        { children }
      </main>
    </>
  );
}