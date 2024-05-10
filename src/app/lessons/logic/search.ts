import { type Listing, List } from './reader'

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

export default function Search(query: string): Array<Listing> {
    const lessons: Array<Listing> = List();

    let results: Array<Listing> = Array.from(
        new Set(lessons
            .filter(lesson =>
                lesson.title
                    .toLowerCase()
                    .includes(query.toLowerCase())
            )
            .concat(lessons.filter(lesson =>
                similarity(
                    lesson.title.toLowerCase(),
                    query.toLowerCase()
                ) >= 0.2
    ))));

    return results;
}