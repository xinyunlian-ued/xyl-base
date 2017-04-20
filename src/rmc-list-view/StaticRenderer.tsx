import React from 'react';
import {IStaticRenderer} from "./PropsType";

export default class StaticRenderer extends React.Component<IStaticRenderer, any> {

    shouldComponentUpdate(nextProps) {
        return nextProps.shouldUpdate;
    }

    render() {
        return this.props.render();
    }
}
