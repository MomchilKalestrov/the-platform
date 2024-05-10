import Link from "next/link";
import type { Listing } from "./reader";

export function RenderLesson(data: string): JSX.Element {
    let html: Array<JSX.Element> = [];
    let elements: Array<string> = data.split('<%=');
    for(let i: number = 0; i < elements.length; ++i) {
        let type: string = elements[i].split('=%>')[0].replace(' ', '\0') || 'N/A';
        let data: string = elements[i].split('=%>')[1] || 'N/A';
        switch(type) {
            case 'title':
                html.push(<h2 key={ i }>{ data }</h2>);
                break;
            case 'paragraph':
                html.push(<p key={ i }>{ data }</p>);
                break;
            case 'button':
                html.push(
                    <Link
                    key={ i }
                    className='btn btn-outline-dark'
                    href={ data.split('<%%>')[1] }
                    >
                        { data.split('<%%>')[0] }
                    </Link>
                );
                break;
            case 'code':
                html.push(<code key={ i }>{ data }</code>);
                break;
        }
    }
    return <>{ html }</>;
}

export function RenderMenu(data: Array<Listing>): JSX.Element {
    let html: Array<JSX.Element> = [];
    
    for(let i: number = 0; i < data.length; ++i)
        html.push(<Link key={ i } href={ `/lessons/?lesson=${ data[i].URI }` }>{ data[i].title }</Link>);
    return <>{ html }</>;
}