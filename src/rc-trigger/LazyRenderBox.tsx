import React, {Children, Component} from 'react';
import {observer} from "mobx-react";
import * as assign from 'object-assign';
import {ILazyRenderBox} from "./PropsType";

@observer
export default class LazyRenderBox extends Component<ILazyRenderBox, any> {

    shouldComponentUpdate(nextProps) {
        return nextProps.hiddenClassName || nextProps.visible;
    }

    render() {
        const props = assign({}, this.props);

        if (props.hiddenClassName || Children.count(props.children) > 1) {
            if (!props.visible && props.hiddenClassName) {
                props.className += ` ${props.hiddenClassName}`;
            }
            return <div {...props}/>;
        }

        return Children.only(props.children);
    }
}
