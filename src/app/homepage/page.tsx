'use client'
import styles from './styles.module.css';

export default function Home() {
  return (
    // an extra div is needed to wrap the divs so the background color can be applied properly
    <>
      <div>
        <div className='container px-sm-5 py-3'>
          <div>
            <h1>Интерактивни уроци</h1>
            <p>Всички уроци имат интерактивни примери, които могат да се екзекутират.</p>
          </div>
        </div>
      </div>
      <div>
        <div className='container px-sm-5 py-3'>
          <h1>Избери от къде да започнеш</h1>
          <p>Няма значение нивото, платформата има уроци за всякакви теми по програмиране. От основите, през видовете парадигми до алгоритми и структури данни, можеш да започнеш от където искаш!</p>
        </div>
      </div>
      <div className='container px-sm-5 py-3'>
        <div className='row gap-3'>
          <div className='col-xl d-flex flex-wrap justify-content-center align-content-center m-0'>
            <h1>Програмирай навсякъде</h1>
            <p>Чрез нашият кодов редактор, може да приложеш твоите новодобити знания изцяло онлайн, без нуждата за допълнителен софтуер.</p>
          </div>
          <img src='/code_edit.png' className='col-xl' />
        </div>
      </div>
      <div>
        <div className='container px-sm-5 py-3'>
          <h1>Използва се в:</h1>
          <div className={ styles.OrganizationsList }>
            <img src='/pgmt.png' />
            <img src='/pgee.png' />
          </div>
        </div>
      </div>
    </>
  );
}