import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import classNames from 'classnames';
import PanelContent from './PanelContent';
import Animate from '../rc-animate';
import {CollapsePanelPropTypes} from "./PropsType";
import noop from "../rc-util/noop";

@observer
export default class CollapsePanel extends Component<CollapsePanelPropTypes, any> {

    static defaultProps = {
        showArrow: true,
        isActive: false,
        destroyInactivePanel: false,
        onItemClick: noop,
    };

    handleItemClick = () => {
        if (this.props.onItemClick) {
            this.props.onItemClick();
        }
    }

    render() {
        const {
            className,
            style,
            prefixCls,
            header,
            headerClass,
            children,
            isActive,
            showArrow,
            destroyInactivePanel,
            disabled,
        } = this.props;
        const headerCls = classNames(`${prefixCls}-header`, {
            [headerClass]: headerClass,
        });
        const itemCls = classNames({
            [`${prefixCls}-item`]: true,
            [`${prefixCls}-item-active`]: isActive,
            [`${prefixCls}-item-disabled`]: disabled,
        }, className);
        return (
            <div className={itemCls} style={style}>
                <div
                    className={headerCls}
                    onClick={this.handleItemClick.bind(this)}
                    role="tab"
                    aria-expanded={isActive}
                >
                    {showArrow && <i className="arrow"/>}
                    {header}
                </div>
                <Animate
                    showProp="isActive"
                    exclusive
                    component=""
                    animation={this.props.openAnimation}
                >
                    <PanelContent
                        prefixCls={prefixCls}
                        isActive={isActive}
                        destroyInactivePanel={destroyInactivePanel}
                    >
                        {children}
                    </PanelContent>
                </Animate>
            </div>
        );
    }
}
