import Link from "next/link";
import type { Listings } from "./reader";

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
            case 'code':
                html.push(<code key={ i }>{ data }</code>);
                break;
        }
    }
    return <>{ html }</>;
}

export function RenderMenu(data: Listings): JSX.Element {
    let html: Array<JSX.Element> = [];
    
    for(let i: number = 0; i < data.titles.length; ++i)
        html.push(<Link key={ i } href={ `/lessons/?lesson=${ data.URIs[i] }` }>{ data.titles[i] }</Link>);
    return <>{ html }</>;
}