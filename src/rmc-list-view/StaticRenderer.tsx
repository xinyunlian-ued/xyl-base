import * as React from 'react';
import {observer} from 'inferno-mobx';
import {IStaticRenderer} from "./PropsType";

@observer
export default class StaticRenderer extends React.Component<IStaticRenderer, any> {

    shouldComponentUpdate(nextProps) {
        return nextProps.shouldUpdate;
    }

    render() {
        return this.props.render();
    }
}
