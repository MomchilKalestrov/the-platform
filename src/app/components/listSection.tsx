'use client'
import React from "react";

export default class ListSection extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            collapsed: true
        }
    }

    UpdateVisibility = () => this.setState({ collapsed: !this.state.collapsed });

    render = () =>
        <>
            <p onClick={ this.UpdateVisibility }>{ this.state.collapsed ? '▷' : '▽' } { this.props.title }</p>
            <div style={ {
                display: `${this.state.collapsed ? 'none' : 'unset' }`,
            } }>
                { this.props.children }
            </div>
        </>
}