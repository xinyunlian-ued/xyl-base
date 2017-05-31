import createElement from 'inferno-create-element';
import {unmountComponentAtNode, unstable_renderSubtreeIntoContainer} from "inferno-compat";
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import Dialog from './Dialog';
import IDialogPropTypes from './IDialogPropTypes';
import noop from "../rc-util/noop";

@observer
export default class DialogWrap extends Component<IDialogPropTypes, any> {

    static defaultProps = {
        visible: false
    };

    _component;

    componentDidMount() {
        renderComponent(this);
    }

    componentDidUpdate() {
        renderComponent(this);
    }

    renderComponent = (componentArg, ready?) => {
        renderComponent(this, componentArg, ready);
    }

    removeContainer() {
        removeContainer(this);
    }

    shouldComponentUpdate({visible}) {
        return !!(this.props.visible || visible);
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

    getElement = (part) => {
        return this._component.getElement(part);
    }

    render() {
        return (null as any);
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


function removeContainer(instance) {
    if (instance._container) {
        const container = instance._container;
        unmountComponentAtNode(container);
        container.parentNode.removeChild(container);
        instance._container = null;
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