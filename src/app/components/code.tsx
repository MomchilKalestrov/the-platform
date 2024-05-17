'use client'
import React, { Component } from 'react';
import style from './code.module.css';
import './global.css';
const ts = require('typescript');
const jsInterpreter = require('js-interpreter');

export default class CodeBlock extends Component<any, any> {
    private _output:  React.RefObject<HTMLDivElement>;
    private _stack:   React.RefObject<HTMLDivElement>;
    private _heap:   React.RefObject<HTMLPreElement>;
    private _sandbox: any;

    constructor(props: any) {
        super(props);
        this._output = React.createRef();
        this._stack  = React.createRef();
        this._heap   = React.createRef();
        this.state  = {
            code: this.props.code,
            input: 'N/A',
            send: false
        }
        this._write      = this._write.bind(this);
        this._read       = this._read.bind(this);
        this._dump       = this._dump.bind(this);
        this._parseType  = this._parseType.bind(this);

        this.execCode    = this.execCode.bind(this);
        this.updateCode  = this.updateCode.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    private _write = (message: any) =>
        this._output.current!.innerHTML += `${
            typeof message === 'object' ||
            Array.isArray(message)
            ?
            JSON.stringify(message)
            :
            message
        }<br>`;

    private _read = () =>
        new Promise((resolve) => {
            this.setState({ send: false });
            const checkSend = () => {
                if (this.state.send) {
                    this._write(this.state.input);
                    this.setState({ send: false });
                    resolve(this.state.input);
                }
                else setTimeout(checkSend, 250);
            }
            checkSend();
        });

    private _parseType = (variable: any) => {
        if (
            typeof variable !== 'object' &&
            typeof variable !== 'function'
        )
            return variable;
        else if (
            variable.class === 'Array'
        ) {
            let array = [];
            let counter: number = 0;
            let length: number = Object.keys(variable.properties).length;
            while(counter < length)
                array.push(variable.properties[counter++]);
            return array;
        }
        else if (
            typeof variable === 'object'
        ) {
            let obj: any = {};
            for (const property in variable.properties)
                obj[property] = this._parseType(variable.properties[property]);
            return obj;
        }
    }

    // Dump sounds like the code is taking a crap or sth
    // Heheh, poo funi
    // I'm going fucking insane.
    private _dump = () => {
        // Get the properties
        const properties: any = this._sandbox.globalObject.properties;
        // This is where we'll store the actual variables that should be.
        let variables: any = {};
        // Set the properties that shouldn't be returned.
        const hiddenProperties: Array<string> = [  
            'Array',     'Boolean',     'Date',     'Error',     'EvalError',
            'Function',   'Infinity',   'JSON',  'Math',   'NaN',   'Number',
            'Object',  'RangeError',  'ReferenceError',  'RegExp',  'String',
            'SyntaxError',    'TypeError',    'URIError',    'clearInterval',
            'clearTimeout', 'constructor', 'decodeURI', 'decodeURIComponent',
            'dump',  'encodeURI',  'encodeURIComponent',   'escape',  'eval',
            'isFinite', 'isNaN',  'parseFloat',  'parseInt',  'read', 'self',
            'setInterval',   'setTimeout',  'this',   'undefined',   'write',
            'unescape', 'window'
        ];

        // Add the variables to the array.
        for (const property in properties)
            if (!hiddenProperties.includes(property) && properties[property].class !== 'Function')
                variables[property] = this._parseType(properties[property]);

        this._renderMemDump(variables);
    }

    private _renderMemDump = (
        variables: any
    ) => {
        this._stack.current!.innerHTML = '<h6>Стек</h6>';
        this._heap.current!.innerHTML  = '<h6>Хийп</h6>';
        for (const variable in variables)
            if (
                typeof variables[variable] === 'object' ||
                Array.isArray(variables[variable])
            ) {
                this._stack.current!.innerHTML += `Референция към \"${ variable }\".<br>`;
                this._heap.current!.innerHTML += `\"${ variable }\": ${ JSON.stringify(variables[variable], undefined, 2) }<br>`;
            }
    }

    async execCode() {
        // Clear previous output, if there's any.
        this._output.current!.innerHTML = '';
        this._output.current!.style.display = 'block';

        // Initialize the sandbox.
        this._sandbox = new jsInterpreter(ts.transpile(this.state.code), (interpreter: any, globalObject: any) => {
            interpreter.setProperty(globalObject, 'write', interpreter.createNativeFunction(this._write));
            interpreter.setProperty(globalObject, 'read',  interpreter.createNativeFunction(this._read));
            interpreter.setProperty(globalObject, 'dump',  interpreter.createNativeFunction(this._dump));
        });


        try       { this._sandbox.run(); }
        catch (e) { console.error(e);    }
    }   

    updateCode = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        this.setState({ code: event.target.value });
    
    updateInput = (event: React.ChangeEvent<HTMLInputElement>) =>
        this.setState({ input: event.target.value });

    updateSend = () =>
        this.setState({ send: true });

    render = () => (
        <div className={ style.CodeBlock }>
            <div className='card'>
                <div className='card-header'>
                    <button onClick={ this.execCode } className='btn btn-success btn-sm mr-3'>▷</button>
                </div>
                <div className='card-body'>
                    <textarea
                        value={this.state.code }
                        onChange={ this.updateCode }
                    ></textarea>
                    <div
                        ref={ this._output }
                        className={ `mt-3 ${ style.OutputBlock }` }
                        style={ { display: 'none' } }
                    ></div>
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
            <div className={ style.StackContainer } ref={ this._stack }>
                <h6>Стек</h6>
            </div>
            <pre className={ style.HeapContainer } ref={ this._heap }>
                <h6>Хийп</h6>
            </pre>
        </div>
    )
}