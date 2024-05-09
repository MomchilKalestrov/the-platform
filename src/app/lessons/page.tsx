
import Reader from './logic/reader'

// Anything before the return is server sided
export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // We get the lesson from the URL parameter
  let lesson : string = Reader(searchParams.lesson as string);
  
  return (<h1>{ lesson }</h1>);
}