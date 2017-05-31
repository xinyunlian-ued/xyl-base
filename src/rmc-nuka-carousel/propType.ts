export interface Shape {
    component: any;
    position: 'TopLeft' | 'TopCenter' | 'TopRight' | 'CenterLeft' | 'CenterCenter' | 'CenterRight' | 'BottomLeft' | 'BottomCenter' | 'BottomRight';
    style: any;
}

export interface CarouselPropType {
    afterSlide: any;
    autoplay: boolean;
    resetAutoplay: boolean;  // by warmhug
    swipeSpeed: number;  // by warmhug
    autoplayInterval: number;
    beforeSlide: any;
    cellAlign: 'left' | 'center' | 'right';
    cellSpacing: number;
    data: any;
    decorators: Shape[];
    dragging: boolean;
    easing: string;
    edgeEasing: string;
    framePadding: string;
    frameOverflow: string;
    initialSlideHeight: number;
    initialSlideWidth: number;
    slideIndex: number;
    slidesToShow: number;
    slidesToScroll: number | 'auto';
    slideWidth: string | number;
    speed: number;
    swiping: boolean;
    vertical: boolean;
    width: string;
    wrapAround: boolean;
}