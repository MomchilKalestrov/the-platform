import type { Metadata } from 'next';
import { List } from './logic/reader'
import { RenderMenu } from './logic/renderer'
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
            <button className={`btn btn-outline-light ${styles.SearchButton}`}>🔎︎</button>
          </div>
        </nav>
      </header>
      <div className={ `container  ${ styles.ToBottom }` }>
        <div className='row'>
          <nav id='menuList' className={ `col ${styles.LessonsList}` }>
            <button id='menuCloseButton'>✖</button>
            { RenderMenu(List()) }
          </nav>
          <main className='col'>
            <button id='menuButton' className={ `btn btn-outline-dark ${ styles.MobileView }` }>☰ More</button>
            { children }
          </main>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('menuButton').addEventListener('click', function() {
            let menuListDesign = document.getElementById('menuList').style;
            if(menuListDesign.transform !== 'translateX(0%)')
              menuListDesign.transform = 'translateX(0%)';
            else
              menuListDesign.transform = 'translateX(-100%)';
        });
        document.getElementById('menuCloseButton').addEventListener('click', function() {
          let menuListDesign = document.getElementById('menuList').style;
          menuListDesign.transform = 'translateX(-100%)';
        });
        window.addEventListener('resize', function() {
          let menuListDesign = document.getElementById('menuList').style;
          menuListDesign.transform = '';
        });
      `}} />
    </>
  );
}