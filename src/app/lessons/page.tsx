
import Reader, { List, type Listing } from './logic/reader'
import { RenderLesson, RenderSearchResult } from './logic/renderer'
import Search from './logic/search'

// Anything before the return is server sided
export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // We get the lesson/ query from the URL parameter
  let lesson: string = Reader(searchParams.lesson as string);
  let query: string = searchParams.query as string;

  // Even IF there is a lesson, the search is more important,
  // so the query will always have to be undefined.
  if(query === undefined) return RenderLesson(lesson);

  // Start the actual search
  let filteredLessons: Array<Listing> = Search(query);

  return RenderSearchResult(filteredLessons, query);
}