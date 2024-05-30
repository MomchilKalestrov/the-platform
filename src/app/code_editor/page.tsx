'use client'
import React, { useEffect } from 'react';
// Editor imports
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-cloud_editor';
import 'ace-builds/src-noconflict/ext-language_tools';
// Stylesheets improrts
import styles from './styles.module.css';
import './global.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Roboto } from 'next/font/google';
// Sandbox imports
const jsInterpreter = require('js-interpreter');
const ts = require('typescript');

const roboto = Roboto({
  weight: '400',
  subsets: ['latin', 'cyrillic'],
});

export default function Page({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    //#region - Variables -
    let sandbox:   any;
    let inputRef:  React.Ref<HTMLInputElement>    = React.createRef();
    let outputRef: React.Ref<HTMLTextAreaElement> = React.createRef();
    let stackRef:  React.Ref<HTMLDivElement>      = React.createRef();
    let heapRef:   React.Ref<HTMLDivElement>      = React.createRef();
    let runRef:    React.Ref<HTMLButtonElement>   = React.createRef();
    let goRef:     React.Ref<HTMLButtonElement>   = React.createRef();
    let code:      string 		                  = `let a = 0; while(a++ < 20) write('[as]'); a = 0; stop(); while(a++ < 20) write('[as]');`;
    let isMounted: boolean                        = false;
    let sendIn:    boolean                        = false;
    let paused:    boolean                        = false;
    const colors:    Array<string>                  = [
        'background-color: #f0fcff; color: #051c2d;',
        'background-color: #fff1f2; color: #42090a;',
        'background-color: #fffeec; color: #42090a;',
        'background-color: #f2fff2; color: #082301;',
    ];
    //#endregion

    // Check if the component is mounted.
    // If it's not,  we don't want to run
    // the memory tracker.
    useEffect(() => {
        isMounted = true;
        return () => {
            isMounted = false;
        };
    }, []);

    //#region - Console -
    const send = () => {
        sendIn = true;
    }

    const write = (message: any) =>
        outputRef.current!.innerHTML += typeof message === 'object' || Array.isArray(message) ? JSON.stringify(message) : message;

    const read = (): Promise<any> => 
        new Promise((resolve) => {
            sendIn = false;
            const loop = () => {
                if(sendIn) {
                    sendIn = false;
                    resolve(inputRef.current!.value);
                }
                else setTimeout(loop, 100);
            }
            loop();
        });

    const stopCode = () => {
	    write('\n--\nКодът е паузиран.За да продължите, натиснете "Продължи".\n--\n');
        paused = true;
        goRef.current!.disabled = false;
        console.log('The code has been pased.');
    };
    //#endregion

    const continueCode = () => {
        paused = false;
        goRef.current!.disabled = true;
        console.log('The code is continuing.');
    }

    //#region - Memory Dumper -
    const renderMemDump = (variables: any) => {
        let colorCounter: number = 0;

        // Make arrays take only one line.
        const stylizeJSON = (json: string): string => {
            const regex = /\[(.*?)\]/gs;

            return json.replace(regex, (match, p1) => {
                const cleanedContent = p1.replace(/\s+/g, ' ').trim();
                return `[${cleanedContent}]`;
              });
        }

        stackRef.current!.innerHTML = '';
        heapRef.current!.innerHTML = '';

        // Print out the variables.
        for (const variable in variables)
            if (
                typeof variables[variable] === 'object' ||
                Array.isArray(variables[variable])
            ) {
                // If it's an object, place the object reference
                // to  the stack and the  instance to the  heap.
                stackRef.current!.innerHTML +=
                    `<div class=\"${ styles.Variable }\">
                        <div style=\"${ colors[colorCounter & 0b11] }\">${ variable }:</div>
                        <div style=\"${ colors[colorCounter & 0b11] }\">Обект</div>
                    </div>`;
                heapRef.current!.innerHTML  +=
                    `<div>
                        <pre style=\"${ colors[colorCounter & 0b11] }\">${ stylizeJSON(JSON.stringify(variables[variable], undefined, 2)) }</pre>
                    </div>`;
            	colorCounter++;
debugger;	    
}
            else if(variables[variable] === 'function')  // Just point out it's a function.
                stackRef.current!.innerHTML +=
                    `<div class=\"${ styles.Variable }\">
                        <div>${ variable }:</div>
                        <div>Функция</div>
                    </div>`;
            else
                // All primitives are allocated in the stack
                stackRef.current!.innerHTML +=
                    `<div class=\"${ styles.Variable }\">
                        <div>${ variable }:</div>
                        <div>${ typeof variables[variable] === 'string' ? `\"${ variables[variable] }\"` : variables[variable] }</div>
                    </div>`;
    }

    const parseType = (variable: any): any => {
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
            return "function"; // IDK what  else  to   return,  we  won't
                               // render   the   actual  function   logic
                               // because it will take up too much space.
        else { // Everything else is just an object
            let obj: any = {};
            for (const property in variable.properties)
                // It  might  have other  objects,  so
                // instead of having a fuckton of for,
                // loops,     we    use     recursion.
                obj[property] = parseType(variable.properties[property]);
            return obj;
        }
    }

    const memDump = () => {
        // Get the properties
        const properties: any = sandbox.globalObject.properties;
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
                variables[property] = parseType(properties[property]);

        renderMemDump(variables);
    }

    const memTracker = () => {
        console.log('Tracker initialized');
        return new Promise(() => {
            const loop = () => {
                memDump();
		        if (isMounted)
                	setTimeout(loop, (process.env.CODE_RUN_TIMEOUT as unknown as number) / 2);
            }
            loop();
        });
    }
    //#endregion

    //#region - Code Execution -
    const saveCode = (value: string) => {
        code = value;
    }

    const runCode = () => {
        return new Promise(() => {
            const loop = () => {
                if(paused) {
                    setTimeout(loop, process.env.CODE_RUN_TIMEOUT as unknown as number);
                    return;
                }

                if(sandbox.step()) setTimeout(loop, process.env.CODE_RUN_TIMEOUT as unknown as number);
                else {
                    runRef.current!.disabled = false;
                    return;
                }
            }
            loop();
        });
    }

    const loadCode = () => {
        // Reset the console state
        sendIn = false;
        paused = false;
        goRef.current!.disabled = true;
        outputRef.current!.innerHTML = '';
        runRef.current!.disabled = true;
        // Initialize the sandbox.
        sandbox = new jsInterpreter(ts.transpile(code), (interpreter: any, globalObject: any) => {
            const wrapper = (callback: any) => {
                paused = true;
                read().then(value => {
                    callback(value);
                    paused = false;
                });
            };

            interpreter.setProperty(globalObject, 'write', interpreter.createNativeFunction(write));
            interpreter.setProperty(globalObject, 'stop',  interpreter.createNativeFunction(stopCode));
            interpreter.setProperty(globalObject, 'read',  interpreter.createAsyncFunction(wrapper));
        });
        // Attach the memory tracker
        memTracker();
        // Run the sandbox/ VM.
        try       { runCode(); }
        catch (e) { write(e);  }
    }
    //#endregion

    return(
        <body className={ roboto.className }>
            <main className='card'>
                <nav className='card-header'>
                    <button
                        className='btn btn-success'
                        onClick={ loadCode }
                        ref={ runRef }
                    >▷</button>
                    <button
                        className='btn btn-outline-dark'
                        onClick={ continueCode }
                        ref={ goRef }
                        onLoad={ stopCode }
                    >Продължи</button>
                </nav>
                <AceEditor
                    placeholder="// code"
                    mode="javascript"
                    theme="cloud_editor"		
                    fontSize='1rem'
                    lineHeight='1.5rem'
		            height='100%'
		            width='100%'
		            onChange={ saveCode}
                    showPrintMargin={false}
                    showGutter={false}
                    highlightActiveLine={true}
                    value={`// This is the code editor
// For highlighting, it uses Ace
// For executing code, it uses js-interpreter

// There are functions for debugging:
// - The memory tracker (starts automatically)
// - The 'stop()' function

// There are also functions for IO:
// - The write function
// - The read function

let a = 0;
while(a++ < 20)
  write('[as]');
a = 0;

stop();

while(a++ < 20)
  write('[as]');`}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: false,
                        tabSize: 2,
                    }}
                />
            </main>
            <div className={ styles.Output + ' card'}>
                <div className='card-header'>Конзола</div>
                <textarea ref={ outputRef } className='card-body' readOnly>
                </textarea>
                <div className='d-flex card-footer'>
                    <input className='form-control' ref={ inputRef }></input>
                    <button onClick={ send } className='btn btn-outline-dark'>Въведи</button>
                </div>
            </div>
            <div className={ styles.Stack + ' card'}>
                <div className='card-header'>Стек</div>
                <div ref={ stackRef }></div>
            </div>
            <div className={ styles.Heap + ' card'}>
                <div className='card-header'>Хийп</div>
                <div ref={ heapRef }></div>
            </div>
        </body>
    );
}
