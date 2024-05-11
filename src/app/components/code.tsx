'use client'
import React, { Component } from 'react';
import style from './code.module.css';

export default class CodeBlock extends Component<any, any> {
    static IdCounter: number = 0;
    Id: number;
    output: React.RefObject<HTMLDivElement>;
    input: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);
        this.Id     = CodeBlock.IdCounter++;
        this.output = React.createRef();
        this.input  = React.createRef();
        this.state  = {
            code: this.props.children,
            input: ''
        }
        this.ExecCode   = this.ExecCode.bind(this);
        this.UpdateCode = this.UpdateCode.bind(this);
        this.UpdateInput = this.UpdateInput.bind(this);
    }

    ExecCode() {
        // Clear previous output
        this.output.current.innerHTML = '';

        // Override console.log to update the output element
        const originalConsoleLog = console.log;
        console.log = (message: any) => this.output.current.innerHTML += `${message}<br>`;

        function readInput() {
            while(this.state.input === '');
            return this.state.input;
        }

        try {
            const read = readInput.bind(this);
            eval(this.state.code);
        }
        catch (error) { console.error(error);  }

        // Restore the original console.log function
        console.log = originalConsoleLog;
    }

    UpdateCode = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        this.setState({ code: event.target.value });

    UpdateInput = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        this.setState({ input: event.target.value });

    render =() => (
        <div className={ `card ${ style.CodeBlock }`}>
            <div className="card-header">
                <button onClick={ this.ExecCode } className='btn btn-outline-success btn-sm'>▷</button>
            </div>
            <div className="card-body">
                <textarea 
                    value={this.state.codeValue} // Binding textarea value to state
                    onChange={ this.UpdateCode } // Binding onChange event to handleCodeChange function
                >
                    { this.props.children }
                </textarea>
                <div ref={ this.output }></div>
                <div className='d-flex mt-3'>
                    <input
                        className='form-control'
                        ref={ this.input }
                        onChange={ this.UpdateInput }
                    ></input>
                    <button className='btn btn-outline-dark'>Send</button>
                </div>
            </div>
        </div>
    )
}