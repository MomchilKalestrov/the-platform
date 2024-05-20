'use client'
import React, { CSSProperties, Component } from 'react';
import style from './code.module.css';
const ts = require('typescript');
const jsInterpreter = require('js-interpreter');

export default class CodeBlock extends Component<any, any> {
    private _output:  React.RefObject<HTMLTextAreaElement>;
    private _stack:   React.RefObject<HTMLDivElement>;
    private _heap:   React.RefObject<HTMLDivElement>;
    private _sandbox: any;
    private static readonly _colors: Array<string> = [
        'background-color: #f0fcff; color: #051c2d;',
        'background-color: #fff1f2; color: #42090a;',
        'background-color: #fffeec; color: #42090a;',
        'background-color: #f2fff2; color: #082301;',
    ];

    constructor(props: any) {
        super(props);
        this._output = React.createRef();
        this._stack  = React.createRef();
        this._heap   = React.createRef();
        this.state   = {
            code:  this.props.code.trim(),
            input: 'N/A',
            send:  false,
            color: 0
        }
        // Sandbox functions
        this._write      = this._write.bind(this);
        this._read       = this._read.bind(this);
        // Sandbox debugger functions
        this._memDump    = this._memDump.bind(this);
        this._parseType  = this._parseType.bind(this);
        this._memTracker = this._memTracker.bind(this);
        // Code block functions
        this.execCode    = this.execCode.bind(this);
        this.updateCode  = this.updateCode.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    private _write = (message: any) => {
        this._output.current!.innerHTML += typeof message === 'object' || Array.isArray(message) ? JSON.stringify(message) : message;
        this._output.current!.innerHTML += '\n';
    }

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
        if (typeof variable !== 'object')   // When It's a primitive object.
            return variable;
        // The VM returns everything other than primitives as,
        // objects,  so we  have to  check the  class property
        // to   get   the   true   type   of   the   variable.
        else if (variable.class === 'Array') {
            let array = [];
            let counter: number = 0;
            let length: number = Object.keys(variable.properties).length;
            while(counter < length)
                array.push(variable.properties[counter++]);
            return array;
        }
        else if (variable.class === 'Function')
            return "!FUNCTION!";    // IDK what  else  to   return,  we  won't
                                    // render   the   actual  function   logic
                                    // because it will take up too much space.
        else { // Everything else is just an object
            
            let obj: any = {};
            for (const property in variable.properties)
                // It  might  have other  objects,  so
                // instead of having a fuckton of for,
                // loops,     we    use     recursion.
                obj[property] = this._parseType(variable.properties[property]);
            return obj;
        }
    }

    private _memDump = () => {
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

        // Removing the  VM properties from  the array.
        // Basically adding the variables to the array.
        for (const property in properties)
            if (!hiddenProperties.includes(property))
                variables[property] = this._parseType(properties[property]);

        this._renderMemDump(variables);
    }

    private _renderMemDump = (
        variables: any
    ) => {
        let colorCounter: number = 0;

        // Make arrays take only one line.
        const stylizeJSON = (json: string): string => {
            const regex = /\[(.*?)\]/gs;

            return json.replace(regex, (match, p1) => {
                const cleanedContent = p1.replace(/\s+/g, ' ').trim();
                return `[${cleanedContent}]`;
              });
        }

        // Set the card header.
        this._stack.current!.innerHTML = '<div class="card-header">Стек</div>';
        this._heap.current!.innerHTML  = '<div class="card-header">Хийп</div>';

        // Print out the variables.
        for (const variable in variables) {
            if (
                typeof variables[variable] === 'object' ||
                Array.isArray(variables[variable])
            ) {
                // If it's an object, place the object reference
                // to  the stack and the  instance to the  heap.
                this._stack.current!.innerHTML +=
                    `<div class=\"${ style.Variable }\">
                        <div style=\"${ CodeBlock._colors[colorCounter & 0b11] }\">${ variable }:</div>
                        <div style=\"${ CodeBlock._colors[colorCounter & 0b11] }\">Обект</div>
                    </div>`;
                this._heap.current!.innerHTML  +=
                    `<div>
                        <pre style=\"${ CodeBlock._colors[colorCounter & 0b11] }\">${ stylizeJSON(JSON.stringify(variables[variable], undefined, 2)) }</pre>
                    </div>`;
                    colorCounter++;
            }
            else if(variables[variable] === '!FUNCTION!')  // Just point out it's a function.
                this._stack.current!.innerHTML +=
                    `<div class=\"${ style.Variable }\">
                        <div>${ variable }:</div>
                        <div>Функция</div>
                    </div>`;
            else
                // All primitives are allocated in the stack
                this._stack.current!.innerHTML +=
                    `<div class=\"${ style.Variable }\">
                        <div>${ variable }:</div>
                        <div>${ typeof variables[variable] === 'string' ? `\"${ variables[variable] }\"` : variables[variable] }</div>
                    </div>`;
        }
    }

    private _memTracker = () => {
        console.log('Tracker initialized');
        return new Promise(resolve => {
            const dump = () => {
                this._memDump();
                setTimeout(dump, 100);
            }
            dump();
        })
    }

    private execCode = () => {
        // Clear previous output, if there's any.
        this._output.current!.innerHTML = '';
        this._output.current!.style.display = 'block';
        // Initialize the sandbox.
        this._sandbox = new jsInterpreter(ts.transpile(this.state.code), (interpreter: any, globalObject: any) => {            
            interpreter.setProperty(globalObject, 'write', interpreter.createNativeFunction(this._write));
            interpreter.setProperty(globalObject, 'read',  interpreter.createNativeFunction(this._read));
        });
        // And memory tracker.
        this._memTracker();
        // Run the sandbox/ VM.
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
                        value={ this.state.code }
                        onChange={ this.updateCode }
                    ></textarea>
                    <textarea
                        ref={ this._output }
                        className={ `mt-3 ${ style.OutputBlock }` }
                        style={ { display: 'none' } }
                        readOnly
                    ></textarea>
                    {/*
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
                    */}
                </div>
            </div>
            <div
                className={ `card ${ style.StackContainer }` }
                ref={ this._stack }
            >
                <div className="card-header">Стек</div>
            </div>
            <div
                className={ `card ${ style.HeapContainer }` }
                ref={ this._heap }
            >
                <div className="card-header">Хийп</div>
            </div>
        </div>
    )
}