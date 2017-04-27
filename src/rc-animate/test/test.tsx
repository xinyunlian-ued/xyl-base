import './assets/index.less';
import React, {Component} from 'react';
import {render} from 'react-dom';
import assign from 'object-assign';

import Animate from '../index';

let seed = 0;
class Alert extends Component < any, any > {

  componentDidMount() {
    const props = this.props;
    setTimeout(() => {
      props.onEnd();
    }, props.time);
  }

  render() {
    const props = this.props;
    const style = {
      background: 'yellow',
      width: 600,
      padding: 20,
      marginLeft: 'auto',
      marginRight: 'auto'
    };
    return <div style={style}>{props.str}</div>;
  }
}

class AlertGroup extends Component<any, any> {
  state = {
    alerts: []
  }

  onEnd = (key) => {
    const alerts = this.state.alerts;
    const ret = [];
    let target;
    alerts.forEach((a) => {
      if (a.key === key) {
        target = a;
      } else {
        ret.push(a);
      }
    });
    if (target) {
      this.setState({
        alerts: ret
      }, () => {
        if (target.callback) {
          target.callback();
        }
      });
    }
  }

  addAlert = (a) => {
    this.setState({
      alerts: this
        .state
        .alerts
        .concat(a)
    });
  }

  render() {
    const alerts = this.state.alerts;
    const self = this;
    const children = alerts.map((a) => {
      if (!a.key) {
        seed++;
        a.key = String(seed);
      }
      return <Alert {...a} onEnd={self
        .onEnd
        .bind(self, a.key)}/>;
    });
    const style = {
      position: 'fixed',
      width: '100%',
      top: 50,
      zIndex: 9999
    };
    return (
      <div >
        <Animate transitionName="fade" component="div">{children}</Animate>
      </div>
    );
  }
}
let alertGroup;

function alert(str?, time?, type?, callback?) {
  if (!alertGroup) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    alertGroup = render(<AlertGroup/>, div);
  }
  alertGroup.addAlert({
    str,
    time,
    type,
    callback,
  });
}

function alertFn(i) {
  function m() {
    alert(`${i}`);
  }

  return m;
}

function onClick() {
  for (let i = 0; i < 4; i++) {
    setTimeout(alertFn(i), 1000 * i);
  }
}

//render(<Test />, document.getElementById('app'));
render(
  <div>
  <h2>notification</h2>
  <button onClick={onClick}>show notification</button>
</div>, document.getElementById('app'));