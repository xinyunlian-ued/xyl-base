import React, {Component} from 'react';
import * as classNames from 'classnames';
import {observer} from 'mobx-react';

import noop from '../rc-util/noop';
import InputHandler from './InputHandler';
import {InputNumberPropTypes} from './PropsType';

function defaultParser(input) {
    return input.replace(/[^\w\.-]+/g, '');
}

/**
 * When click and hold on a button - the speed of auto changin the value.
 */
const SPEED = 200;

/**
 * When click and hold on a button - the delay before auto changin the value.
 */
const DELAY = 600;

function preventDefault(e) {
    e.preventDefault();
}

export interface State {
    inputValue?: number;
    value?: number;
    focused?: boolean;
}

@observer
export default class InputNumber extends Component<InputNumberPropTypes, State> {

    start;
    end;
    autoStepTimer;
    refs;

    static defaultProps = {
        focusOnUpDown: true,
        useTouch: false,
        prefixCls: 'rc-input-number',
        max: Infinity,
        min: -Infinity,
        step: 1,
        style: {},
        onChange: noop,
        onKeyDown: noop,
        onFocus: noop,
        onBlur: noop,
        parser: defaultParser,
    };

    state = ((me) => {
        let value;
        const props = me.props;
        if ('value' in props) {
            value = props.value;
        } else {
            value = props.defaultValue;
        }
        value = this.toNumber(value);
        return {
            inputValue: this.toPrecisionAsStep(value),
            value,
            focused: props.autoFocus,
        };
    })(this);

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentWillUpdate() {
        this.start = this.refs.input.selectionStart;
        this.end = this.refs.input.selectionEnd;
    }

    componentDidUpdate() {
        if (this.props.focusOnUpDown && this.state.focused) {
            const selectionRange = this.refs.input.setSelectionRange;
            if (selectionRange &&
                typeof selectionRange === 'function' &&
                this.start !== undefined &&
                this.end !== undefined &&
                this.start !== this.end) {
                this.refs.input.setSelectionRange(this.start, this.end);
            } else {
                this.focus();
            }
        }
    }

    onKeyDown(e, ...args) {
        if (e.keyCode === 38) {
            const ratio = this.getRatio(e);
            this.up(e, ratio);
            this.stop();
        } else if (e.keyCode === 40) {
            const ratio = this.getRatio(e);
            this.down(e, ratio);
            this.stop();
        }
        const {onKeyDown} = this.props;
        if (onKeyDown) {
            onKeyDown(e, ...args);
        }
    }

    onKeyUp(e, ...args) {
        this.stop();
        const {onKeyUp} = this.props;
        if (onKeyUp) {
            onKeyUp(e, ...args);
        }
    }

    getRatio(e) {
        let ratio = 1;
        if (e.metaKey || e.ctrlKey) {
            ratio = 0.1;
        } else if (e.shiftKey) {
            ratio = 10;
        }
        return ratio;
    }

    getValueFromEvent(e) {
        return e.target.value;
    }

    focus() {
        this.refs.input.focus();
    }

    formatWrapper(num) {
        if (this.props.formatter) {
            return this.props.formatter(num);
        }
        return num;
    }

    onChange(e) {
        const input = this.props.parser(this.getValueFromEvent(e).trim());
        this.setState({inputValue: input});
        this.props.onChange(this.toNumberWhenUserInput(input)); // valid number or invalid string
    }

    onFocus(...args) {
        this.setState({
            focused: true,
        });
        this.props.onFocus(...args);
    }

    onBlur(e, ...args) {
        this.setState({
            focused: false,
        });
        const value = this.getCurrentValidValue(this.state.inputValue);
        e.persist();  // fix https://github.com/react-component/input-number/issues/51
        this.setValue(value, () => {
            this.props.onBlur(e, ...args);
        });
    }

    getCurrentValidValue(value) {
        let val = value;
        const props = this.props;
        if (val === '') {
            val = '';
        } else if (!this.isNotCompleteNumber(val)) {
            val = Number(val);
            if (val < props.min) {
                val = props.min;
            }
            if (val > props.max) {
                val = props.max;
            }
        } else {
            val = this.state.value;
        }
        return this.toNumber(val);
    }

    setValue(v, callback?) {
        // trigger onChange
        const newValue = this.isNotCompleteNumber(parseFloat(v)) ? undefined : parseFloat(v);
        const changed = newValue !== this.state.value;
        if (!('value' in this.props)) {
            this.setState({
                value: newValue,
                inputValue: this.toPrecisionAsStep(v),
            }, callback);
        } else {
            // always set input value same as value
            this.setState({
                inputValue: this.toPrecisionAsStep(this.state.value),
            }, callback);
        }
        if (changed) {
            this.props.onChange(newValue);
        }
    }

    getPrecision(value) {
        const valueString = value.toString();
        if (valueString.indexOf('e-') >= 0) {
            return parseInt(valueString.slice(valueString.indexOf('e-') + 2), 10);
        }
        let precision = 0;
        if (valueString.indexOf('.') >= 0) {
            precision = valueString.length - valueString.indexOf('.') - 1;
        }
        return precision;
    }

    // step={1.0} value={1.51}
    // press +
    // then value should be 2.51, rather than 2.5
    // https://github.com/react-component/input-number/issues/39
    getMaxPrecision(currentValue, ratio = 1) {
        const {step} = this.props;
        const ratioPrecision = this.getPrecision(ratio);
        const stepPrecision = this.getPrecision(step);
        const currentValuePrecision = this.getPrecision(currentValue);
        if (!currentValue) {
            return ratioPrecision + stepPrecision;
        }
        return Math.max(currentValuePrecision, ratioPrecision + stepPrecision);
    }

    getPrecisionFactor(currentValue, ratio = 1) {
        const precision = this.getMaxPrecision(currentValue, ratio);
        return Math.pow(10, precision);
    }

    toPrecisionAsStep(num) {
        if (this.isNotCompleteNumber(num) || num === '') {
            return num;
        }
        const precision = Math.abs(this.getMaxPrecision(num));
        if (precision) {
            return Number(num).toFixed(precision);
        }
        return num.toString();
    }

    // '1.' '1x' 'xx' '' => are not complete numbers
    isNotCompleteNumber(num) {
        return (
            isNaN(num) ||
            num === '' ||
            num === null ||
            (num && num.toString().indexOf('.') === num.toString().length - 1)
        );
    }

    toNumber(num) {
        if (this.isNotCompleteNumber(num)) {
            return num;
        }
        return Number(num);
    }

    // '1.0' '1.00'  => may be a inputing number
    toNumberWhenUserInput(num) {
        // num.length > 16 => prevent input large number will became Infinity
        if ((/\.0+$/.test(num) || num.length > 16) && this.state.focused) {
            return num;
        }
        return this.toNumber(num);
    }

    step(type, e, ratio = 1) {
        if (e) {
            e.preventDefault();
        }
        const props = this.props;
        if (props.disabled) {
            return;
        }
        const value = this.getCurrentValidValue(this.state.inputValue) || 0;
        if (this.isNotCompleteNumber(value)) {
            return;
        }
        let val = this[`${type}Step`](value, ratio);
        if (val > props.max) {
            val = props.max;
        } else if (val < props.min) {
            val = props.min;
        }
        this.setValue(val);
        this.setState({
            focused: true,
        });
    }

    stop() {
        if (this.autoStepTimer) {
            clearTimeout(this.autoStepTimer);
        }
    }

    down(e, ratio, recursive?) {
        if (e.persist) {
            e.persist();
        }
        this.stop();
        this.step('down', e, ratio);
        this.autoStepTimer = setTimeout(() => {
            this.down(e, ratio, true);
        }, recursive ? SPEED : DELAY);
    }

    up(e, ratio, recursive?) {
        if (e.persist) {
            e.persist();
        }
        this.stop();
        this.step('up', e, ratio);
        this.autoStepTimer = setTimeout(() => {
            this.up(e, ratio, true);
        }, recursive ? SPEED : DELAY);
    }

    render() {
        const props = {...this.props};
        const {prefixCls, disabled, readOnly, useTouch} = props;
        const classes = classNames({
            [prefixCls]: true,
            [props.className]: !!props.className,
            [`${prefixCls}-disabled`]: disabled,
            [`${prefixCls}-focused`]: this.state.focused,
        });
        let upDisabledClass = '';
        let downDisabledClass = '';
        const {value} = this.state;
        if (value) {
            if (!isNaN(value)) {
                const val = Number(value);
                if (val >= props.max) {
                    upDisabledClass = `${prefixCls}-handler-up-disabled`;
                }
                if (val <= props.min) {
                    downDisabledClass = `${prefixCls}-handler-down-disabled`;
                }
            } else {
                upDisabledClass = `${prefixCls}-handler-up-disabled`;
                downDisabledClass = `${prefixCls}-handler-down-disabled`;
            }
        }

        const editable = !props.readOnly && !props.disabled;

        // focus state, show input value
        // unfocus state, show valid value
        let inputDisplayValue;
        if (this.state.focused) {
            inputDisplayValue = this.state.inputValue;
        } else {
            inputDisplayValue = this.toPrecisionAsStep(this.state.value);
        }

        if (inputDisplayValue === undefined || inputDisplayValue === null) {
            inputDisplayValue = '';
        }

        let upEvents;
        let downEvents;
        if (useTouch) {
            upEvents = {
                onTouchStart: (editable && !upDisabledClass) ? this.up : noop,
                onTouchEnd: this.stop,
            };
            downEvents = {
                onTouchStart: (editable && !downDisabledClass) ? this.down : noop,
                onTouchEnd: this.stop,
            };
        } else {
            upEvents = {
                onMouseDown: (editable && !upDisabledClass) ? this.up : noop,
                onMouseUp: this.stop,
                onMouseLeave: this.stop,
            };
            downEvents = {
                onMouseDown: (editable && !downDisabledClass) ? this.down : noop,
                onMouseUp: this.stop,
                onMouseLeave: this.stop,
            };
        }
        const inputDisplayValueFormat = this.formatWrapper(inputDisplayValue);

        // ref for test
        return (
            <div
                className={classes}
                style={props.style}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
                onMouseOver={props.onMouseOver}
                onMouseOut={props.onMouseOut}
            >
                <div className={`${prefixCls}-handler-wrap`}>
                    <InputHandler
                        ref="up"
                        disabled={!!upDisabledClass || disabled || readOnly}
                        prefixCls={prefixCls}
                        unselectable={true}
                        {...upEvents}
                        className={`${prefixCls}-handler ${prefixCls}-handler-up ${upDisabledClass}`}
                    >
                        {this.props.upHandler || <span
                            unselectable={true}
                            className={`${prefixCls}-handler-up-inner`}
                            onClick={preventDefault}
                        />}
                    </InputHandler>
                    <InputHandler
                        ref="down"
                        disabled={!!downDisabledClass || disabled || readOnly}
                        prefixCls={prefixCls}
                        unselectable="unselectable"
                        {...downEvents}
                        className={`${prefixCls}-handler ${prefixCls}-handler-down ${downDisabledClass}`}
                    >
                        {this.props.downHandler || <span
                            unselectable={true}
                            className={`${prefixCls}-handler-down-inner`}
                            onClick={preventDefault}
                        />}
                    </InputHandler>
                </div>
                <div className={`${prefixCls}-input-wrap`}>
                    <input
                        type={props.type}
                        placeholder={props.placeholder}
                        onClick={props.onClick}
                        className={`${prefixCls}-input`}
                        autoComplete="off"
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onKeyDown={editable ? this.onKeyDown : noop}
                        onKeyUp={editable ? this.onKeyUp : noop}
                        autoFocus={props.autoFocus}
                        maxLength={props.maxLength}
                        readOnly={props.readOnly}
                        disabled={props.disabled}
                        max={props.max}
                        min={props.min}
                        name={props.name}
                        onChange={this.onChange}
                        ref="input"
                        value={inputDisplayValueFormat}
                    />
                </div>
            </div>
        );
    }
}

