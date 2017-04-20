import React from 'react';
import {observer} from "mobx-react";
import assign from 'object-assign';
import {ILazyRenderBox} from "./PropsType";

@observer
export default class LazyRenderBox extends React.Component<ILazyRenderBox, any> {

    shouldComponentUpdate(nextProps) {
        return nextProps.hiddenClassName || nextProps.visible;
    }

    render() {
        const props = assign({}, this.props);

        if (props.hiddenClassName || React.Children.count(props.children) > 1) {
            if (!props.visible && props.hiddenClassName) {
                props.className += ` ${props.hiddenClassName}`;
            }
            return <div {...props}/>;
        }

        return React.Children.only(props.children);
    }
};
