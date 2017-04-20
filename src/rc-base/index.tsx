import React from 'react';
import {action, observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import assign from 'object-assign';

@observer
export default class Component<P, S> extends React.Component<P, S> {

    @observable public store: S;

    @action
    public changeStore(store: S, callback?: () => void): S {
        this.store = assign({}, toJS(this.store), store);
        if (typeof callback === 'function') {
            callback.call(this);
        }
        return this.store;
    }
}
