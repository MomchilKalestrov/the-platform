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
            <button className='btn btn-outline-light btn-sm'>Начало</button>
            <button className='btn btn-outline-light btn-sm'>Уроци</button>
            <button className='btn btn-outline-light btn-sm'>Кодов редактор</button>
            <button className='btn btn-outline-light btn-sm'>Контакти</button>
          </div>
        </nav>
      </header>
      <div className={ styles.Splash }>
        <div className='container'>
          <div>
            <h1>The Platform</h1>
            <p className='text-secondary'>Добре дошли в най-достъпната платформа за начинаещи програмисти. Започни обучението си тук!</p>
          </div>
          <img src='/splash.svg' />
        </div>
      </div>
      <main className='container'>
        { children }
      </main>
    </>
  );
}