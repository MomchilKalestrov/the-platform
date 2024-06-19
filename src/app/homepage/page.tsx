'use client'
import styles from './styles.module.css';

export default function Home() {
  return (
    // an extra div is needed to wrap the divs so the background color can be applied properly
    <>
      <div className='mb-0'>
        <div className='container px-sm-5 py-3'>
          <div className='mb-0'>
            <h1>Интерактивни уроци</h1>
            <p>Всички уроци имат интерактивни примери, които могат да се екзекутират.</p>
          </div>
        </div>
      </div>
      <div className='mb-0'>
        <div className='container px-sm-5 py-3'>
          <h1>Избери от къде да започнеш</h1>
          <p>Без значение от нивото в платформата има уроци на всякакви теми по програмиране. Започни от където желаеш!</p>
        </div>
      </div>
      <div className='mb-0
      '>
        <div className='container px-sm-5 py-3'>
          <div className='row gap-3'>
            <div className='col-xl d-flex flex-wrap justify-content-center align-content-center m-0'>
              <h1>Програмирай навсякъде</h1>
              <p>Чрез нашият кодов редактор, може да приложиш твоите новодобити знания изцяло онлайн, без нуждата за допълнителен софтуер.</p>
              <a className='btn btn-outline-dark'>Започни да програмираш!</a>
            </div>
            <img src='/code_edit.png' className='col-xl' alt='code exitor' />
          </div>
        </div>
      </div>
      <div className='mb-0'>
        <div className='container px-sm-5 py-3'>
          <h1>Използва се в:</h1>
          <div className={ styles.OrganizationsList }>
            <img src='/pgmt.png' alt='PGMT'/>
            <img src='/pgee.png' alt='PGEE'/>
          </div>
        </div>
      </div>
    </>
  );
}