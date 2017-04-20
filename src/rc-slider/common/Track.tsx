import React from 'react';
import assign from 'object-assign';
import {observer} from 'mobx-react';
import {ITrackPropTypes} from "rc-slider/common/PropsType";

@observer
export default class Track extends React.Component<ITrackPropTypes, any> {
    render() {

        const {
            className,
            included,
            vertical,
            offset,
            length,
            minimumTrackStyle,
        } = this.props;

        const style = {
            visibility: included ? 'visible' : 'hidden',
            bottom: undefined,
            height: undefined,
            left: undefined,
            width: undefined,
        };

        if (vertical) {
            style.bottom = `${offset}%`;
            style.height = `${length}%`;
        } else {
            style.left = `${offset}%`;
            style.width = `${length}%`;
        }

        return (
            <div className={className} style={assign({}, style, minimumTrackStyle)}/>
        );
    }
}
