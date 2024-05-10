import * as fs from 'fs';

export type Listing = {
    title: string;
    URI: string;
}

export default function Reader(lesson: string = 'bad'): string {
    // Check if the lesson file exists.
    // For extra safety, we will check if there are any dots,
    // because they could be used to go back a directory,
    // or even multiple, and read files it's not supposed to.
    if(!fs.existsSync(`./lessons_data/${lesson}.lesson`) || lesson.includes('..'))
        lesson = 'bad';
    // I was going to put a try catch here but fuck it we ball.
    List();
    return fs.readFileSync(`./lessons_data/${lesson}.lesson`, 'utf8');
}

export function List(): Array<Listing> {
    let lessons: Array<Listing> = [];
    // Get the available lessons.
    let directories: Array<string> = fs
    .readdirSync('./lessons_data')
    .filter(lesson => lesson !== 'bad.lesson')
    .map(lesson => lesson.replace('.lesson', ''));

    // Convert them into a Listings array.
    for(let i: number = 0; i < directories.length; ++i) {
        lessons.push({
            URI: directories[i],
            title: directories[i].replaceAll('_', ' ')
        });
    }

    return lessons;
}