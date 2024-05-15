import { StaticImageData } from 'next/image';
import { List } from './reader'
import Link from "next/link";

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
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + indicator // substitution
      );
    }
  }
  
  return 1 - (matrix[b.length][a.length] / Math.max(a.length, b. length));
}

export default function RenderSearch(query: string): Array<React.JSX.Element> {
    // Get the actual lessons, not the directories
    let data: JSON = List();
    let keys: Array<string> = Object.keys(data);
    let html: Array<React.JSX.Element> = [];
    let indexCount = 0;



    // Conduct the search.
    // First find if there are any lessons where the query is a substring.
    // Then find any lessons that are 50% or more similar to the query.
    // After all that, remove the duplicates.


    for(let i: number = 0; i < keys.length; ++i) {
      html.push(<h2 key={ indexCount++ }>{ keys[i] }</h2>);





      data[keys[i]].forEach((lesson: string) => {
        if(
          lesson.includes(query) ||
          similarity(lesson, query) >= (process.env.QUERY_ACCURACY as unknown as number || 0.5)
        )
          html.push(
            <Link
                key={ indexCount++ }
                href={ `/lessons/?lesson=${ keys[i].toLowerCase().replaceAll(' ', '_') }/${ lesson.toLowerCase().replaceAll(' ', '_') }` }
            >
                { lesson }
            </Link>
        )
      });
    }

    return html;
}