import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.css';
import styles from './styles.module.css';
import './global.css';

export const metadata: Metadata = {
  title: 'Lessons'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className='navbar small navbar-dark'>
        <nav className='container navbar-expand-md px-0 px-md-3'>
          <img className={ styles.NavTitle} src='/head.svg' alt='title'/>
          <div className={ styles.SearchContainer }>
            <input className={`form-control ${styles.SearchField}`} placeholder='...'/>
            <button onClick={ Search } className={`btn btn-outline-light ${styles.SearchButton}`}>Search</button>
          </div>
        </nav>
      </header>
      <div className={ `container  ${ styles.ToBottom }` }>
        <div className='row'>
          <nav className={ `col ${styles.LessonsList}` }></nav>
          <main className='col' style={ { flexBasis: '50%' } }>
            { children }
          </main>
        </div>
      </div>
    </>
  );
}
