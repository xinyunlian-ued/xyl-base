import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {Children} from "inferno-compat";
import * as classNames from 'classnames';
import {ITabBarMixinPropTypes} from "./PropsType";
import * as warning from 'warning';

const tabBarExtraContentStyle = {
    float: 'right',
};

@observer
export default class TabBar extends Component<ITabBarMixinPropTypes, any> {

    static defaultProps = {
        styles: {}
    };

    activeTab;
    root;
    bindActiveTab = (activeTab) => {
        this.activeTab = activeTab;
    }
    bindRoot = (root) => {
        this.root = root;
    }

    onTabClick = (key) => {
        this.props.onTabClick(key);
    }

    getTabs = () => {
        const props = this.props;
        const children = props.panels;
        const activeKey = props.activeKey;
        const rst = [];
        const prefixCls = props.prefixCls;

        Children.forEach(children, (child: any) => {
            if (!child) {
                return;
            }
            const key = child.key;
            let cls = activeKey === key ? `${prefixCls}-tab-active` : '';
            cls += ` ${prefixCls}-tab`;
            let events = {};
            if (child.props.disabled) {
                cls += ` ${prefixCls}-tab-disabled`;
            } else {
                events = {
                    onClick: this.onTabClick.bind(this, key),
                };
            }
            const ref = {ref: undefined};
            if (activeKey === key) {
                ref.ref = this.bindActiveTab;
            }
            warning('tab' in child.props, 'There must be `tab` property on children of Tabs.');
            rst.push(<div
                role="tab"
                aria-disabled={child.props.disabled ? 'true' : 'false'}
                aria-selected={activeKey === key ? 'true' : 'false'}
                {...events}
                className={cls}
                key={key}
                {...ref}
            >
                {child.props.tab}
            </div>);
        }, null);

        return rst;
    }

    getRootNode = (contents) => {
        const {prefixCls, onKeyDown, className, extraContent, style} = this.props;
        const cls = classNames({
            [`${prefixCls}-bar`]: 1,
            [`${className}`]: !!className,
        });
        return (
            <div
                role="tablist"
                className={cls}
                tabIndex={0}
                ref={this.bindRoot}
                onKeyDown={onKeyDown}
                style={style}
            >
                {extraContent ?
                    (<div
                        style={tabBarExtraContentStyle}
                        key="extra"
                    >
                        {extraContent}
                    </div>) : null}
                {contents}
            </div>);
    }

    render() {
        const tabs = this.getTabs();
        return this.getRootNode(tabs);
    }
}