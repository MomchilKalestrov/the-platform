import * as fs from 'fs';

export default function Reader(lesson: string = 'bad'): string {
    // Check if the lesson file exists.
    // For extra safety, we will check if there are any dots,
    // because they could be used to go back a directory,
    // or even multiple, and read files it's not supposed to.
    if(!fs.existsSync(`./lessons_data/${lesson}.lesson`) || lesson.includes('.'))
        lesson = 'bad';
    
    // I was going to put a try catch here but fuck it we ball.
    return fs.readFileSync(`./lessons_data/${lesson}.lesson`, 'utf8');
}