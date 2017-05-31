import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import * as classNames from 'classnames';
import {ITabPane} from "./PropsType";

@observer
export default class TabPane extends Component<ITabPane, any> {

    static defaultProps = {placeholder: null};
    _isActived;

    render() {
        const props = this.props;
        const {className, destroyInactiveTabPane, active, forceRender} = props;
        this._isActived = this._isActived || active;
        const prefixCls = `${props.rootPrefixCls}-tabpane`;
        const cls = classNames({
            [prefixCls]: 1,
            [`${prefixCls}-inactive`]: !active,
            [`${prefixCls}-active`]: active,
            [className]: className,
        });
        const isRender = destroyInactiveTabPane ? active : this._isActived;
        return (
            <div
                style={props.style}
                role="tabpanel"
                aria-hidden={props.active ? 'false' : 'true'}
                className={cls}
            >
                {isRender || forceRender ? props.children : props.placeholder}
            </div>
        );
    }
}
