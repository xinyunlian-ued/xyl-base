import React from 'react';
import createClass from 'create-react-class';
import Dialog from './Dialog';
import getContainerRenderMixin from '../rc-util/getContainerRenderMixin';
import IDialogPropTypes from './IDialogPropTypes';
import noop from "../rc-util/noop";
import {observer} from "mobx-react";

const DialogWrap = observer(createClass({
    mixins: [
        getContainerRenderMixin({
            isVisible(instance) {
                return instance.props.visible;
            },
            autoDestroy: false,
            getComponent(instance, extra) {
                return (
                    <Dialog
                        {...instance.props}
                        {...extra}
                        key="dialog"
                    />
                );
            },
            getContainer(instance) {
                if (instance.props.getContainer) {
                    return instance.props.getContainer();
                }
                const container = document.createElement('div');
                document.body.appendChild(container);
                return container;
            },
        }),
    ],

    getDefaultProps() {
        return {
            visible: false,
        };
    },

    shouldComponentUpdate({visible}) {
        return !!(this.props.visible || visible);
    },

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
    },

    getElement(part) {
        return this._component.getElement(part);
    },

    render() {
        return (null as any);
    },
}));

export default DialogWrap;
