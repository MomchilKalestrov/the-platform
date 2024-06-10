import * as fs from 'fs';

export default function Reader(lesson: string = 'bad'): string {
    // Check if the lesson file exists.
    // For extra safety, we will check if there are any dots,
    // because they could be used to go back a directory,
    // or even multiple, and read files it's not supposed to.
    if(!fs.existsSync(`${ process.env.LESSONS_URL as string }${lesson}.lesson`) || lesson.includes('..'))
        lesson = process.env.BAD_LESSON_FILE as string;
    // I was going to put a try catch here but fuck it we ball.
    return fs.readFileSync(`${ process.env.LESSONS_URL as string }${lesson}.lesson`, 'utf8');
}

export function List(): {[key: string]: any[]} {
    return JSON.parse(fs.readFileSync(`${ process.env.LESSONS_URL }lesson.map.json`).toString());
}