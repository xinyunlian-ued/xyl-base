import React, {cloneElement, Component} from 'react';
import {findDOMNode} from 'react-dom';
import ListViewDataSource from './ListViewDataSource';
import ScrollView from './ScrollView';
import ScrollResponder from './ScrollResponder';
import StaticRenderer from './StaticRenderer';
import TimerMixin from 'react-timer-mixin';
import mixin from 'react-mixin';
import autobind from 'autobind-decorator';
import {StickyContainer, Sticky} from 'react-sticky';
import PullUpLoadMoreMixin from './PullUpLoadMoreMixin';
import {IListView} from "./PropsType";
import {observer} from "mobx-react";
import IndexedList from './Indexed';
import RefreshControl from './RefreshControl';

const DEFAULT_PAGE_SIZE = 1;
const DEFAULT_INITIAL_ROWS = 10;
const DEFAULT_SCROLL_RENDER_AHEAD = 1000;
const DEFAULT_END_REACHED_THRESHOLD = 1000;
const DEFAULT_SCROLL_CALLBACK_THROTTLE = 50;
const SCROLLVIEW_REF = 'listviewscroll';

// https://github.com/facebook/react-native/blob/master/Libraries/CustomComponents/ListView/ListView.js

/* eslint react/prop-types: 0, react/sort-comp: 0, no-unused-expressions: 0 */

@observer
class ListView extends Component<IListView, any> {
    static DataSource = ListViewDataSource;
    static IndexedList = IndexedList;
    static RefreshControl = RefreshControl;

    static defaultProps = {
        initialListSize: DEFAULT_INITIAL_ROWS,
        pageSize: DEFAULT_PAGE_SIZE,
        renderScrollComponent: (props) => <ScrollView {...props} />,
        renderBodyComponent: () => <div />,
        renderSectionBodyWrapper: (sectionID) => <div key={sectionID}/>,
        sectionBodyClassName: 'list-view-section-body',
        scrollRenderAheadDistance: DEFAULT_SCROLL_RENDER_AHEAD,
        onEndReachedThreshold: DEFAULT_END_REACHED_THRESHOLD,
        scrollEventThrottle: DEFAULT_SCROLL_CALLBACK_THROTTLE,
        // stickyHeaderIndices: [],
        stickyProps: {},
        stickyContainerProps: {},
    };

    state = {
        curRenderedRowsCount: this.props.initialListSize,
        highlightedRow: {
            sectionID: undefined,
            rowID: undefined
        },
    };

    scrollProperties;
    _visibleRows;

    /**
     * Exports some data, e.g. for perf investigations or analytics.
     */
    getMetrics() {
        return {
            contentLength: this.scrollProperties.contentLength,
            totalRows: this.props.dataSource.getRowCount(),
            renderedRows: this.state.curRenderedRowsCount,
            visibleRows: Object.keys(this._visibleRows).length,
        };
    }

    /**
     * Provides a handle to the underlying scroll responder.
     * Note that the view in `SCROLLVIEW_REF` may not be a `ScrollView`, so we
     * need to check that it responds to `getScrollResponder` before calling it.
     */
    getScrollResponder() {
        const ref: any = this.refs[SCROLLVIEW_REF];
        if (ref) {
            return ref.getScrollResponder && ref.getScrollResponder();
        }
    }

    scrollTo(...args) {
        const ref: any = this.refs[SCROLLVIEW_REF];
        if (ref && ref.scrollTo) {
            ref.scrollTo(...args);
        }
    }

    setNativeProps(props) {
        const ref: any = this.refs[SCROLLVIEW_REF];
        if (ref && ref.scrollTo) {
            ref.setNativeProps(props);
        }
    }

    getInnerViewNode() {
        const ref: any = this.refs[SCROLLVIEW_REF];
        return ref.getInnerViewNode();
    }

    _childFrames;
    _prevRenderedRowsCount;
    _sentEndForContentLength;

    componentWillMount() {
        // this data should never trigger a render pass, so don't put in state
        this.scrollProperties = {
            visibleLength: null,
            contentLength: null,
            offset: 0,
        };
        this._childFrames = [];
        this._visibleRows = {};
        this._prevRenderedRowsCount = 0;
        this._sentEndForContentLength = null;
    }

    componentDidMount() {
        // do this in animation frame until componentDidMount actually runs after
        // the component is laid out
        // this.requestAnimationFrame(() => {
        //   this._measureAndUpdateScrollProps();
        // });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dataSource !== nextProps.dataSource ||
            this.props.initialListSize !== nextProps.initialListSize) {
            this.setState((state, props) => {
                this._prevRenderedRowsCount = 0;
                return {
                    curRenderedRowsCount: Math.min(
                        Math.max(
                            state.curRenderedRowsCount,
                            props.initialListSize
                        ),
                        props.dataSource.getRowCount()
                    ),
                };
            }, () => this._renderMoreRowsIfNeeded());
        }
    }

    onRowHighlighted(sectionID, rowID) {
        this.setState({highlightedRow: {sectionID, rowID}});
    }

    stickyRefs = {};

    setStickyRefs(sectionID) {
        const me = this;
        return (c) => {
            me.stickyRefs[sectionID] = c;
        };
    }

    render() {
        let bodyComponents: any = [];

        const dataSource = this.props.dataSource;
        const allRowIDs = dataSource.rowIdentities;
        let rowCount = 0;
        const sectionHeaderIndices = [];

        const header: any = this.props.renderHeader && this.props.renderHeader();
        const footer: any = this.props.renderFooter && this.props.renderFooter();
        let totalIndex = header ? 1 : 0;

        for (let sectionIdx = 0; sectionIdx < allRowIDs.length; sectionIdx++) {
            const sectionID = dataSource.sectionIdentities[sectionIdx];
            const rowIDs = allRowIDs[sectionIdx];
            if (rowIDs.length === 0) {
                continue;
            }

            if (this.props.renderSectionHeader) {
                const shouldUpdateHeader = rowCount >= this._prevRenderedRowsCount &&
                    dataSource.sectionHeaderShouldUpdate(sectionIdx);

                let renderSectionHeader = (
                    <StaticRenderer
                        key={`s_${sectionID}`}
                        shouldUpdate={!!shouldUpdateHeader}
                        render={this.props.renderSectionHeader.bind(
                            null,
                            dataSource.getSectionHeaderData(sectionIdx),
                            sectionID
                        )}
                    />
                );
                if (this.props.stickyHeader) {
                    renderSectionHeader = (
                        <Sticky
                            {...this.props.stickyProps}
                            key={`s_${sectionID}`}
                            ref={this.setStickyRefs(sectionID)}
                        >
                            {renderSectionHeader}
                        </Sticky>
                    );
                }
                bodyComponents.push(renderSectionHeader);
                sectionHeaderIndices.push(totalIndex++);
            }

            const sectionBody = [];
            for (let rowIdx = 0; rowIdx < rowIDs.length; rowIdx++) {
                const rowID = rowIDs[rowIdx];
                const comboID = `${sectionID}_${rowID}`;
                const shouldUpdateRow = rowCount >= this._prevRenderedRowsCount &&
                    dataSource.rowShouldUpdate(sectionIdx, rowIdx);
                const row = (<StaticRenderer
                    key={`r_${comboID}`}
                    shouldUpdate={!!shouldUpdateRow}
                    render={this.props.renderRow.bind(
                        null,
                        dataSource.getRowData(sectionIdx, rowIdx),
                        sectionID,
                        rowID,
                        this.onRowHighlighted
                    )}
                />);
                // bodyComponents.push(row);
                sectionBody.push(row);
                totalIndex++;

                if (this.props.renderSeparator &&
                    (rowIdx !== rowIDs.length - 1 || sectionIdx === allRowIDs.length - 1)) {
                    const adjacentRowHighlighted =
                        this.state.highlightedRow.sectionID === sectionID && (
                            this.state.highlightedRow.rowID === rowID ||
                            this.state.highlightedRow.rowID === rowIDs[rowIdx + 1]
                        );
                    const separator = this.props.renderSeparator(
                        sectionID,
                        rowID,
                        adjacentRowHighlighted
                    );
                    if (separator) {
                        // bodyComponents.push(separator);
                        sectionBody.push(separator);
                        totalIndex++;
                    }
                }
                if (++rowCount === this.state.curRenderedRowsCount) {
                    break;
                }
            }
            bodyComponents.push(cloneElement(this.props.renderSectionBodyWrapper(sectionID), {
                className: this.props.sectionBodyClassName,
            }, sectionBody));
            if (rowCount >= this.state.curRenderedRowsCount) {
                break;
            }
        }

        const {
            renderScrollComponent,
            ...props,
        } = this.props;

        bodyComponents = cloneElement(props.renderBodyComponent(), {}, bodyComponents);
        if (props.stickyHeader) {
            bodyComponents = (<StickyContainer {...props.stickyContainerProps}>
                {bodyComponents}
            </StickyContainer>);
        }

        this._sc = cloneElement(renderScrollComponent({...props, onScroll: this._onScroll}), {
            ref: SCROLLVIEW_REF,
            onContentSizeChange: this._onContentSizeChange,
            onLayout: this._onLayout,
        }, header, bodyComponents, footer, props.children);
        return this._sc;
    }

    _sc;

    /**
     * Private methods
     */

    _measureAndUpdateScrollProps() {
        const scrollComponent = this.getScrollResponder();
        if (!scrollComponent || !scrollComponent.getInnerViewNode) {
            return;
        }

        // RCTScrollViewManager.calculateChildFrames is not available on
        // every platform
        // RCTScrollViewManager && RCTScrollViewManager.calculateChildFrames &&
        //   RCTScrollViewManager.calculateChildFrames(
        //     React.findNodeHandle(scrollComponent),
        //     this._updateVisibleRows,
        //   );
    }

    _onContentSizeChange(width, height) {
        const contentLength = !this.props.horizontal ? height : width;
        if (contentLength !== this.scrollProperties.contentLength) {
            this.scrollProperties.contentLength = contentLength;
            this._updateVisibleRows();
            this._renderMoreRowsIfNeeded();
        }
        if (this.props.onContentSizeChange) {
            this.props.onContentSizeChange(width, height);
        }
    }

    _onLayout(event) {
        const {width, height} = event.nativeEvent.layout;
        const visibleLength = !this.props.horizontal ? height : width;
        if (visibleLength !== this.scrollProperties.visibleLength) {
            this.scrollProperties.visibleLength = visibleLength;
            this._updateVisibleRows();
            this._renderMoreRowsIfNeeded();
        }
        if (this.props.onLayout) {
            this.props.onLayout(event);
        }
    }

    _maybeCallOnEndReached(event?) {
        // console.log(this.scrollProperties, this._getDistanceFromEnd(this.scrollProperties));
        if (this.props.onEndReached &&
            // this.scrollProperties.contentLength !== this._sentEndForContentLength &&
            this._getDistanceFromEnd(this.scrollProperties) < this.props.onEndReachedThreshold &&
            this.state.curRenderedRowsCount === this.props.dataSource.getRowCount()) {
            this._sentEndForContentLength = this.scrollProperties.contentLength;
            this.props.onEndReached(event);
            return true;
        }
        return false;
    }

    _renderMoreRowsIfNeeded() {
        if (this.scrollProperties.contentLength === null ||
            this.scrollProperties.visibleLength === null ||
            this.state.curRenderedRowsCount === this.props.dataSource.getRowCount()) {
            this._maybeCallOnEndReached();
            return;
        }

        const distanceFromEnd = this._getDistanceFromEnd(this.scrollProperties);
        // console.log(distanceFromEnd, this.props.scrollRenderAheadDistance);
        if (distanceFromEnd < this.props.scrollRenderAheadDistance) {
            this._pageInNewRows();
        }
    }

    _pageInNewRows() {
        this.setState((state, props) => {
            const rowsToRender = Math.min(
                state.curRenderedRowsCount + props.pageSize,
                props.dataSource.getRowCount()
            );
            this._prevRenderedRowsCount = state.curRenderedRowsCount;
            return {
                curRenderedRowsCount: rowsToRender,
            };
        }, () => {
            this._measureAndUpdateScrollProps();
            this._prevRenderedRowsCount = this.state.curRenderedRowsCount;
        });
    }

    _getDistanceFromEnd(scrollProperties) {
        return scrollProperties.contentLength -
            scrollProperties.visibleLength - scrollProperties.offset;
    }

    _updateVisibleRows(/* updatedFrames */) {
        // if (!this.props.onChangeVisibleRows) {
        //   return; // No need to compute visible rows if there is no callback
        // }
        // if (updatedFrames) {
        //   updatedFrames.forEach((newFrame) => {
        //     this._childFrames[newFrame.index] = merge(newFrame);
        //   });
        // }
        // let isVertical = !this.props.horizontal;
        // let dataSource = this.props.dataSource;
        // let visibleMin = this.scrollProperties.offset;
        // let visibleMax = visibleMin + this.scrollProperties.visibleLength;
        // let allRowIDs = dataSource.rowIdentities;
        //
        // let header = this.props.renderHeader && this.props.renderHeader();
        // let totalIndex = header ? 1 : 0;
        // let visibilityChanged = false;
        // let changedRows = {};
        // for (let sectionIdx = 0; sectionIdx < allRowIDs.length; sectionIdx++) {
        //   let rowIDs = allRowIDs[sectionIdx];
        //   if (rowIDs.length === 0) {
        //     continue;
        //   }
        //   let sectionID = dataSource.sectionIdentities[sectionIdx];
        //   if (this.props.renderSectionHeader) {
        //     totalIndex++;
        //   }
        //   let visibleSection = this._visibleRows[sectionID];
        //   if (!visibleSection) {
        //     visibleSection = {};
        //   }
        //   for (let rowIdx = 0; rowIdx < rowIDs.length; rowIdx++) {
        //     let rowID = rowIDs[rowIdx];
        //     let frame = this._childFrames[totalIndex];
        //     totalIndex++;
        //     if (!frame) {
        //       break;
        //     }
        //     let rowVisible = visibleSection[rowID];
        //     let min = isVertical ? frame.y : frame.x;
        //     let max = min + (isVertical ? frame.height : frame.width);
        //     if (min > visibleMax || max < visibleMin) {
        //       if (rowVisible) {
        //         visibilityChanged = true;
        //         delete visibleSection[rowID];
        //         if (!changedRows[sectionID]) {
        //           changedRows[sectionID] = {};
        //         }
        //         changedRows[sectionID][rowID] = false;
        //       }
        //     } else if (!rowVisible) {
        //       visibilityChanged = true;
        //       visibleSection[rowID] = true;
        //       if (!changedRows[sectionID]) {
        //         changedRows[sectionID] = {};
        //       }
        //       changedRows[sectionID][rowID] = true;
        //     }
        //   }
        //   if (!isEmpty(visibleSection)) {
        //     this._visibleRows[sectionID] = visibleSection;
        //   } else if (this._visibleRows[sectionID]) {
        //     delete this._visibleRows[sectionID];
        //   }
        // }
        // visibilityChanged && this.props.onChangeVisibleRows(this._visibleRows, changedRows);
    }

    _onScroll(e) {
        const isVertical = !this.props.horizontal;
        // this.scrollProperties.visibleLength = e.nativeEvent.layoutMeasurement[
        //   isVertical ? 'height' : 'width'
        // ];
        // this.scrollProperties.contentLength = e.nativeEvent.contentSize[
        //   isVertical ? 'height' : 'width'
        // ];
        // this.scrollProperties.offset = e.nativeEvent.contentOffset[
        //   isVertical ? 'y' : 'x'
        // ];
        let ev = e;
        const target = findDOMNode(this.refs[SCROLLVIEW_REF]);
        if (this.props.stickyHeader || this.props.useBodyScroll) {
            this.scrollProperties.visibleLength = window[
                isVertical ? 'innerHeight' : 'innerWidth'
                ];
            this.scrollProperties.contentLength = target[
                isVertical ? 'scrollHeight' : 'scrollWidth'
                ];
            this.scrollProperties.offset = window.document.body[
                isVertical ? 'scrollTop' : 'scrollLeft'
                ];
        } else if (this.props.useZscroller) {
            const ref: any = this.refs[SCROLLVIEW_REF];
            const domScroller = ref.domScroller;
            ev = domScroller;
            this.scrollProperties.visibleLength = domScroller.container[
                isVertical ? 'clientHeight' : 'clientWidth'
                ];
            this.scrollProperties.contentLength = domScroller.content[
                isVertical ? 'offsetHeight' : 'offsetWidth'
                ];
            this.scrollProperties.offset = domScroller.scroller.getValues()[
                isVertical ? 'top' : 'left'
                ];
            // console.log(this.scrollProperties, domScroller.scroller.getScrollMax())
        } else {
            this.scrollProperties.visibleLength = target[
                isVertical ? 'offsetHeight' : 'offsetWidth'
                ];
            this.scrollProperties.contentLength = target[
                isVertical ? 'scrollHeight' : 'scrollWidth'
                ];
            this.scrollProperties.offset = target[
                isVertical ? 'scrollTop' : 'scrollLeft'
                ];
        }

        // this._updateVisibleRows(e.nativeEvent.updatedChildFrames);
        if (!this._maybeCallOnEndReached(ev)) {
            this._renderMoreRowsIfNeeded();
        }

        if (this.props.onEndReached &&
            this._getDistanceFromEnd(this.scrollProperties) > this.props.onEndReachedThreshold) {
            // Scrolled out of the end zone, so it should be able to trigger again.
            this._sentEndForContentLength = null;
        }

        if (this.props.onScroll) {
            this.props.onScroll(ev);
        }
    }

    static isReactNativeComponent = true;
}

mixin(ListView.prototype, ScrollResponder.Mixin);
mixin(ListView.prototype, TimerMixin);
mixin(ListView.prototype, PullUpLoadMoreMixin);
autobind(ListView);

export default ListView;
