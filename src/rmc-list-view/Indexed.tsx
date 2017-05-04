import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {cloneElement, findDOMNode} from "inferno-compat";
import * as classNames from 'classnames';
import ListView from './ListView';
import {getOffsetTop, _event} from './util';
import {IIndexedList} from "./PropsType";
import noop from "../rc-util/noop";

/* eslint react/prop-types: 0 */
@observer
export default class IndexedList extends Component<IIndexedList, any> {

    static defaultProps = {
        prefixCls: 'rmc-indexed-list',
        quickSearchBarTop: {value: '#', label: '#'},
        onQuickSearch: noop,
        showQuickSearchIndicator: false,
        delayTime: 100,
        // delayActivityIndicator: <div style={{padding: 5, textAlign: 'center'}}>rendering more</div>,
        delayActivityIndicator: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            pageSize: props.pageSize,
            _delay: false,
        };
    }

    componentDidMount() {
        this.dataChange(this.props);
        // handle quickSearchBar
        this.getQsInfo();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dataSource !== nextProps.dataSource) {
            this.dataChange(nextProps);
        }
    }

    componentDidUpdate() {
        this.getQsInfo();
    }

    _timer;
    _hCache;

    indexedListView;
    quickSearchBar;
    qsIndicator;

    bindIndexedListView = (indexedListView) => {
        this.indexedListView = indexedListView;
    }

    bindQuickSearchBar = (quickSearchBar) => {
        this.quickSearchBar = quickSearchBar;
    }

    bindQsIndicator = (qsIndicator) => {
        this.qsIndicator = qsIndicator;
    }

    componentWillUnmount() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._hCache = null;
    }

    onQuickSearchTop(sectionID, topId) {
        if (this.props.stickyHeader) {
            window.document.body.scrollTop = 0;
        } else {
            const indexedListView: any = this.indexedListView;
            findDOMNode(indexedListView.refs.listviewscroll).scrollTop = 0;
        }
        this.props.onQuickSearch(sectionID, topId);
    }

    onQuickSearch(sectionID) {
        const indexedListView: any = this.indexedListView;
        const lv = findDOMNode(indexedListView.refs.listviewscroll);
        let sec = findDOMNode(this.sectionComponents[sectionID]);
        if (this.props.stickyHeader) {
            // react-sticky 会把 header 设置为 fixed ，但提供了 placeholder 记忆原来位置
            const stickyComponent = indexedListView.stickyRefs[sectionID];
            if (stickyComponent && stickyComponent.refs.placeholder) {
                sec = findDOMNode(stickyComponent.refs.placeholder);
            }
            window.document.body.scrollTop =
                sec.getBoundingClientRect().top - lv.getBoundingClientRect().top + getOffsetTop(lv);
        } else {
            lv.scrollTop += sec.getBoundingClientRect().top - lv.getBoundingClientRect().top;
        }
        this.props.onQuickSearch(sectionID);
    }

    _target;
    _basePos;

    onTouchStart(e) {
        this._target = e.target;
        const quickSearchBar: any = this.quickSearchBar;
        this._basePos = quickSearchBar.getBoundingClientRect();
        document.addEventListener('touchmove', this._disableParent, false);
        document.body.className = `${document.body.className} ${this.props.prefixCls}-qsb-moving`;
        this.updateIndicator(this._target);
    }

    _qsHeight;
    _avgH;

    onTouchMove(e) {
        e.preventDefault();
        if (this._target) {
            const ex = _event(e);
            const basePos = this._basePos;
            let _pos;
            if (ex.clientY >= basePos.top && ex.clientY <= (basePos.top + this._qsHeight)) {
                _pos = Math.floor((ex.clientY - basePos.top) / this._avgH);
                let target;
                if (_pos in this._hCache) {
                    target = this._hCache[_pos][0];
                }
                if (target) {
                    const overValue = target.getAttribute('data-qf-target');
                    if (this._target !== target) {
                        if (this.props.quickSearchBarTop.value === overValue) {
                            this.onQuickSearchTop(undefined, overValue);
                        } else {
                            this.onQuickSearch(overValue);
                        }
                        this.updateIndicator(target);
                    }
                    this._target = target;
                }
            }
        }
    }

    onTouchEnd() {
        if (!this._target) {
            return;
        }
        document.removeEventListener('touchmove', this._disableParent, false);
        document.body.className = document.body.className.replace(
            new RegExp(`\\s*${this.props.prefixCls}-qsb-moving`, 'g'), '');
        this.updateIndicator(this._target, true);
        this._target = null;
    }

    getQsInfo() {
        const quickSearchBar: any = this.quickSearchBar;
        const height = quickSearchBar.offsetHeight;
        const hCache = [];
        [].slice.call(quickSearchBar.querySelectorAll('[data-qf-target]')).forEach((d) => {
            hCache.push([d]);
        });
        const _avgH = height / hCache.length;
        let _top = 0;
        for (let i = 0, len = hCache.length; i < len; i++) {
            _top = i * _avgH;
            hCache[i][1] = [_top, _top + _avgH];
        }
        this._qsHeight = height;
        this._avgH = _avgH;
        this._hCache = hCache;
    }

    sectionComponents = {};

    dataChange(props) {
        // delay render more
        const rowCount = props.dataSource.getRowCount();
        const indexedListView: any = this.indexedListView;
        if (!rowCount) {
            return;
        }
        this.setState({
            _delay: true,
        });
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._timer = setTimeout(() => {
            this.setState({
                pageSize: rowCount,
                _delay: false,
            }, () => indexedListView._pageInNewRows());
        }, props.delayTime);
    }

    _indicatorTimer;

    updateIndicator(ele, end?) {
        let el = ele;
        if (!el.getAttribute('data-qf-target')) {
            el = el.parentNode;
        }
        if (this.props.showQuickSearchIndicator) {
            const qsIndicator: any = this.qsIndicator;
            qsIndicator.innerText = el.innerText.trim();
            this.setState({
                showQuickSearchIndicator: true,
            });
            if (this._indicatorTimer) {
                clearTimeout(this._indicatorTimer);
            }
            this._indicatorTimer = setTimeout(() => {
                this.setState({
                    showQuickSearchIndicator: false,
                });
            }, 1000);
        }

        const cls = `${this.props.prefixCls}-quick-search-bar-over`;
        // can not use setState to change className, it has a big performance issue!
        this._hCache.forEach((d) => {
            d[0].className = d[0].className.replace(cls, '');
        });
        if (!end) {
            el.className = `${el.className} ${cls}`;
        }
    }

    _disableParent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    renderQuickSearchBar(quickSearchBarTop, quickSearchBarStyle) {
        const {dataSource, prefixCls} = this.props;
        const sectionKvs = dataSource.sectionIdentities.map((i) => {
            return {
                value: i,
                label: dataSource._getSectionHeaderData(dataSource._dataBlob, i),
            };
        });
        return (
            <ul
                ref={this.bindQuickSearchBar}
                className={`${prefixCls}-quick-search-bar`}
                style={quickSearchBarStyle}
                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchEnd={this.onTouchEnd}
                onTouchCancel={this.onTouchEnd}
            >
                <li
                    data-qf-target={quickSearchBarTop.value}
                    onClick={this.quickSearchBarClick(quickSearchBarTop)}
                >
                    {quickSearchBarTop.label}
                </li>
                {sectionKvs.map((i) => {
                    return (
                        <li
                            key={i.value}
                            data-qf-target={i.value}
                            onClick={this.sectionKvClick.bind(this, i) }
                        >
                            {i.label}
                        </li>
                    );
                })}
            </ul>
        );
    }

    sectionKvClick(i) {
        this.onQuickSearch(i.value);
    }

    quickSearchBarClick(quickSearchBarTop) {
        const me = this;
        return () => {
            me.onQuickSearchTop(undefined, quickSearchBarTop.value);
        };
    }

    render() {
        const {_delay, pageSize} = this.state;
        const {
            className, prefixCls, children, quickSearchBarTop, quickSearchBarStyle,
            initialListSize = Math.min(20, this.props.dataSource.getRowCount()),
            showQuickSearchIndicator,
            renderSectionHeader, sectionHeaderClassName, ...other,
        } = this.props;

        // initialListSize={this.props.dataSource.getRowCount()}
        return (<div className={`${prefixCls}-container`}>
            {_delay && this.props.delayActivityIndicator}
            <ListView
                {...other}
                ref={this.bindIndexedListView}
                className={classNames({
                    [className]: className,
                    [prefixCls]: true,
                })}
                initialListSize={initialListSize}
                pageSize={pageSize}
                renderSectionHeader={this.onRenderSectionHeader(renderSectionHeader, sectionHeaderClassName, prefixCls)}
            >
                {children}
            </ListView>
            {this.renderQuickSearchBar(quickSearchBarTop, quickSearchBarStyle)}
            {showQuickSearchIndicator ? <div
                className={classNames({
                    [`${prefixCls}-qsindicator`]: true,
                    [`${prefixCls}-qsindicator-hide`]: !showQuickSearchIndicator
                    || !this.state.showQuickSearchIndicator,
                })}
                ref={this.bindQsIndicator}
            /> : null}
        </div>);
    }

    onRenderSectionHeader(renderSectionHeader, sectionHeaderClassName, prefixCls) {
        return (sectionData, sectionID) => {
            return cloneElement(
                renderSectionHeader(sectionData, sectionID), {
                    ref: this.sectionComponentsBySectionID(this, sectionID),
                    className: sectionHeaderClassName || `${prefixCls}-section-header`,
                }
            );
        };
    }

    sectionComponentsBySectionID(me, sectionID) {
        return (c) => {
            return me.sectionComponents[sectionID] = c;
        };
    }
}
