'use strict';

import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {Children} from "inferno-compat";
import {easeInOutQuad} from 'tween-functions';
import requestAnimationFrame from 'raf';
import tweenState from 'kw-react-tween-state';
import decorators from './decorators';
import assign from 'object-assign';
import ExecutionEnvironment from 'exenv';
import {CarouselPropType} from "./propType";
import noop from "../rc-util/noop";

// additive is the new iOS 8 default. In most cases it simulates a physics-
// looking overshoot behavior (especially with easeInOut. You can test that in
// the example
const DEFAULT_STACK_BEHAVIOR = 'ADDITIVE';
const DEFAULT_EASING = easeInOutQuad;
const DEFAULT_DURATION = 300;
const DEFAULT_DELAY = 0;

const stackBehavior = {
    ADDITIVE: 'ADDITIVE',
    DESTRUCTIVE: 'DESTRUCTIVE',
};

const addEvent = (elem, type, eventHandle) => {
    if (elem === null || typeof (elem) === 'undefined') {
        return;
    }
    if (elem.addEventListener) {
        elem.addEventListener(type, eventHandle, false);
    } else if (elem.attachEvent) {
        elem.attachEvent('on' + type, eventHandle);
    } else {
        elem['on' + type] = eventHandle;
    }
};

const removeEvent = (elem, type, eventHandle) => {
    if (elem === null || typeof (elem) === 'undefined') {
        return;
    }
    if (elem.removeEventListener) {
        elem.removeEventListener(type, eventHandle, false);
    } else if (elem.detachEvent) {
        elem.detachEvent('on' + type, eventHandle);
    } else {
        elem['on' + type] = null;
    }
};

class Carousel extends Component<CarouselPropType, any> {
    static displayName = 'Carousel';
    static ControllerMixin = {
        getInitialState() {
            return {
                carousels: {}
            };
        },
        setCarouselData(carousel) {
            const data = this.state.carousels;
            data[carousel] = this[carousel];
            this.setState({
                carousels: data
            });
        }
    };
    static defaultProps = {
        afterSlide: noop,
        autoplay: false,
        resetAutoplay: true,
        swipeSpeed: 5,
        autoplayInterval: 3000,
        beforeSlide: noop,
        cellAlign: 'left',
        cellSpacing: 0,
        data: noop,
        decorators: decorators,
        dragging: true,
        easing: 'easeOutCirc',
        edgeEasing: 'easeOutElastic',
        framePadding: '0px',
        frameOverflow: 'hidden',
        slideIndex: 0,
        slidesToScroll: 1,
        slidesToShow: 1,
        slideWidth: 1,
        speed: 500,
        swiping: true,
        vertical: false,
        width: '100%',
        wrapAround: false
    };

    state = {
        slidesToShow: 1,
        currentSlide: this.props.slideIndex,
        dragging: false,
        frameWidth: 0,
        left: 0,
        slideCount: 0,
        slidesToScroll: this.props.slidesToScroll,
        slideWidth: 0,
        top: 0,
        slideHeight: 0,
        tweenQueue: [],
    };

    _rafID = null;

    tweenState = (path, {easing, duration, delay, beginValue, endValue, onEnd, stackBehavior: configSB}) => {
        this.setState(state => {
            let cursor = state;
            let stateName;
            // see comment below on pash hash
            let pathHash;
            if (typeof path === 'string') {
                stateName = path;
                pathHash = path;
            } else {
                for (let i = 0; i < path.length - 1; i++) {
                    cursor = cursor[path[i]];
                }
                stateName = path[path.length - 1];
                pathHash = path.join('|');
            }
            // see the reasoning for these defaults at the top of file
            const newConfig = {
                easing: easing || DEFAULT_EASING,
                duration: duration == null ? DEFAULT_DURATION : duration,
                delay: delay == null ? DEFAULT_DELAY : delay,
                beginValue: beginValue == null ? cursor[stateName] : beginValue,
                endValue: endValue,
                onEnd: onEnd,
                stackBehavior: configSB || DEFAULT_STACK_BEHAVIOR,
            };

            let newTweenQueue = state.tweenQueue;
            if (newConfig.stackBehavior === stackBehavior.DESTRUCTIVE) {
                newTweenQueue = state.tweenQueue.filter(item => item.pathHash !== pathHash);
            }

            // we store path hash, so that during value retrieval we can use hash
            // comparison to find the path. See the kind of shitty thing you have to
            // do when you don't have value comparison for collections?
            newTweenQueue.push({
                pathHash: pathHash,
                config: newConfig,
                initTime: Date.now() + newConfig.delay,
            });

            // sorry for mutating. For perf reasons we don't want to deep clone.
            // guys, can we please all start using persistent collections so that
            // we can stop worrying about nonesense like this
            cursor[stateName] = newConfig.endValue;
            if (newTweenQueue.length === 1) {
                this._rafID = requestAnimationFrame(this._rafCb.bind(this));
            }

            // this will also include the above mutated update
            return {tweenQueue: newTweenQueue};
        });
    }

    getTweeningValue = (path) => {
        const state = this.state;

        let tweeningValue;
        let pathHash;
        if (typeof path === 'string') {
            tweeningValue = state[path];
            pathHash = path;
        } else {
            tweeningValue = state;
            for (let i = 0; i < path.length; i++) {
                tweeningValue = tweeningValue[path[i]];
            }
            pathHash = path.join('|');
        }
        let now = Date.now();

        for (let i = 0; i < state.tweenQueue.length; i++) {
            const {pathHash: itemPathHash, initTime, config} = state.tweenQueue[i];
            if (itemPathHash !== pathHash) {
                continue;
            }

            const progressTime = now - initTime > config.duration
                ? config.duration
                : Math.max(0, now - initTime);
            // `now - initTime` can be negative if initTime is scheduled in the
            // future by a delay. In this case we take 0

            // if duration is 0, consider that as jumping to endValue directly. This
            // is needed because the easing functino might have undefined behavior for
            // duration = 0
            const easeValue = config.duration === 0 ? config.endValue : config.easing(
                progressTime,
                config.beginValue,
                config.endValue,
                config.duration,
                // TODO: some funcs accept a 5th param
            );
            const contrib = easeValue - config.endValue;
            tweeningValue += contrib;
        }

        return tweeningValue;
    }

    _rafCb = () => {
        const state = this.state;
        if (state.tweenQueue.length === 0) {
            return;
        }

        const now = Date.now();
        let newTweenQueue = [];

        for (let i = 0; i < state.tweenQueue.length; i++) {
            const item = state.tweenQueue[i];
            const {initTime, config} = item;
            if (now - initTime < config.duration) {
                newTweenQueue.push(item);
            } else if (config.onEnd) {
                config.onEnd();
            }
        }

        // onEnd might trigger a parent callback that removes this component
        // -1 means we've canceled it in componentWillUnmount
        if (this._rafID === -1) {
            return;
        }

        this.setState({
            tweenQueue: newTweenQueue,
        });

        this._rafID = requestAnimationFrame(this._rafCb.bind(this));
    }


    componentWillMount() {
        this.setInitialDimensions();
    }

    componentDidMount() {
        this.setDimensions();
        this.bindEvents();
        this.setExternalData();
        if (this.props.autoplay) {
            this.startAutoplay();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            slideCount: nextProps.children.length
        });
        this.setDimensions(nextProps);
        if (this.props.slideIndex !== nextProps.slideIndex && nextProps.slideIndex !== this.state.currentSlide) {
            this.goToSlide(nextProps.slideIndex);
        }
        if (this.props.autoplay !== nextProps.autoplay) {
            if (nextProps.autoplay) {
                this.startAutoplay();
            } else {
                this.stopAutoplay();
            }
        }
    }

    componentWillUnmount() {
        this.unbindEvents();
        this.stopAutoplay();
    }

    slider;
    sliderBind = (slider) => {
        this.slider = slider;
    }
    frame;
    frameBind = (frame) => {
        this.frame = frame;
    }
    list;
    listBind = (list) => {
        this.list = list;
    }

    render() {
        let self = this;
        let children = Children.count(this.props.children as any) > 1 ? this.formatChildren(this.props.children) : this.props.children;
        return (
            <div
                className={['slider', this.props.className || ''].join(' ')}
                ref={this.sliderBind}
                style={assign(this.getSliderStyles(), this.props.style || {})}
            >
                <div
                    className="slider-frame"
                    ref={this.frameBind}
                    style={this.getFrameStyles()}
                    {...this.getTouchEvents()}
                    {...this.getMouseEvents()}
                    onClick={this.handleClick}
                >
                    <ul className="slider-list" ref={this.listBind} style={this.getListStyles()}>
                        {children}
                    </ul>
                </div>
                {this.props.decorators ?
                    this.props.decorators.map((Decorator, index) => {
                        return (
                            <div
                                style={assign(self.getDecoratorStyles(Decorator.position), Decorator.style || {})}
                                className={'slider-decorator-' + index}
                                key={index}
                            >
                                <Decorator.component
                                    currentSlide={self.state.currentSlide}
                                    slideCount={self.state.slideCount}
                                    frameWidth={self.state.frameWidth}
                                    slideWidth={self.state.slideWidth}
                                    slidesToScroll={self.state.slidesToScroll}
                                    cellSpacing={self.props.cellSpacing}
                                    slidesToShow={self.props.slidesToShow}
                                    wrapAround={self.props.wrapAround}
                                    nextSlide={self.nextSlide}
                                    previousSlide={self.previousSlide}
                                    goToSlide={self.goToSlide}
                                />
                            </div>
                        );
                    })
                    : null}
                <style type="text/css" dangerouslySetInnerHTML={{__html: self.getStyleTagStyles()}}/>
            </div>
        );
    }

    touchObject: any = {};

    getTouchEvents = () => {
        let self = this;

        if (self.props.swiping === false) {
            return null;
        }

        return {
            onTouchStart(e) {
                self.touchObject = {
                    startX: e.touches[0].pageX,
                    startY: e.touches[0].pageY
                };
                self.handleMouseOver();
            },
            onTouchMove(e) {
                let direction = self.swipeDirection(
                    self.touchObject.startX,
                    e.touches[0].pageX,
                    self.touchObject.startY,
                    e.touches[0].pageY
                );

                if (direction !== 0) {
                    e.preventDefault();
                }

                let length = self.props.vertical ? Math.round(Math.sqrt(Math.pow(e.touches[0].pageY - self.touchObject.startY, 2)))
                    : Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)));

                self.touchObject = {
                    startX: self.touchObject.startX,
                    startY: self.touchObject.startY,
                    endX: e.touches[0].pageX,
                    endY: e.touches[0].pageY,
                    length: length,
                    direction: direction
                };

                self.setState({
                    left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
                    top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
                });
            },
            onTouchEnd(e) {
                self.handleSwipe(e);
                self.handleMouseOut();
            },
            onTouchCancel(e) {
                self.handleSwipe(e);
            }
        };
    }

    clickSafe: boolean = true;

    getMouseEvents() {
        let self = this;

        if (this.props.dragging === false) {
            return null;
        }

        return {
            onMouseOver() {
                self.handleMouseOver();
            },
            onMouseOut() {
                self.handleMouseOut();
            },
            onMouseDown(e) {
                self.touchObject = {
                    startX: e.clientX,
                    startY: e.clientY
                };

                self.setState({
                    dragging: true
                });
            },
            onMouseMove(e) {
                if (!self.state.dragging) {
                    return;
                }

                let direction = self.swipeDirection(
                    self.touchObject.startX,
                    e.clientX,
                    self.touchObject.startY,
                    e.clientY
                );

                if (direction !== 0) {
                    e.preventDefault();
                }

                let length = self.props.vertical ? Math.round(Math.sqrt(Math.pow(e.clientY - self.touchObject.startY, 2)))
                    : Math.round(Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2)));

                self.touchObject = {
                    startX: self.touchObject.startX,
                    startY: self.touchObject.startY,
                    endX: e.clientX,
                    endY: e.clientY,
                    length: length,
                    direction: direction
                };

                self.setState({
                    left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
                    top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
                });
            },
            onMouseUp(e) {
                if (!self.state.dragging) {
                    return;
                }

                self.handleSwipe(e);
            },
            onMouseLeave(e) {
                if (!self.state.dragging) {
                    return;
                }

                self.handleSwipe(e);
            }
        };
    }

    autoplayPaused;

    handleMouseOver = () => {
        if (this.props.autoplay) {
            this.autoplayPaused = true;
            this.stopAutoplay();
        }
    }

    handleMouseOut = () => {
        if (this.props.autoplay && this.autoplayPaused) {
            this.startAutoplay();
            this.autoplayPaused = null;
        }
    }

    handleClick = (e) => {
        if (this.clickSafe === true) {
            e.preventDefault();
            e.stopPropagation();

            if (e.nativeEvent) {
                e.nativeEvent.stopPropagation();
            }
        }
    }

    handleSwipe = (e) => {
        if (typeof (this.touchObject.length) !== 'undefined' && this.touchObject.length > 44) {
            this.clickSafe = true;
        } else {
            this.clickSafe = false;
        }

        let slidesToShow: any = this.props.slidesToShow;
        if (this.props.slidesToScroll === 'auto') {
            slidesToShow = this.state.slidesToScroll;
        }

        if (this.touchObject.length > (this.state.slideWidth / slidesToShow) / this.props.swipeSpeed) {
            if (this.touchObject.direction === 1) {
                if (
                    this.state.currentSlide >= Children.count(this.props.children as any) - slidesToShow &&
                    !this.props.wrapAround
                ) {
                    this.animateSlide(tweenState.easingTypes[this.props.edgeEasing]);
                } else {
                    this.nextSlide();
                }
            } else if (this.touchObject.direction === -1) {
                if (this.state.currentSlide <= 0 && !this.props.wrapAround) {
                    this.animateSlide(tweenState.easingTypes[this.props.edgeEasing]);
                } else {
                    this.previousSlide();
                }
            }
        } else {
            this.goToSlide(this.state.currentSlide);
        }

        this.touchObject = {};

        this.setState({
            dragging: false
        });
    }

    swipeDirection(x1, x2, y1, y2) {

        let xDist;
        let yDist;
        let r;
        let swipeAngle;

        xDist = x1 - x2;
        yDist = y1 - y2;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }
        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return 1;
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return 1;
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return -1;
        }
        if (this.props.vertical === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 1;
            } else {
                return -1;
            }
        }
        return 0;

    }

    autoplayIterator = () => {
        if (this.props.wrapAround) {
            return this.nextSlide();
        }
        if (this.state.currentSlide !== this.state.slideCount - this.state.slidesToShow) {
            this.nextSlide();
        } else {
            this.stopAutoplay();
        }
    }

    autoplayID;

    startAutoplay = () => {
        this.autoplayID = setInterval(this.autoplayIterator, this.props.autoplayInterval);
    }

    resetAutoplay = () => {
        if (this.props.resetAutoplay && this.props.autoplay && !this.autoplayPaused) {  // by warmhug
            this.stopAutoplay();
            this.startAutoplay();
        }
    }

    stopAutoplay = () => {
        if (this.autoplayID) {
            clearInterval(this.autoplayID);
        }
    }

    // Action Methods

    goToSlide = (index) => {
        let self = this;
        if ((index >= Children.count(this.props.children as any) || index < 0)) {
            if (!this.props.wrapAround) {
                return;
            }
            if (index >= Children.count(this.props.children as any)) {
                this.props.beforeSlide(this.state.currentSlide, 0);
                return this.setState({
                    currentSlide: 0
                }, () => {
                    self.animateSlide(null, null, self.getTargetLeft(null, index), () => {
                        self.animateSlide(null, 0.01);
                        self.props.afterSlide(0);
                        self.resetAutoplay();
                        self.setExternalData();
                    });
                });
            } else {
                let endSlide = Children.count(this.props.children as any) - Number(this.state.slidesToScroll);
                this.props.beforeSlide(this.state.currentSlide, endSlide);
                return this.setState({
                    currentSlide: endSlide
                }, () => {
                    self.animateSlide(null, null, self.getTargetLeft(null, index), () => {
                        self.animateSlide(null, 0.01);
                        self.props.afterSlide(endSlide);
                        self.resetAutoplay();
                        self.setExternalData();
                    });
                });
            }
        }

        this.props.beforeSlide(this.state.currentSlide, index);

        this.setState({
            currentSlide: index
        }, () => {
            self.animateSlide();
            this.props.afterSlide(index);
            self.resetAutoplay();
            self.setExternalData();
        });
    }

    nextSlide = () => {
        let childrenCount = Children.count(this.props.children as any);
        let slidesToShow: any = this.props.slidesToShow;
        if (this.props.slidesToScroll === 'auto') {
            slidesToShow = this.state.slidesToScroll;
        }
        if (this.state.currentSlide >= childrenCount - slidesToShow && !this.props.wrapAround) {
            return;
        }

        if (this.props.wrapAround) {
            this.goToSlide(Number(this.state.currentSlide) + Number(this.state.slidesToScroll));
        } else {
            if (this.props.slideWidth !== 1) {
                return this.goToSlide(Number(this.state.currentSlide) + Number(this.state.slidesToScroll));
            }
            this.goToSlide(
                Math.min(Number(this.state.currentSlide) + Number(this.state.slidesToScroll), childrenCount - slidesToShow)
            );
        }
    }

    previousSlide = () => {
        if (this.state.currentSlide <= 0 && !this.props.wrapAround) {
            return;
        }

        if (this.props.wrapAround) {
            this.goToSlide(this.state.currentSlide - Number(this.state.slidesToScroll));
        } else {
            this.goToSlide(Math.max(0, this.state.currentSlide - Number(this.state.slidesToScroll)));
        }
    }

    // Animation

    animateSlide = (easing?, duration?, endValue?, callback?) => {
        this.tweenState(this.props.vertical ? 'top' : 'left', {
            easing: easing || tweenState.easingTypes[this.props.easing],
            duration: duration || this.props.speed,
            endValue: endValue || this.getTargetLeft(),
            onEnd: callback || null
        } as any);
    }

    getTargetLeft = (touchOffset?, slide?) => {
        let offset;
        let target = slide || this.state.currentSlide;
        switch (this.props.cellAlign) {
            case 'left': {
                offset = 0;
                offset -= this.props.cellSpacing * (target);
                break;
            }
            case 'center': {
                offset = (this.state.frameWidth - this.state.slideWidth) / 2;
                offset -= this.props.cellSpacing * (target);
                break;
            }
            case 'right': {
                offset = this.state.frameWidth - this.state.slideWidth;
                offset -= this.props.cellSpacing * (target);
                break;
            }
        }

        let left = this.state.slideWidth * target;

        let lastSlide = this.state.currentSlide > 0 && target + this.state.slidesToScroll >= this.state.slideCount;

        if (lastSlide && this.props.slideWidth !== 1 && !this.props.wrapAround && this.props.slidesToScroll === 'auto') {
            left = (this.state.slideWidth * this.state.slideCount) - this.state.frameWidth;
            offset = 0;
            offset -= this.props.cellSpacing * (this.state.slideCount - 1);
        }

        offset -= touchOffset || 0;

        return (left - offset) * -1;
    }

    // Bootstrapping

    bindEvents = () => {
        let self = this;
        if (ExecutionEnvironment.canUseDOM) {
            addEvent(window, 'resize', self.onResize);
            addEvent(document, 'readystatechange', self.onReadyStateChange);
        }
    }

    onResize = () => {
        this.setDimensions();
    }

    onReadyStateChange = () => {
        this.setDimensions();
    }

    unbindEvents = () => {
        let self = this;
        if (ExecutionEnvironment.canUseDOM) {
            removeEvent(window, 'resize', self.onResize);
            removeEvent(document, 'readystatechange', self.onReadyStateChange);
        }
    }

    formatChildren = (children) => {
        let self = this;
        let positionValue = this.props.vertical ? this.getTweeningValue('top') : this.getTweeningValue('left');
        return Children.map(children, (child, index) => {
            return (
                <li
                    className="slider-slide"
                    style={self.getSlideStyles(index, positionValue)}
                    key={index}
                >
                    {child}
                </li>
            );
        }, null);
    }

    setInitialDimensions = () => {
        let self = this;
        let slideWidth;
        let frameHeight;
        let slideHeight;

        slideWidth = this.props.vertical ? (this.props.initialSlideHeight || 0) : (this.props.initialSlideWidth || 0);
        slideHeight = this.props.initialSlideHeight ? this.props.initialSlideHeight * this.props.slidesToShow : 0;

        frameHeight = slideHeight + (this.props.cellSpacing * (this.props.slidesToShow - 1));

        this.setState({
            slideHeight: slideHeight,
            frameWidth: this.props.vertical ? frameHeight : '100%',
            slideCount: Children.count(this.props.children as any),
            slideWidth: slideWidth
        }, () => {
            self.setLeft();
            self.setExternalData();
        });
    }

    setDimensions = (props?) => {
        props = props || this.props;

        let self = this;
        let slideWidth;
        let slidesToScroll;
        let firstSlide;
        let frame;
        let frameWidth;
        let frameHeight;
        let slideHeight;

        slidesToScroll = props.slidesToScroll;
        frame = this.frame;
        firstSlide = frame.childNodes[0].childNodes[0];
        if (firstSlide) {
            firstSlide.style.height = 'auto';
            slideHeight = this.props.vertical ?
                firstSlide.offsetHeight * props.slidesToShow :
                firstSlide.offsetHeight;
        } else {
            slideHeight = 100;
        }

        if (typeof props.slideWidth !== 'number') {
            slideWidth = Number(props.slideWidth);
        } else {
            if (props.vertical) {
                slideWidth = (slideHeight / props.slidesToShow) * props.slideWidth;
            } else {
                slideWidth = (frame.offsetWidth / props.slidesToShow) * props.slideWidth;
            }
        }

        if (!props.vertical) {
            slideWidth -= props.cellSpacing * ((100 - (100 / props.slidesToShow)) / 100);
        }

        frameHeight = slideHeight + (props.cellSpacing * (props.slidesToShow - 1));
        frameWidth = props.vertical ? frameHeight : frame.offsetWidth;

        if (props.slidesToScroll === 'auto') {
            slidesToScroll = Math.floor(frameWidth / (slideWidth + props.cellSpacing));
        }

        this.setState({
            slideHeight: slideHeight,
            frameWidth: frameWidth,
            slideWidth: slideWidth,
            slidesToScroll: slidesToScroll,
            left: props.vertical ? 0 : this.getTargetLeft(),
            top: props.vertical ? this.getTargetLeft() : 0
        }, () => {
            self.setLeft();
        });
    }

    setLeft = () => {
        this.setState({
            left: this.props.vertical ? 0 : this.getTargetLeft(),
            top: this.props.vertical ? this.getTargetLeft() : 0
        });
    }

    // Data

    setExternalData = () => {
        if (this.props.data) {
            this.props.data();
        }
    }

    // Styles

    getListStyles = () => {
        let listWidth = this.state.slideWidth * Children.count(this.props.children as any);
        let spacingOffset = this.props.cellSpacing * Children.count(this.props.children as any);
        let transform = 'translate3d(' +
            this.getTweeningValue('left') + 'px, ' +
            this.getTweeningValue('top') + 'px, 0)';
        return {
            transform,
            WebkitTransform: transform,
            msTransform: 'translate(' +
            this.getTweeningValue('left') + 'px, ' +
            this.getTweeningValue('top') + 'px)',
            position: 'relative',
            display: 'block',
            margin: this.props.vertical ? (this.props.cellSpacing / 2) * -1 + 'px 0px'
                : '0px ' + (this.props.cellSpacing / 2) * -1 + 'px',
            padding: 0,
            height: this.props.vertical ? listWidth + spacingOffset : this.state.slideHeight,
            width: this.props.vertical ? 'auto' : listWidth + spacingOffset,
            cursor: this.state.dragging === true ? 'pointer' : 'inherit',
            boxSizing: 'border-box',
            MozBoxSizing: 'border-box'
        };
    }

    getFrameStyles = () => {
        return {
            position: 'relative',
            display: 'block',
            overflow: this.props.frameOverflow,
            height: this.props.vertical ? this.state.frameWidth || 'initial' : 'auto',
            margin: this.props.framePadding,
            padding: 0,
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            msTransform: 'translate(0, 0)',
            boxSizing: 'border-box',
            MozBoxSizing: 'border-box'
        };
    }

    getSlideStyles = (index, positionValue) => {
        let targetPosition = this.getSlideTargetPosition(index, positionValue);
        return {
            position: 'absolute',
            left: this.props.vertical ? 0 : targetPosition,
            top: this.props.vertical ? targetPosition : 0,
            display: this.props.vertical ? 'block' : 'inline-block',
            listStyleType: 'none',
            verticalAlign: 'top',
            width: this.props.vertical ? '100%' : this.state.slideWidth,
            height: 'auto',
            boxSizing: 'border-box',
            MozBoxSizing: 'border-box',
            marginLeft: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
            marginRight: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
            marginTop: this.props.vertical ? this.props.cellSpacing / 2 : 'auto',
            marginBottom: this.props.vertical ? this.props.cellSpacing / 2 : 'auto'
        };
    }

    getSlideTargetPosition = (index, positionValue) => {
        let slidesToShow = (this.state.frameWidth / this.state.slideWidth);
        let targetPosition = (this.state.slideWidth + this.props.cellSpacing) * index;
        let end = ((this.state.slideWidth + this.props.cellSpacing) * slidesToShow) * -1;

        if (this.props.wrapAround) {
            let slidesBefore = Math.ceil(positionValue / (this.state.slideWidth));
            if (this.state.slideCount - slidesBefore <= index) {
                return (this.state.slideWidth + this.props.cellSpacing) *
                    (this.state.slideCount - index) * -1;
            }

            let slidesAfter = Math.ceil((Math.abs(positionValue) - Math.abs(end)) / this.state.slideWidth);

            if (this.state.slideWidth !== 1) {
                slidesAfter = Math.ceil((Math.abs(positionValue) - (this.state.slideWidth)) / this.state.slideWidth);
            }

            if (index <= slidesAfter - 1) {
                return (this.state.slideWidth + this.props.cellSpacing) * (this.state.slideCount + index);
            }
        }

        return targetPosition;
    }

    getSliderStyles = () => {
        return {
            position: 'relative',
            display: 'block',
            width: this.props.width,
            height: 'auto',
            boxSizing: 'border-box',
            MozBoxSizing: 'border-box',
            visibility: this.state.slideWidth ? 'visible' : 'hidden'
        };
    }

    getStyleTagStyles = () => {
        return '.slider-slide > img {width: 100%; display: block;}';
    }

    getDecoratorStyles = (position) => {
        switch (position) {
            case 'TopLeft': {
                return {
                    position: 'absolute',
                    top: 0,
                    left: 0
                };
            }
            case 'TopCenter': {
                return {
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    WebkitTransform: 'translateX(-50%)',
                    msTransform: 'translateX(-50%)'
                };
            }
            case 'TopRight': {
                return {
                    position: 'absolute',
                    top: 0,
                    right: 0
                };
            }
            case 'CenterLeft': {
                return {
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    transform: 'translateY(-50%)',
                    WebkitTransform: 'translateY(-50%)',
                    msTransform: 'translateY(-50%)'
                };
            }
            case 'CenterCenter': {
                return {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    WebkitTransform: 'translate(-50%, -50%)',
                    msTransform: 'translate(-50%, -50%)'
                };
            }
            case 'CenterRight': {
                return {
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    transform: 'translateY(-50%)',
                    WebkitTransform: 'translateY(-50%)',
                    msTransform: 'translateY(-50%)'
                };
            }
            case 'BottomLeft': {
                return {
                    position: 'absolute',
                    bottom: 0,
                    left: 0
                };
            }
            case 'BottomCenter': {
                return {
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    WebkitTransform: 'translateX(-50%)',
                    msTransform: 'translateX(-50%)'
                };
            }
            case 'BottomRight': {
                return {
                    position: 'absolute',
                    bottom: 0,
                    right: 0
                };
            }
            default: {
                return {
                    position: 'absolute',
                    top: 0,
                    left: 0
                };
            }
        }
    }
}

export default Carousel;
