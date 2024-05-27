'use client'
import React, { useEffect, useState } from 'react';
// Editor imports
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
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
    let input:     React.Ref<HTMLInputElement>    = React.createRef();
    let code:      string 		          = 'return;';
    let output:    React.Ref<HTMLTextAreaElement> = React.createRef();
    let stack:     React.Ref<HTMLDivElement>      = React.createRef();
    let heap:      React.Ref<HTMLDivElement>      = React.createRef();
    let runButton: React.Ref<HTMLButtonElement>   = React.createRef();
    let goButton:  React.Ref<HTMLButtonElement>   = React.createRef();
    let isMounted: boolean                        = false;
    let sendIn:    boolean                        = false;
    let paused:    boolean                        = false;
    let colors:    Array<string>                  = [
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

    const send = () => {
        sendIn = true;
    }

    //#region - Console -
    const write = (message: any) =>
        output.current!.innerHTML += typeof message === 'object' || Array.isArray(message) ? JSON.stringify(message) : message;

    const read = (): Promise<any> => 
        new Promise((resolve) => {
            sendIn = false;
            const loop = () => {
                if(sendIn) {
                    sendIn = false;
                    resolve(input.current!.value);
                }
                else setTimeout(loop, 100);
            }
            loop();
        });

    const stopCode = () => {
        write('\n-- Code stopped --\n');
        paused = true;
    };
    //#endregion

    const continueCode = () => {
        paused = false;
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

        stack.current!.innerHTML = '';
        heap.current!.innerHTML = '';

        // Print out the variables.
        for (const variable in variables)
            if (
                typeof variables[variable] === 'object' ||
                Array.isArray(variables[variable])
            ) {
                // If it's an object, place the object reference
                // to  the stack and the  instance to the  heap.
                stack.current!.innerHTML +=
                    `<div class=\"${ styles.Variable }\">
                        <div style=\"${ colors[colorCounter & 0b11] }\">${ variable }:</div>
                        <div style=\"${ colors[colorCounter & 0b11] }\">Обект</div>
                    </div>`;
                heap.current!.innerHTML  +=
                    `<div>
                        <pre style=\"${ colors[colorCounter & 0b11] }\">${ stylizeJSON(JSON.stringify(variables[variable], undefined, 2)) }</pre>
                    </div>`;
                    colorCounter++;
            }
            else if(variables[variable] === 'function')  // Just point out it's a function.
                stack.current!.innerHTML +=
                    `<div class=\"${ styles.Variable }\">
                        <div>${ variable }:</div>
                        <div>Функция</div>
                    </div>`;
            else
                // All primitives are allocated in the stack
                stack.current!.innerHTML +=
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
                	setTimeout(loop, 100);
            }
            loop();
        });
    }
    //#endregion

    const saveCode = (value: string) => {
        code = value;
    }

    const runCode = () => {
        return new Promise(() => {
            const loop = () => {
                if(paused) {
                    setTimeout(loop, 0);
                    return;
                }

                if(sandbox.step()) setTimeout(loop, 0);
                else {
                    runButton.current!.disabled = false;
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
        output.current!.innerHTML = '';
        runButton.current!.disabled = true;
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

    return(
        <body className={ roboto.className }>
            <main className='card'>
                <nav className='card-header'>
                    <button
                        className='btn btn-success'
                        onClick={ loadCode }
                        ref={ runButton }
                    >▷</button>
                    <button
                        className='btn btn-outline-dark'
                        onClick={ continueCode }
                        ref={ goButton }
                    >Продължи</button>
                </nav>
                <AceEditor
                    placeholder="// code"
                    mode="javascript"
                    theme="github"		
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
                <div className='card-header'>Изход</div>
                <textarea ref={ output } className='card-body' readOnly>
                </textarea>
                <div className='d-flex card-footer'>
                    <input className='form-control' ref={ input }></input>
                    <button onClick={ send } className='btn btn-outline-dark'>Въведи</button>
                </div>
            </div>
            <div className={ styles.Stack + ' card'}>
                <div className='card-header'>Стек</div>
                <div ref={ stack }></div>
            </div>
            <div className={ styles.Heap + ' card'}>
                <div className='card-header'>Хийп</div>
                <div ref={ heap }></div>
            </div>
        </body>
    );
}
