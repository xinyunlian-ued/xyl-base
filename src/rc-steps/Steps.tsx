import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import debounce from 'lodash.debounce';
import Component from 'rc-base';
import {IStepsPropTypes} from "./PropsType";
import Step from './Step';

@observer
export default class Steps extends Component<IStepsPropTypes, { lastStepOffsetWidth: number }> {

    constructor(props) {
        super(props);
        this.calcStepOffsetWidth = debounce(this.calcStepOffsetWidth, 150);
    }

    static defaultProps = {
        prefixCls: 'rc-steps',
        iconPrefix: 'rc',
        direction: 'horizontal',
        labelPlacement: 'horizontal',
        current: 0,
        status: 'process',
        size: '',
        progressDot: false,
    };

    static Step = Step;

    calcTimeout;

    @observable store = {
        lastStepOffsetWidth: 0
    };

    componentDidMount() {
        this.calcStepOffsetWidth();
    }

    componentDidUpdate() {
        this.calcStepOffsetWidth();
    }

    componentWillUnmount() {
        if (this.calcTimeout) {
            clearTimeout(this.calcTimeout);
        }
    }

    calcStepOffsetWidth = () => {
        const domNode = ReactDOM.findDOMNode(this);
        if (domNode.children.length > 0) {
            if (this.calcTimeout) {
                clearTimeout(this.calcTimeout);
            }
            const lastChild = domNode.lastChild as HTMLElement;
            this.calcTimeout = setTimeout(() => {
                // +1 for fit edge bug of digit width, like 35.4px
                const lastStepOffsetWidth = (lastChild.offsetWidth || 0) + 1;
                // Reduce shake bug
                if (this.state.lastStepOffsetWidth === lastStepOffsetWidth ||
                    Math.abs(this.state.lastStepOffsetWidth - lastStepOffsetWidth) <= 3) {
                    return;
                }
                this.changeStore({lastStepOffsetWidth});
            });
        }
    }

    render() {
        const props = this.props;
        const {
            prefixCls, style = {}, className, children, direction,
            labelPlacement, iconPrefix, status, size, current, progressDot, ...restProps
        } = props;
        const lastIndex = children.length - 1;
        const reLayouted = this.state.lastStepOffsetWidth > 0;
        const adjustedlabelPlacement = !!progressDot ? 'vertical' : labelPlacement;
        const classString = classNames({
            [prefixCls]: true,
            [`${prefixCls}-${size}`]: size,
            [`${prefixCls}-${direction}`]: true,
            [`${prefixCls}-label-${adjustedlabelPlacement}`]: direction === 'horizontal',
            [`${prefixCls}-hidden`]: !reLayouted,
            [`${prefixCls}-dot`]: !!progressDot,
            [className]: className,
        });

        return (
            <div className={classString} style={style} {...restProps}>
                {
                    React.Children.map(children, (ele: any, idx) => {
                        const itemWidth = (direction === 'vertical' || idx === lastIndex || !reLayouted)
                            ? null : `${100 / lastIndex}%`;
                        const adjustMarginRight = (direction === 'vertical' || idx === lastIndex)
                            ? null : -Math.round(this.state.lastStepOffsetWidth / lastIndex + 1);
                        const np = {
                            stepNumber: (idx + 1).toString(),
                            itemWidth,
                            adjustMarginRight,
                            prefixCls,
                            iconPrefix,
                            wrapperStyle: style,
                            progressDot,
                            className,
                            status
                        };

                        // fix tail color
                        if (status === 'error' && idx === current - 1) {
                            np.className = `${props.prefixCls}-next-error`;
                        }

                        if (!ele.props.status) {
                            if (idx === current) {
                                np.status = status;
                            } else if (idx < current) {
                                np.status = 'finish';
                            } else {
                                np.status = 'wait';
                            }
                        }
                        return React.cloneElement(ele, np);
                    })
                }
            </div>
        );
    }
}