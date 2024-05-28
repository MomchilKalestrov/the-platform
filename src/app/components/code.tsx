'use client'
// Editor imports
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-cloud_editor';
import 'ace-builds/src-noconflict/ext-language_tools';
// React imports
import React, { Component } from 'react';
import style from './code.module.css';
// Sandbox imports
const ts = require('typescript');
const jsInterpreter = require('js-interpreter');

export default class CodeBlock extends Component<any, any> {
    private _outputRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
    private _stackRef:  React.RefObject<HTMLDivElement>      = React.createRef();
    private _heapRef:   React.RefObject<HTMLDivElement>      = React.createRef();
    private _runRef:    React.RefObject<HTMLButtonElement>   = React.createRef();
    private _goRef:     React.RefObject<HTMLButtonElement>   = React.createRef();
    private _sandbox:   any;
    private _isMounted: boolean                              = false;
    private _paused: boolean                                 = false;
    private _sendIn: boolean                                 = false;
    private static readonly _colors: Array<string> = [
        'background-color: #f0fcff; color: #051c2d;',
        'background-color: #fff1f2; color: #42090a;',
        'background-color: #fffeec; color: #42090a;',
        'background-color: #f2fff2; color: #082301;',
    ];

    constructor(props: any) {
        super(props);
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
        this._loadCode    = this._loadCode.bind(this);
        this.updateCode  = this.updateCode.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }
    // Component specific functions
    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        console.log('Unmounting');
        this._isMounted = false;
    }

    private _write = (message: any) => {
        this._outputRef.current!.innerHTML += typeof message === 'object' || Array.isArray(message) ? JSON.stringify(message) : message;
    }
    
    _stopCode = () => {
        this._write('\n--\nКодът е паузиран.За да продължите, натиснете "Продължи".\n--\n');
        this._paused = true;
        this._goRef.current!.disabled = false;
        console.log('The code has been paused.');
    };
    
    _continueCode = () => {
        this._paused = false;
        this._goRef.current!.disabled = true;
        console.log('The code is continuing.');
    }

    private _read = () =>
        new Promise((resolve) => {
            this.setState({ send: false });
            const checkSend = () => {
                if (this._sendIn) {
                    this._write(this.state.input);
                    this.setState({ send: false });
                    resolve(this.state.input);
                }
                else setTimeout(checkSend, 250);
            }
            checkSend();
        });

    private _parseType = (variable: any): any => {
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
            'Array',  'window',  'Boolean',   'Date',  'Error',  'EvalError',
            'Function',   'Infinity',   'JSON',  'Math',   'NaN',   'Number',
            'Object',  'RangeError',  'ReferenceError',  'RegExp',  'String',
            'SyntaxError', 'TypeError', 'this',  'URIError', 'clearInterval',
            'clearTimeout', 'constructor', 'decodeURI', 'decodeURIComponent',
            'dump',  'encodeURI',  'encodeURIComponent',   'escape',  'eval',
            'isFinite', 'isNaN',  'parseFloat',  'parseInt',  'read', 'self',
            'setInterval',   'setTimeout',  'undefined',   'stop',   'write',
            'unescape',
        ];

        // Removing the  VM properties from  the array.
        // Basically adding the variables to the array.
        for (const property in properties)
            if (!hiddenProperties.includes(property))
                variables[property] = this._parseType(properties[property]);

        this._renderMemDump(variables);
    }

    private _renderMemDump = (variables: any) => {
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
        if(!this._isMounted) return;

        this._stackRef.current!.innerHTML = '<div class="card-header">Стек</div>';
        this._heapRef.current!.innerHTML  = '<div class="card-header">Хийп</div>';

        // Print out the variables.
        for (const variable in variables) {
            if (
                typeof variables[variable] === 'object' ||
                Array.isArray(variables[variable])
            ) {
                // If it's an object, place the object reference
                // to  the stack and the  instance to the  heap.
                this._stackRef.current!.innerHTML +=
                    `<div class=\"${ style.Variable }\">
                        <div style=\"${ CodeBlock._colors[colorCounter & 0b11] }\">${ variable }:</div>
                        <div style=\"${ CodeBlock._colors[colorCounter & 0b11] }\">Обект</div>
                    </div>`;
                this._heapRef.current!.innerHTML  +=
                    `<div>
                        <pre style=\"${ CodeBlock._colors[colorCounter & 0b11] }\">${ stylizeJSON(JSON.stringify(variables[variable], undefined, 2)) }</pre>
                    </div>`;
                    colorCounter++;
            }
            else if(variables[variable] === '!FUNCTION!')  // Just point out it's a function.
                this._stackRef.current!.innerHTML +=
                    `<div class=\"${ style.Variable }\">
                        <div>${ variable }:</div>
                        <div>Функция</div>
                    </div>`;
            else
                // All primitives are allocated in the stack
                this._stackRef.current!.innerHTML +=
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
		        if (this._isMounted)
                	setTimeout(dump, 100);
            }
            dump();
        });
    }

    //#region - Code Execution -
    private _runCode = () => {
        return new Promise(() => {
            const loop = () => {
                if(this._paused) {
                    setTimeout(loop, process.env.CODE_RUN_TIMEOUT as unknown as number);
                    return;
                }

                if(this._sandbox.step()) setTimeout(loop, process.env.CODE_RUN_TIMEOUT as unknown as number);
                else {
                    this._runRef.current!.disabled = false;
                    return;
                }
            }
            loop();
        });
    }

    private _loadCode = () => {
        // Reset the console state
        this._sendIn = false;
        this._paused = false;
        this._goRef.current!.disabled = true;
        this._outputRef.current!.innerHTML = '';
        this._outputRef.current!.style.display = 'block';
        this._runRef.current!.disabled = true;
        // Initialize the sandbox.
        this._sandbox = new jsInterpreter(ts.transpile(this.state.code), (interpreter: any, globalObject: any) => {
            const wrapper = (callback: any) => {
                this._paused = true;
                this._read().then(value => {
                    callback(value);
                    this._paused = false;
                });
            };

            interpreter.setProperty(globalObject, 'write', interpreter.createNativeFunction(this._write));
            interpreter.setProperty(globalObject, 'stop',  interpreter.createNativeFunction(this._stopCode));
            interpreter.setProperty(globalObject, 'read',  interpreter.createAsyncFunction(wrapper));
        });
        // Attach the memory tracker
        this._memTracker();
        // Run the sandbox/ VM.
        try       { this._runCode(); }
        catch (e) { this._write(e);  }
    }
    //#endregion

    updateCode = (value: any) => this.setState({ code: value });
    
    updateInput = (event: React.ChangeEvent<HTMLInputElement>) =>
        this.setState({ input: event.target.value });

    updateSend = () => this._sendIn = true;

    render = () => (
        <div className={ style.CodeBlock }>
            <div className='card'>
                <div className='card-header'>
                    <button ref={ this._runRef } onClick={ this._loadCode } className='btn btn-success btn-sm'>▷</button>
                    <button ref={ this._goRef } onClick={ this._continueCode } className='btn btn-outline-dark btn-sm'>Продължи</button>
                </div>
                <div className='card-body'>
                    <AceEditor
                        placeholder="// code"
                        mode="javascript"
                        theme="cloud_editor"		
                        fontSize='1rem'
                        lineHeight='1.25rem'
                        height='10rem'
                        width='100%'
                        style={ {
                            border: '1px solid var(--bs-border-color-translucent)',
                            borderRadius: 'var(--bs-card-border-radius)'
                        } }
                        onChange={ this.updateCode }
                        showPrintMargin={false}
                        showGutter={false}
                        highlightActiveLine={true}
                        value={ this.state.code }
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: false,
                            enableSnippets: false,
                            showLineNumbers: false,
                            tabSize: 2,
                        }}
                    />
                    <textarea
                        ref={ this._outputRef }
                        className={ `mt-3 ${ style.OutputBlock }` }
                        style={ { display: 'none' } }
                        readOnly
                    ></textarea>
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
            <div
                className={ `card ${ style.StackContainer }` }
                ref={ this._stackRef }
            >
                <div className="card-header">Стек</div>
            </div>
            <div
                className={ `card ${ style.HeapContainer }` }
                ref={ this._heapRef }
            >
                <div className="card-header">Хийп</div>
            </div>
        </div>
    )
}