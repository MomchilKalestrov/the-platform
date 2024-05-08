import { Component } from 'react';
import '../design/Global.css'

export class SharedLayout extends Component<any, any> {
    render = () =>
        <>
            <header>
                <img src='/head.svg' alt='title'/>
                <div>
                    <input></input>
                    <input type='button'></input>
                </div>
            </header>
            <nav></nav>
            <main>{ this.props.children }</main>
        </>
}