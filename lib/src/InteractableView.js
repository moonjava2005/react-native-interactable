import React, {Component} from 'react';
import {Animated, findNodeHandle, NativeModules, Platform, requireNativeComponent, UIManager} from 'react-native';

// this is required in order to perform imperative commands
const NativeViewManager = NativeModules.InteractableViewManager;

const NativeInteractableView = requireNativeComponent('InteractableView', null);

class WrappedInteractableView extends Component {
    _nativeViewRef = React.createRef();

    render() {
        return (
            <NativeInteractableView
                {...this.props}
                ref={this._nativeViewRef}
            />
        );
    }

    getScrollableNode() {
        return findNodeHandle(this._nativeViewRef.current);
    }
}

// this is required in order to support native events:
const AnimatedInteractableView = Animated.createAnimatedComponent(WrappedInteractableView);

class WrappedAnimatedInteractableView extends Component {
    constructor(props) {
        super(props);
        if (this.props.animatedValueX || this.props.animatedValueY) {
            this._animatedEvent = Animated.event(
                [{
                    nativeEvent: {
                        x: this.props.animatedValueX,
                        y: this.props.animatedValueY
                    }
                }],
                {useNativeDriver: !!this.props.animatedNativeDriver}
            );
        }
    }

    componentWillMount() {
        // this.chokeTheBridge();
    }

    // this helps us verify that useNativeDriver actually works and we don't rely on the bridge
    chokeTheBridge() {
        let j = 0;
        setInterval(() => {
            for (var index = 0; index < 1e9; index++) {
                j++;
            }
        }, 500);
    }

    render() {
        return (
            <AnimatedInteractableView
                dragToss={0.1}
                {...this.props}
                animatedValueX={undefined}
                animatedValueY={undefined}
                onAnimatedEvent={this._animatedEvent}
                reportOnAnimatedEvents={!!this._animatedEvent}
            />
        );
    }

    setVelocity(params) {

        if (Platform.OS === 'ios') {
            NativeViewManager.setVelocity(findNodeHandle(this), params);
        } else if (Platform.OS === 'android') {
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this),
                UIManager.getViewManagerConfig('InteractableView').Commands.setVelocity,
                [params],
            );
        }
    }

    snapTo(params) {
        if (Platform.OS === 'ios') {
            NativeViewManager.snapTo(findNodeHandle(this), params);
        } else if (Platform.OS === 'android') {
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this),
                UIManager.getViewManagerConfig('InteractableView').Commands.snapTo,
                [params],
            );
        }
    }

    changePosition(params) {
        if (Platform.OS === 'ios') {
            NativeViewManager.changePosition(findNodeHandle(this), params);
        } else if (Platform.OS === 'android') {
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this),
                UIManager.getViewManagerConfig('InteractableView').Commands.changePosition,
                [params],
            );
        }
    }

    bringToFront() {
        if (Platform.OS === 'android') {
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this),
                UIManager.getViewManagerConfig('InteractableView').Commands.bringToFront,
                [],
            );
        }
    }
}

export default WrappedAnimatedInteractableView;
