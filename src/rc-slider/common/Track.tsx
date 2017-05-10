import React from 'react';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';

@observer
export default class Track extends React.Component<any, any> {
    render() {
        const {className, included, vertical, offset, length, minimumTrackStyle} = this.props;
        const style: any = {
            visibility: included ? 'visible' : 'hidden',
        };
        if (vertical) {
            style.bottom = `${offset}%`;
            style.height = `${length}%`;
        } else {
            style.left = `${offset}%`;
            style.width = `${length}%`;
        }
        const elStyle = {
            ...style,
            ...minimumTrackStyle,
        };
        return <div className={className} style={elStyle}/>;
    }
}

