import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import shallowequal from 'shallowequal';
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
                    onClick={(e) => onExpand(!expanded, record, e)}
                />
            );
        } else if (needIndentSpaced) {
            return <span className={`${prefixCls}-expand-icon ${prefixCls}-spaced`}/>;
        }
        return null;
    }
}
