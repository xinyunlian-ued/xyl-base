import React from 'react';
import {action, observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import classNames from 'classnames';
import assign from 'object-assign';
import PureRenderMixin from 'rc-util/PureRenderMixin';
import noop from 'rc-util/noop';
import Component from 'rc-base';
import {CheckboxPropTypes, State} from './PropsType';

@observer
export default class Checkbox extends Component<CheckboxPropTypes, State> {

    static defaultProps = {
        prefixCls: 'rc-checkbox',
        className: '',
        type: 'checkbox',
        defaultChecked: false,
        onFocus: noop,
        onBlur: noop,
        onChange: noop
    };

    @observable store = {
        checked: 'checked' in this.props ? this.props.checked : this.props.defaultChecked
    };

    @action changeStore(state: State) {
        return this.store = assign(toJS(this.store), state);
    }

    componentWillReceiveProps(nextProps) {
        if ('checked' in nextProps) {
            this.changeStore({
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
            this.changeStore({
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
        const {checked} = this.store;
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
