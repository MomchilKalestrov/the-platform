'use client'
import { Component } from 'react';
import style from './code.module.css';


export default class CodeBlock extends Component<any, any> {
    render =() => (
            <div className={ `card ${ style.CodeBlock }`}>
                <div className="card-header">
                    <button className='btn btn-outline-dark'>Run Code</button>
                </div>
                <textarea className="card-body">
                    { this.props.children }
                </textarea>
            </div>
        )
}