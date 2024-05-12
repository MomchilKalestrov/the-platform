'use client'
import React, { Component } from 'react';
import style from './code.module.css';

export default class CodeBlock extends Component<any, any> {
    static IdCounter: number = 0;
    Id: number;
    output: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);
        this.Id     = CodeBlock.IdCounter++;
        this.output = React.createRef();
        this.state  = {
            code: this.props.children,
            input: 'N/A',
            send: false
        }
        this.ExecCode    = this.ExecCode.bind(this);
        this.UpdateCode  = this.UpdateCode.bind(this);
        this.UpdateInput = this.UpdateInput.bind(this);
    }

    async ExecCode() {
        // Clear previous output
        this.output.current!.innerHTML = '';
        this.output.current!.style.display = 'block';
    
        // Override console.log to update the output element
        const originalConsoleLog = console.log;
        console.log = (message: any) => {
            this.output.current!.innerHTML += `${
                typeof message === 'object' ||
                Array.isArray(message)
                ?
                JSON.stringify(message)
                :
                message
            }<br>`;
        }

        const _write = (message: any) => this.output.current!.innerHTML += `${message}<br>`;

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
    
        let code: Function = new Function('read, write, memDump', this.state.code);

        try {
            code(_read, _write, _memDmp); 
        } catch (error) { 
            console.error(error);  
        }
    
        // Restore the original console.log function
        console.log = originalConsoleLog;
    }

    UpdateCode = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        this.setState({ code: event.target.value });
    
    UpdateInput = (event: React.ChangeEvent<HTMLInputElement>) =>
        this.setState({ input: event.target.value });

    UpdateSend = () =>
        this.setState({ send: true });

    render =() => (
        <div className={ `card ${ style.CodeBlock }`}>
            <div className="card-header">
                <button onClick={ this.ExecCode } className='btn btn-outline-success btn-sm'>▷</button>
            </div>
            <div className="card-body">
                <textarea
                    value={this.state.code }
                    onChange={ this.UpdateCode }
                ></textarea>
                <div ref={ this.output } style={ { display: 'none' } }></div>
                <div className='d-flex'>
                    <input
                        className='form-control'
                        onChange={ this.UpdateInput }
                        placeholder='>_'
                    ></input>
                    <button
                        className='btn btn-outline-dark'
                        onClick={ this.UpdateSend }
                    >Прати</button>
                </div>
            </div>
        </div>
    )
}