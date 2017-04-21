import React, {Component} from 'react';
import {observer} from 'mobx-react';
import * as shallowequal from 'shallowequal';
import {IExpandIconPropTypes} from "./PropsType";

@observer
export default class ExpandIcon extends Component<IExpandIconPropTypes, any> {

    shouldComponentUpdate(nextProps) {
        return !shallowequal(nextProps, this.props);
    }

    render() {
        const {expandable, prefixCls, onExpand, needIndentSpaced, expanded, record} = this.props;
        if (expandable) {
            const expandClassName = expanded ? 'expanded' : 'collapsed';
            return (
                <span
                    className={`${prefixCls}-expand-icon ${prefixCls}-${expandClassName}`}
                    onClick={this.onClick(onExpand, expanded, record)}
                />
            );
        } else if (needIndentSpaced) {
            return <span className={`${prefixCls}-expand-icon ${prefixCls}-spaced`}/>;
        }
        return null;
    }

    onClick(onExpand, expanded, record) {
        return (e) => {
            onExpand(!expanded, record, e);
        };
    }
}
