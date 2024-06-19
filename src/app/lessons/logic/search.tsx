import React from 'react';
import { List } from './reader';
import Link from "next/link";

// Use an algorithm I ripped straight out of GeeksForGeeks
function similarity(a: string, b: string) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 1; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const indicator = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + indicator
      );
    }
  }
  
  return 1 - (matrix[b.length][a.length] / Math.max(a.length, b. length));
}

export default function RenderSearch(query: string): React.JSX.Element {
    // Data is the lesson map
    // Keys is the names of the lessons sections
    // HTML is where we're storing the generated DOM elements
    // IndexCount is a counter for the keys of the elements in the array.
    let data: {[key: string]: any[]} = List();
    let keys: Array<string> = Object.keys(data);
    let html: Array<React.JSX.Element> = [];
    let indexCount = 0;

    // Iterate the lesson map, section by section.
    for(let i: number = 0; i < keys.length; ++i) {
      let header: React.JSX.Element = <h2 key={ indexCount++ }>{ keys[i] }</h2>;
      let lessons: Array<React.JSX.Element> = [];
      data[keys[i]].forEach((lesson: string) => {
        if(
          lesson.includes(query) ||
          similarity(lesson, query) >= (process.env.QUERY_ACCURACY as unknown as number || 0.5)
        )
          lessons.push(
            <Link
                key={ indexCount++ }
                href={ `/lessons/?lesson=${ keys[i].toLowerCase().replaceAll(' ', '_') }/${ lesson.toLowerCase().replaceAll(' ', '_') }` }
            >
                { lesson }
            </Link>
          )
      });
      if(lessons.length > 0)
        html.push(
          <>
            { header }
            { lessons }
          </>
        );
    }

    return <>{ html }</>;
}