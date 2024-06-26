import Reader from './logic/reader';
import { RenderLesson } from './logic/renderer';
import RenderSearch from './logic/search';

// Anything before the return is server sided
export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // We get the lesson/ query from the URL parameter
  let lesson: string = searchParams.lesson ? Reader(searchParams.lesson as string) : Reader('welcome');
  let query: string = searchParams.query as string;

  // Even IF there is a lesson, the search is more important,
  // so the query will always have to be undefined.
  if(!query)
    return RenderLesson(lesson);

  // Start the actual search
  // and return the rendered version
  return RenderSearch(query);
}