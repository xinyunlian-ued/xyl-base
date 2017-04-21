import {CSSProperties, ReactElement} from "react";
import ListViewDataSource from './ListViewDataSource';
export interface IStaticRenderer {
    shouldUpdate: boolean;
    render: any;
}

export interface IRefreshControl {
    prefixCls?: string;
    className?: string;
    style?: CSSProperties;
    icon?: any;
    loading?: any;
    distanceToRefresh?: number;
    refreshing?: boolean;
    onRefresh: (...argument) => void;
}

export interface IScrollView {
    children?: any;
    className?: string;
    prefixCls?: string;
    listPrefixCls?: string;
    listViewPrefixCls?: string;
    style?: CSSProperties;
    contentContainerStyle?: CSSProperties;
    onScroll?: (...argument) => void;
    scrollEventThrottle?: number;
    removeClippedSubviews?: boolean; // offscreen views are removed
    refreshControl?: any;
    stickyHeader?;
    useBodyScroll?;
    onLayout?;
    useZscroller?;
    scrollerOptions?;
}

export interface IListView extends IScrollView {
    dataSource: ListViewDataSource;
    renderSeparator?: (...argument) => void;
    renderRow: any;
    initialListSize?: number;
    onEndReached?: (...argument) => void;
    onEndReachedThreshold?: number;
    pageSize?: number;
    renderFooter?: (...argument) =>  ReactElement<{}>;
    renderHeader?: (...argument) =>  ReactElement<{}>;
    renderSectionHeader?: (...argument) =>  ReactElement<any>;
    renderScrollComponent?: (...argument) =>  ReactElement<any>;
    scrollRenderAheadDistance?: number;
    onChangeVisibleRows?: (...argument) => void;
    scrollEventThrottle?: number;
    // removeClippedSubviews: React.PropTypes.bool,
    // stickyHeaderIndices: PropTypes.arrayOf(PropTypes.number),
    // another added
    renderBodyComponent?: (...argument) => ReactElement<{}>;
    renderSectionBodyWrapper?: (...argument) => ReactElement<any>;
    sectionBodyClassName?: string;
    useZscroller?: boolean; // for web
    useBodyScroll?: boolean;  // for web
    stickyHeader?: boolean;  // for web
    stickyProps?: any; // https://github.com/captivationsoftware/react-sticky/blob/master/README.md#sticky--props
    stickyContainerProps?: any;
    horizontal?;
    onContentSizeChange?;
}

export interface IIndexedList extends IListView {
    children?: any;
    prefixCls?: string;
    className?: string;
    sectionHeaderClassName?: string;
    quickSearchBarTop?: any;
    quickSearchBarStyle?: string;
    onQuickSearch?: (...argument) => void;
    showQuickSearchIndicator?: boolean;
    refs?: any;
    delayActivityIndicator;
}