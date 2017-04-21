import React, {Component} from 'react';
import {unmountComponentAtNode, unstable_renderSubtreeIntoContainer} from 'react-dom';
import {observer} from 'mobx-react';
import Dialog from './Dialog';
import IDialogPropTypes from './IDialogPropTypes';
import noop from "../rc-util/noop";

function removeContainer(instance) {
    if (instance._container) {
        const container = instance._container;
        unmountComponentAtNode(container);
        container.parentNode.removeChild(container);
        instance._container = null;
    }
}

@observer
export default class DialogWrap extends Component<IDialogPropTypes, any> {

    static defaultProps = {
        visible: false,
    };

    shouldComponentUpdate({visible}) {
        return !!(this.props.visible || visible);
    }

    _container;

    renderComponent(componentArg, ready?) {
        renderComponent(this, componentArg, ready);
    }

    removeContainer() {
        removeContainer(this);
    }

    componentWillUnmount() {
        if (this.props.visible) {
            this.renderComponent({
                afterClose: this.removeContainer,
                onClose: noop,
                visible: false,
            });
        } else {
            this.removeContainer();
        }
    }

    _component;

    getElement(part) {
        return this._component.getElement(part);
    }

    render() {
        return (null as any);
    }
}
function renderComponent(instance, componentArg?, ready?) {
    if (!isVisible || instance._component || isVisible(instance)) {
        if (!instance._container) {
            instance._container = getContainer(instance);
        }
        let component;
        if (instance.getComponent) {
            component = instance.getComponent(componentArg);
        } else {
            component = getComponent(instance, componentArg);
        }
        unstable_renderSubtreeIntoContainer(instance,
            component, instance._container,
            function callback() {
                instance._component = this;
                if (ready) {
                    ready.call(this);
                }
            });
    }
}
function isVisible(instance) {
    return instance.props.visible;
}
function getComponent(instance, extra) {
    return (
        <Dialog
            {...instance.props}
            {...extra}
            key="dialog"
        />
    );
}
function getContainer(instance) {
    if (instance.props.getContainer) {
        return instance.props.getContainer();
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
}