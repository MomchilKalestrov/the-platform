import Link from "next/link";
import CodeBlock from "@/app/components/code";

export function RenderLesson(data: string): React.JSX.Element {
    let html: Array<React.JSX.Element> = [];
    let elements: Array<string> = data.split('<%=');
    for(let i: number = 0; i < elements.length; ++i) {
        let type: string = elements[i].split('=%>')[0].replace(' ', '\0') || 'N/A';
        let data: string = elements[i].split('=%>')[1] || 'N/A';
        switch(type) {
            case 'title':     html.push(<h2 key={ i }>{ data }</h2>);          break;
            case 'paragraph': html.push(<p key={ i }>{ data }</p>);            break;
            case 'code':      html.push(<CodeBlock key={ i } code={ data }/>); break;
            case 'image':
                html.push(
                    <img
                        src={ data.split('<%%>')[1] }
                        alt={ data.split('<%%>')[0] }
                    />
                );
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
        }
    }

    return <>{ html }</>;
}

export function RenderMenu(data: JSON): JSX.Element {
    let html: Array<React.JSX.Element> = [];
    let keys: Array<string> = Object.keys(data);
    let indexCount: number = 0;

    for(let i: number = 0; i < keys.length; ++i) {
        html.push(<p key={ indexCount++ }>{ keys[i] }</p>);
        data[keys[i]].forEach((lesson: string) => 
            html.push(
                <Link
                    key={ indexCount++ }
                    href={ `/lessons/?lesson=${ keys[i].toLowerCase().replaceAll(' ', '_') }/${ lesson.toLowerCase().replaceAll(' ', '_') }` }
                >
                    { lesson }
                </Link>
            )
        );
    }
    return <>{ html }</>;
}

export function RenderSearchResult(data: JSON, search: string): React.JSX.Element {
    /*let html: Array<JSX.Element> = [];
    
    if(data.length <= 0) return(<h2>Няма намерени уроци</h2>);

    for(let i: number = 0; i < data.length; ++i)
        html.push(
                <div
                key={ i }
                className="card"
                style={ {
                    width: 'min(100%, 15rem)',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    height: 'min-content'
                } }
                >
                    <div className="card-body" style={ { margin: '0px' } }>
                        <h5 className="card-title">{ data[i].title }</h5>
                        <Link
                        style={ { width: '100%', margin: '0px', transform: 'translateX(0%)' } }
                        href={ `/lessons/?lesson=${ data[i].URI }` }
                        className='btn btn-primary'
                        >
                            Към урока
                        </Link>
                    </div>
                </div>
        );*/
    
    return(
        <div>
            <h2>Уроци с "{ search }" в името:</h2>
            <div className='w-100 m-0' style={ { height: 'min-content' } }>{ JSON.stringify(data) }</div>
        </div>
    );
}