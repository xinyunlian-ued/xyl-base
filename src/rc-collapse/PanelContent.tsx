import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import classnames from 'classnames';
import {PanelContentPropTypes} from "./PropsType";

@observer
export default class PanelContent extends Component<PanelContentPropTypes, any> {

    _isActived;

    shouldComponentUpdate(nextProps) {
        return this.props.isActive || nextProps.isActive;
    }

    render() {
        this._isActived = this._isActived || this.props.isActive;
        if (!this._isActived) {
            return null;
        }
        const {prefixCls, isActive, children, destroyInactivePanel} = this.props;
        const contentCls = classnames({
            [`${prefixCls}-content`]: true,
            [`${prefixCls}-content-active`]: isActive,
            [`${prefixCls}-content-inactive`]: !isActive,
        });
        const child = !isActive && destroyInactivePanel ? null :
            <div className={`${prefixCls}-content-box`}>{children}</div>;
        return (
            <div
                className={contentCls}
                role="tabpanel"
            >{child}
            </div>
        );
    }
}


