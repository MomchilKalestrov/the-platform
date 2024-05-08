import { Component } from 'react';
import '../design/Global.css'

export class SharedLayout extends Component<any, any> {
    render = () =>
        <>
            <header>
                <img src='/head.svg' alt='title'/>
                <div>
                    <input className='search-field' type='text' />
                    <input className='search-button' type='button' value='Search' />
                </div>
            </header>
            <nav></nav>
            <main>{ this.props.children }</main>
        </>
}