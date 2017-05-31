import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {cloneElement} from 'inferno-compat';
import {observer} from 'inferno-mobx';
import Modal from '../rc-dialog';
import {IPopupPickerProps} from './PopupPickerTypes';
import Touchable from '../rc-touchable';

@observer
export default class PopupPicker extends Component<IPopupPickerProps, any> {
    static defaultProps = {
        prefixCls: 'xyl-base/lib/rmc-picker-popup',
        triggerType: 'onClick',
        WrapComponent: 'span',
    };

    state = {
        pickerValue: 'value' in this.props ? this.props.value : null,
        visible: this.props.visible || false,
    };

    componentWillReceiveProps(nextProps) {
        if ('value' in nextProps) {
            this.setState({
                pickerValue: nextProps.value,
            });
        }
        if ('visible' in nextProps) {
            this.setVisibleState(nextProps.visible);
        }
    }

    onPickerChange = (pickerValue) => {
        if (this.state.pickerValue !== pickerValue) {
            this.setState({
                pickerValue,
            });
            const {picker, pickerValueChangeProp} = this.props;
            if (picker && picker.props[pickerValueChangeProp]) {
                picker.props[pickerValueChangeProp](pickerValue);
            }
        }
    }

    picker;

    saveRef = (picker) => {
        this.picker = picker;
    }

    setVisibleState = (visible) => {
        this.setState({
            visible,
        });
        if (!visible) {
            this.setState({
                pickerValue: null,
            });
        }
    }

    fireVisibleChange = (visible) => {
        if (this.state.visible !== visible) {
            if (!('visible' in this.props)) {
                this.setVisibleState(visible);
            }
            this.props.onVisibleChange(visible);
        }
    }

    getRender = () => {
        const props = this.props;
        const children = props.children;
        if (!children) {
            return this.getModal();
        }
        const {WrapComponent, disabled} = this.props;
        const child = children;
        const newChildProps = {};
        if (!disabled) {
            newChildProps[props.triggerType] = this.onTriggerClick;
        }
        return (<WrapComponent style={props.wrapStyle}>
            {cloneElement(child, newChildProps)}
            {this.getModal()}
        </WrapComponent>);
    }

    onTriggerClick = (e) => {
        const child: any = this.props.children;
        const childProps = child.props || {};
        if (childProps[this.props.triggerType]) {
            childProps[this.props.triggerType](e);
        }
        this.fireVisibleChange(!this.state.visible);
    }

    onOk = () => {
        this.props.onOk(this.picker && this.picker.getValue());
        this.fireVisibleChange(false);
    }

    getContent = () => {
        if (this.props.picker) {
            let {pickerValue} = this.state;
            if (pickerValue === null) {
                pickerValue = this.props.value;
            }
            return cloneElement(this.props.picker, ({
                [this.props.pickerValueProp]: pickerValue,
                [this.props.pickerValueChangeProp]: this.onPickerChange,
                ref: this.saveRef,
            }));
        } else {
            return this.props.content;
        }
    }

    onDismiss = () => {
        this.props.onDismiss();
        this.fireVisibleChange(false);
    }

    hide = () => {
        this.fireVisibleChange(false);
    }

    getModal = () => {
        const props = this.props;
        if (!this.state.visible) {
            return null;
        }
        const {prefixCls} = props;
        return (
            <Modal
                prefixCls={`${prefixCls}`}
                className={props.className || ''}
                visible
                closable={false}
                transitionName={props.transitionName || props.popupTransitionName}
                maskTransitionName={props.maskTransitionName}
                onClose={this.hide}
                style={props.style}
            >
                <div>
                    <div className={`${prefixCls}-header`}>
                        <Touchable activeClassName={`${prefixCls}-item-active`}>
                            <div className={`${prefixCls}-item ${prefixCls}-header-left`} onClick={this.onDismiss}>
                                {props.dismissText}
                            </div>
                        </Touchable>
                        <div className={`${prefixCls}-item ${prefixCls}-title`}>{props.title}</div>
                        <Touchable activeClassName={`${prefixCls}-item-active`}>
                            <div className={`${prefixCls}-item ${prefixCls}-header-right`} onClick={this.onOk}>
                                {props.okText}
                            </div>
                        </Touchable>
                    </div>
                    {this.getContent()}
                </div>
            </Modal>
        );
    }

    render() {
        return this.getRender();
    }
}
