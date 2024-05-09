import * as fs from 'fs';

export type Listings = {
    titles: Array<string>;
    URIs: Array<string>;
}

export default function Reader(lesson: string = 'bad'): string {
    // Check if the lesson file exists.
    // For extra safety, we will check if there are any dots,
    // because they could be used to go back a directory,
    // or even multiple, and read files it's not supposed to.
    if(!fs.existsSync(`./lessons_data/${lesson}.lesson`) || lesson.includes('.'))
        lesson = 'bad';
    // I was going to put a try catch here but fuck it we ball.
    List();
    return fs.readFileSync(`./lessons_data/${lesson}.lesson`, 'utf8');
}

export function List(): Listings {
    let lessons: Listings = { titles: [], URIs: [] };
    // Get the available lessons.
    lessons.URIs = fs
    .readdirSync('./lessons_data')
    .filter(lesson => lesson !== 'bad.lesson')
    .map(lesson => lesson.replace('.lesson', ''));
    // Generate their titleּ
    lessons.titles = lessons.URIs.map(lesson => 
        lesson.replaceAll('_', ' ')
    );

    return lessons;
}