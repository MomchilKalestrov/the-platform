
import Reader from './logic/reader'
import Render from './logic/renderer'

// Anything before the return is server sided
export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // We get the lesson from the URL parameter
  let lesson : string = Reader(searchParams.lesson as string);
  
  return Render(lesson);
}