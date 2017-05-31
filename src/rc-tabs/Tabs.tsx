import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {Children, cloneElement} from "inferno-compat";
import KeyCode from './KeyCode';
import TabPane from './TabPane';
import * as classNames from 'classnames';
import {ITabs} from './PropsType';
import noop from "../rc-util/noop";


function getDefaultActiveKey(props) {
    let activeKey;
    Children.forEach(props.children, (child: any) => {
        if (child && !activeKey && !child.props.disabled) {
            activeKey = child.key;
        }
    }, null);
    return activeKey;
}

@observer
export default class Tabs extends Component<ITabs, any> {

    static TabPane = TabPane;

    static defaultProps = {
        prefixCls: 'rc-tabs',
        destroyInactiveTabPane: false,
        onChange: noop,
        tabBarPosition: 'top',
        style: {},
    };

    constructor(props) {
        super(props);

        let activeKey;
        if ('activeKey' in props) {
            activeKey = props.activeKey;
        } else if ('defaultActiveKey' in props) {
            activeKey = props.defaultActiveKey;
        } else {
            activeKey = getDefaultActiveKey(props);
        }

        this.state = {
            activeKey,
        };
    }

    tabBar;

    componentWillReceiveProps(nextProps) {
        if ('activeKey' in nextProps) {
            this.setState({
                activeKey: nextProps.activeKey,
            });
        }
    }

    onTabClick = (activeKey) => {
        if (this.tabBar.props.onTabClick) {
            this.tabBar.props.onTabClick(activeKey);
        }
        this.setActiveKey(activeKey);
    }

    onNavKeyDown = (e) => {
        const eventKeyCode = e.keyCode;
        if (eventKeyCode === KeyCode.RIGHT || eventKeyCode === KeyCode.DOWN) {
            e.preventDefault();
            const nextKey = this.getNextActiveKey(true);
            this.onTabClick(nextKey);
        } else if (eventKeyCode === KeyCode.LEFT || eventKeyCode === KeyCode.UP) {
            e.preventDefault();
            const previousKey = this.getNextActiveKey(false);
            this.onTabClick(previousKey);
        }
    }

    setActiveKey = (activeKey) => {
        if (this.state.activeKey !== activeKey) {
            if (!('activeKey' in this.props)) {
                this.setState({
                    activeKey,
                });
            }
            this.props.onChange(activeKey);
        }
    }

    getNextActiveKey = (next) => {
        const activeKey = this.state.activeKey;
        const children = [];
        Children.forEach(this.props.children as any, (c: any) => {
            if (c && !c.props.disabled) {
                if (next) {
                    children.push(c);
                } else {
                    children.unshift(c);
                }
            }
        }, null);
        const length = children.length;
        let ret = length && children[0].key;
        children.forEach((child, i) => {
            if (child.key === activeKey) {
                if (i === length - 1) {
                    ret = children[0].key;
                } else {
                    ret = children[i + 1].key;
                }
            }
        });
        return ret;
    }

    render() {
        const props = this.props;
        const {
            prefixCls,
            tabBarPosition, className,
            renderTabContent,
            renderTabBar,
        } = props;
        const cls = classNames({
            [prefixCls]: 1,
            [`${prefixCls}-${tabBarPosition}`]: 1,
            [className]: !!className,
        });

        this.tabBar = renderTabBar();
        const contents = [
            cloneElement(this.tabBar, {
                prefixCls,
                key: 'tabBar',
                onKeyDown: this.onNavKeyDown,
                tabBarPosition,
                onTabClick: this.onTabClick,
                panels: props.children,
                activeKey: this.state.activeKey,
            }),
            cloneElement(renderTabContent(), {
                prefixCls,
                tabBarPosition,
                activeKey: this.state.activeKey,
                destroyInactiveTabPane: props.destroyInactiveTabPane,
                children: props.children,
                onChange: this.setActiveKey,
                key: 'tabContent',
            }),
        ];
        if (tabBarPosition === 'bottom') {
            contents.reverse();
        }
        return (
            <div
                className={cls}
                style={props.style}
            >
                {contents}
            </div>
        );
    }
}
