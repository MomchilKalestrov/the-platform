import Link from "next/link";
import CodeBlock from "../../components/code";
import ListSection from "../../components/listSection";

export function RenderLesson(data: string): React.JSX.Element {
    // I'm an idiot. Instead of using static HTML or even just something like EJS,
    // I'm going to use a custom format I made up.
    let html: Array<React.JSX.Element> = [];
    let elements: Array<string> = data.split('<%=');
    for(let i: number = 0; i < elements.length; ++i) {
        // Type is for the type of the element
        let type: string = elements[i].split('=%>')[0].replace(' ', '\0') || 'N/A';
        // The data is for what is in the actual element
        // Wow, it's like the fucking variables point to
        // their use in the code!
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

export function RenderMenu(data: {[key: string]: any[]}): JSX.Element {
    let html: Array<React.JSX.Element> = [];
    let keys: Array<string> = Object.keys(data);

    for(let i: number = 0; i < keys.length; ++i) {
        let list: Array<React.JSX.Element> = [];
        let indexCounter = 0;
        // We get all the lessons in an array
        data[keys[i]].forEach((lesson: string) => 
            list.push(
                <Link
                    key={ indexCounter++ }
                    href={ `/lessons/?lesson=${ keys[i].toLowerCase().replaceAll(' ', '_') }/${ lesson.toLowerCase().replaceAll(' ', '_') }` }
                >
                    { lesson }
                </Link>
            )
        );
        // We push the lessons array to the appropiate ListSection
        html.push(<ListSection title={ keys[i] } key={ i }>{ list }</ListSection>);
    }

    return <>{ html }</>;
}