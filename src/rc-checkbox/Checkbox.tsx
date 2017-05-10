import * as React from 'react';
import {observer} from 'inferno-mobx';
import * as classNames from 'classnames';
import PureRenderMixin from '../rc-util/PureRenderMixin';
import noop from '../rc-util/noop';
import {CheckboxPropTypes, State} from './PropsType';

@observer
export default class Checkbox extends React.Component<CheckboxPropTypes, State> {

    static defaultProps = {
        prefixCls: 'rc-checkbox',
        className: '',
        type: 'checkbox',
        defaultChecked: false,
        onFocus: noop,
        onBlur: noop,
        onChange: noop
    };

    state = {
        checked: 'checked' in this.props ? this.props.checked : this.props.defaultChecked
    };

    componentWillReceiveProps(nextProps) {
        if ('checked' in nextProps) {
            this.setState({
                checked: nextProps.checked
            });
        }
    }

    shouldComponentUpdate(...args) {
        return PureRenderMixin.shouldComponentUpdate.apply(this, args);
    }

    handleChange = (e) => {
        const {props} = this;
        if (props.disabled) {
            return;
        }
        if (!('checked' in props)) {
            this.setState({
                checked: e.target.checked
            });
        }
        props.onChange({
            target: {
                ...props,
                checked: e.target.checked,
            },
            stopPropagation() {
                e.stopPropagation();
            },
            preventDefault() {
                e.preventDefault();
            },
        });
    }

    render() {
        const {
            prefixCls,
            className,
            style,
            name,
            type,
            disabled,
            readOnly,
            tabIndex,
            onClick,
            onFocus,
            onBlur,
        } = this.props;
        const {checked} = this.state;
        const classString = classNames(prefixCls, className, {
            [`${prefixCls}-checked`]: checked,
            [`${prefixCls}-disabled`]: disabled,
        });

        return (
            <span className={classString} style={style}>
                <input
                    name={name}
                    type={type}
                    readOnly={readOnly}
                    disabled={disabled}
                    tabIndex={tabIndex}
                    className={`${prefixCls}-input`}
                    checked={checked}
                    onClick={onClick}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={this.handleChange}
                />
                <span className={`${prefixCls}-inner`}/>
            </span>
        );
    }
}
