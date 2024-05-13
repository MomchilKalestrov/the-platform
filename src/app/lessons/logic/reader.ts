import * as fs from 'fs';

export type Directory = {
    title:   string,
    URI:     string,
    lessons: Array<Listing>
}

export type Listing = {
    title: string,
    URI:   string
}

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

export function List(): Array<Directory> {
    let result: Array<Directory> = [];
    // Get the available lessons.
    let directories: Array<string> = fs
        .readdirSync(process.env.LESSONS_URL as string)
        .filter(lesson =>
            lesson !== 'bad.lesson'
        );

    // Convert them into a Listings array.
    for(let i: number = 0; i < directories.length; ++i)
        result.push({
            title: directories[i].replaceAll('_', ' '),
            URI: directories[i],
            lessons: fs
            .readdirSync(`${ process.env.LESSONS_URL as string }${ directories[i] }`)
            .map(lesson => ({
                    URI: lesson.replace('.lesson', ''),
                    title: lesson.replace('.lesson', '').replaceAll('_', ' ')
            }))
        });

    return result;
}