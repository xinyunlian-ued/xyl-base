import React from 'react';
import Inferno from 'inferno';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import './assets/index.less';
import InputNumber from '../index';

@observer
class App extends React.Component<any, any> {
    state = {
        disabled: false,
        readOnly: false,
        value: 5,
    };
    onChange = (value) => {
        console.log('onChange:', value);
        this.setState({value});
    }
    toggleDisabled = () => {
        this.setState({
            disabled: !this.state.disabled,
        });
    }
    toggleReadOnly = () => {
        this.setState({
            readOnly: !this.state.readOnly,
        });
    }

    render() {
        return (
            <div style={{margin: 10}}>
                <InputNumber
                    min={-8}
                    max={10}
                    value={this.state.value}
                    style={{width: 100}}
                    readOnly={this.state.readOnly}
                    onChange={this.onChange}
                    disabled={this.state.disabled}
                />
                <p>
                    <button onClick={this.toggleDisabled}>toggle Disabled</button>
                    <button onClick={this.toggleReadOnly}>toggle readOnly</button>
                </p>
            </div>
        );
    }
}

Inferno.render(<App/>, document.getElementById('app'));
