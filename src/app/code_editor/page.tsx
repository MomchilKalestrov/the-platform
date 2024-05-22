'use client'
import React, { useEffect } from 'react';
import styles from './styles.module.css';
import './global.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Fauna_One, Roboto } from 'next/font/google';
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
    let sandbox: any;
    let code:      React.Ref<HTMLTextAreaElement> = React.createRef();
    let output:    React.Ref<HTMLTextAreaElement> = React.createRef();
    let stack:     React.Ref<HTMLDivElement>      = React.createRef();
    let heap:      React.Ref<HTMLDivElement>      = React.createRef();
    let isMounted: boolean                        = false;
    let colors:    Array<string>                  = [
        'background-color: #f0fcff; color: #051c2d;',
        'background-color: #fff1f2; color: #42090a;',
        'background-color: #fffeec; color: #42090a;',
        'background-color: #f2fff2; color: #082301;',
    ];

    useEffect(() => {
        isMounted = true;
        return () => {
            isMounted = false;
        };
    }, []);

    const write = (message: any) => {
        output.current!.innerHTML += typeof message === 'object' || Array.isArray(message) ? JSON.stringify(message) : message;
        output.current!.innerHTML += '\n';
    }

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

        if(!isMounted) return;
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
            else if(variables[variable] === '!FUNCTION!')  // Just point out it's a function.
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
            return "!FUNCTION!";    // IDK what  else  to   return,  we  won't
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
                variables[property] = parseType(properties[property]);

        renderMemDump(variables);
    }

    const memTracker = () => {
        console.log('Tracker initialized');
        return new Promise(resolve => {
            const dump = () => {
                memDump();
		        if (isMounted)
                	setTimeout(dump, 100);
            }
            dump();
        });
    }

    const ExecCode = () => {
        // Clear previous output, if there's any.
        output.current!.innerHTML = '';
        // Initialize the sandbox.
        sandbox = new jsInterpreter(ts.transpile(code.current!.value), (interpreter: any, globalObject: any) => {            
            interpreter.setProperty(globalObject, 'write', interpreter.createNativeFunction(write));
        });
        console.log(output.current!);
        console.log(stack.current!);
        console.log(heap.current!);
        // Attach the memory tracker
        memTracker();
        // Run the sandbox/ VM.
        try       { sandbox.run();    }
        catch (e) { console.error(e); }
    }

    return(
        <body className={ roboto.className }>
            <main className='card'>
                <nav className='card-header'>
                    <button className='btn btn-success' onClick={ ExecCode }>▷</button>
                </nav>
                <textarea ref={ code } className='card-body'>
                    // Code
                </textarea>
            </main>
            <div className={ styles.Output + ' card'}>
                <div className='card-header'>Изход</div>
                <textarea ref={ output } className='card-body' readOnly>
                </textarea>
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