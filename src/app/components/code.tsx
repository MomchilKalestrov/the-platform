'use client'
import React, { Component } from 'react';
import style from './code.module.css';
import * as ts from "typescript";
import { useRouter } from 'next/router'
import Link from 'next/link';

export default class CodeBlock extends Component<any, any> {
    static IdCounter: number = 0;
    Id: number;
    output: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);
        this.Id     = CodeBlock.IdCounter++;
        this.output = React.createRef();
        this.state  = {
            code: this.props.code,
            input: 'N/A',
            send: false
        }
        this.execCode    = this.execCode.bind(this);
        this.updateCode  = this.updateCode.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    async execCode() {
        // Clear previous output
        this.output.current!.innerHTML = '';
        this.output.current!.style.display = 'block';
    
        // Override console.log to update the output element
        const originalConsoleLog = console.log;
        console.log = (message: any) => _write(message);

        const _write = (message: any) => {
            this.output.current!.innerHTML += `${
                typeof message === 'object' ||
                Array.isArray(message)
                ?
                JSON.stringify(message)
                :
                message
            }<br>`;
        }

        const _read = () => {
            return new Promise((resolve) => {
                const checkSend = () => {
                    if (this.state.send) {
                        _write(this.state.input);
                        this.setState({ send: false });
                        resolve(this.state.input);
                    }
                    else setTimeout(checkSend, 250);
                }
                checkSend();
            });
        }

        const _memDmp = () => {
            _write("Not implemented!");
        }        
    
        let code: Function = new Function('read, write, memDump', ts.transpile(this.state.code));

        try {
            code(_read, _write, _memDmp); 
        } catch (error) { 
            console.error(error);  
        }
    
        // Restore the original console.log function
        console.log = originalConsoleLog;
    }

    updateCode = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        this.setState({ code: event.target.value });
    
    updateInput = (event: React.ChangeEvent<HTMLInputElement>) =>
        this.setState({ input: event.target.value });

    updateSend = () =>
        this.setState({ send: true });

    render =() => (
        <div className={ `card ${ style.CodeBlock }`}>
            <div className="card-header">
                <button onClick={ this.execCode } className='btn btn-success btn-sm mr-3'>▷</button>
            </div>
            <div className="card-body">
                <textarea
                    value={this.state.code }
                    onChange={ this.updateCode }
                ></textarea>
                <div ref={ this.output } style={ { display: 'none' } }></div>
                <div className='d-flex mt-3'>
                    <input
                        className='form-control'
                        onChange={ this.updateInput }
                        placeholder='>_'
                    ></input>
                    <button 
                        className='btn btn-outline-dark'
                        onClick={ this.updateSend }
                    >Въведи</button>
                </div>
            </div>
        </div>
    )
}