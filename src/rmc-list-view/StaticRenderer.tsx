import React, {Component} from 'react';
import {IStaticRenderer} from "./PropsType";
import {observer} from "mobx-react";

@observer
export default class StaticRenderer extends Component<IStaticRenderer, any> {

    shouldComponentUpdate(nextProps) {
        return nextProps.shouldUpdate;
    }

    render() {
        return this.props.render();
    }
}
