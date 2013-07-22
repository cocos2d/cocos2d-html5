/*
 *
 * Copyright (c) 2010-2012 cocos2d-x.org
 * Copyright 2011 Yannick Loriot.
 * http://yannickloriot.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *
 * converted to Javascript / cocos2d-x by Angus C
 */

/** Number of kinds of control event. */
cc.CONTROL_EVENT_TOTAL_NUMBER = 9;

/** Kinds of possible events for the control objects. */
cc.CONTROL_EVENT_TOUCH_DOWN = 1 << 0;    // A touch-down event in the control.
cc.CONTROL_EVENT_TOUCH_DRAG_INSIDE = 1 << 1;    // An event where a finger is dragged inside the bounds of the control.
cc.CONTROL_EVENT_TOUCH_DRAG_OUTSIDE = 1 << 2;    // An event where a finger is dragged just outside the bounds of the control.
cc.CONTROL_EVENT_TOUCH_DRAG_ENTER = 1 << 3;    // An event where a finger is dragged into the bounds of the control.
cc.CONTROL_EVENT_TOUCH_DRAG_EXIT = 1 << 4;    // An event where a finger is dragged from within a control to outside its bounds.
cc.CONTROL_EVENT_TOUCH_UP_INSIDE = 1 << 5;    // A touch-up event in the control where the finger is inside the bounds of the control.
cc.CONTROL_EVENT_TOUCH_UP_OUTSIDE = 1 << 6;    // A touch-up event in the control where the finger is outside the bounds of the control.
cc.CONTROL_EVENT_TOUCH_CANCEL = 1 << 7;    // A system event canceling the current touches for the control.
cc.CONTROL_EVENT_VALUECHANGED = 1 << 8;    // A touch dragging or otherwise manipulating a control; causing it to emit a series of different values.

/** The possible state for a control.  */
cc.CONTROL_STATE_NORMAL = 1 << 0; // The normal; or default state of a control梩hat is; enabled but neither selected nor highlighted.
cc.CONTROL_STATE_HIGHLIGHTED = 1 << 1; // Highlighted state of a control. A control enters this state when a touch down; drag inside or drag enter is performed. You can retrieve and set this value through the highlighted property.
cc.CONTROL_STATE_DISABLED = 1 << 2; // Disabled state of a control. This state indicates that the control is currently disabled. You can retrieve and set this value through the enabled property.
cc.CONTROL_STATE_SELECTED = 1 << 3;  // Selected state of a control. This state indicates that the control is currently selected. You can retrieve and set this value through the selected property.
cc.CONTROL_STATE_INITIAL = 1 << 3;

/**
 * CCControl is inspired by the UIControl API class from the UIKit library of
 * CocoaTouch. It provides a base class for control CCSprites such as CCButton
 * or CCSlider that convey user intent to the application.
 * The goal of CCControl is to define an interface and base implementation for
 * preparing action messages and initially dispatching them to their targets when
 * certain events occur.
 * To use the CCControl you have to subclass it.
 * @class
 * @extends cc.LayerRGBA
 */
cc.Control = cc.LayerRGBA.extend({
    _isOpacityModifyRGB:false,
    _hasVisibleParents:false,

    isOpacityModifyRGB:function () {
        return this._isOpacityModifyRGB;
    },
    setOpacityModifyRGB:function (opacityModifyRGB) {
        this._isOpacityModifyRGB = opacityModifyRGB;

        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            var selNode = children[i];
            if (selNode && selNode.RGBAProtocol) {
                selNode.setOpacityModifyRGB(opacityModifyRGB);
            }
        }
    },

    /** The current control state constant. */
    _state:cc.CONTROL_STATE_NORMAL,
    getState:function () {
        return this._state;
    },

    _enabled:false,
    _selected:false,
    _highlighted:false,

    _dispatchTable:{},

    /**
     * Tells whether the control is enabled
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        this._enabled = enabled;
        if (this._enabled) {
            this._state = cc.CONTROL_STATE_NORMAL;
        } else {
            this._state = cc.CONTROL_STATE_DISABLED;
        }

        this.needsLayout();
    },
    isEnabled:function () {
        return this._enabled;
    },

    /**
     * A Boolean value that determines the control selected state.
     * @param {Boolean} selected
     */
    setSelected:function (selected) {
        this._selected = selected;
        this.needsLayout();
    },
    isSelected:function () {
        return this._selected;
    },

    /**
     *  A Boolean value that determines whether the control is highlighted.
     * @param {Boolean} highlighted
     */
    setHighlighted:function (highlighted) {
        this._highlighted = highlighted;
        this.needsLayout();
    },
    isHighlighted:function () {
        return this._highlighted;
    },

    hasVisibleParents:function () {
        var parent = this.getParent();
        for (var c = parent; c != null; c = c.getParent()) {
            if (!c.isVisible()) {
                return false;
            }
        }
        return true;
    },

    ctor:function () {
        this._super();
        this._dispatchTable = {};
        this._color = cc.white();
    },

    init:function () {
        if (this._super()) {
            //this.setTouchEnabled(true);
            //m_bIsTouchEnabled=true;
            // Initialise instance variables
            this._state = cc.CONTROL_STATE_NORMAL;
            this._enabled = true;
            this._selected = false;
            this._highlighted = false;

            // Set the touch dispatcher priority by default to 1
            this._defaultTouchPriority = 1;
            this.setTouchPriority(1);
            // Initialise the tables
            this._dispatchTable = {};
            //dispatchTable.autorelease();
            //   dispatchTable_ = [[NSMutableDictionary alloc] initWithCapacity:1];
            return true;
        } else
            return false;
    },

    onEnter:function () {
        this._super();
    },
    onExit:function () {
        this._super();
    },
    registerWithTouchDispatcher:function () {
        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, cc.MENU_HANDLER_PRIORITY, true);
    },

    /**
     * Sends action messages for the given control events.
     * which action messages are sent. See "CCControlEvent" for bitmask constants.
     * @param controlEvents A bitmask whose set flags specify the control events for
     */
    sendActionsForControlEvents:function (controlEvents) {
        // For each control events
        for (var i = 0; i < cc.CONTROL_EVENT_TOTAL_NUMBER; i++) {
            // If the given controlEvents bitmask contains the curent event
            if ((controlEvents & (1 << i))) {
                // Call invocations
                // <CCInvocation*>
                var invocationList = this._dispatchListforControlEvent(1 << i);
                for (var j = 0; j < invocationList.length; j++) {
                    invocationList[j].invoke(this);
                }
            }
        }
    },

    /**
     * Adds a target and action for a particular event (or events) to an internal
     * dispatch table.
     * The action message may optionnaly include the sender and the event as
     * parameters, in that order.
     * When you call this method, target is not retained.
     *
     * @param target The target object梩hat is, the object to which the action
     * message is sent. It cannot be nil. The target is not retained.
     * @param action A selector identifying an action message. It cannot be NULL.
     * @param controlEvents A bitmask specifying the control events for which the
     * action message is sent. See "CCControlEvent" for bitmask constants.
     */
    addTargetWithActionForControlEvents:function (target, action, controlEvents) {
        // For each control events
        for (var i = 0; i < cc.CONTROL_EVENT_TOTAL_NUMBER; i++) {
            // If the given controlEvents bitmask contains the curent event
            if ((controlEvents & (1 << i))) {
                this.addTargetWithActionForControlEvent(target, action, 1 << i);
            }
        }
    },

    /**
     * Removes a target and action for a particular event (or events) from an
     * internal dispatch table.
     *
     * @param target The target object梩hat is, the object to which the action
     * message is sent. Pass nil to remove all targets paired with action and the
     * specified control events.
     * @param action A selector identifying an action message. Pass NULL to remove
     * all action messages paired with target.
     * @param controlEvents A bitmask specifying the control events associated with
     * target and action. See "CCControlEvent" for bitmask constants.
     */
    removeTargetWithActionForControlEvents:function (target, action, controlEvents) {
        // For each control events
        for (var i = 0; i < cc.CONTROL_EVENT_TOTAL_NUMBER; i++) {
            // If the given controlEvents bitmask contains the curent event
            if ((controlEvents & (1 << i))) {
                this.removeTargetWithActionForControlEvent(target, action, 1 << i);
            }
        }
    },

    /**
     * Returns a point corresponding to the touh location converted into the
     * control space coordinates.
     * @param touch A CCTouch object that represents a touch.
     */
    getTouchLocation:function (touch) {
        var touchLocation = touch.getLocation();                      // Get the touch position
        touchLocation = this.convertToNodeSpace(touchLocation);  // Convert to the node space of this class

        return touchLocation;
    },

    /**
     * Returns a boolean value that indicates whether a touch is inside the bounds
     * of the receiver. The given touch must be relative to the world.
     *
     * @param touch A CCTouch object that represents a touch.
     *
     * @return YES whether a touch is inside the receiver抯 rect.
     */
    isTouchInside:function (touch) {
        var touchLocation = touch.getLocation(); // Get the touch position
        touchLocation = this.getParent().convertToNodeSpace(touchLocation);
        return cc.rectContainsPoint(this.getBoundingBox(), touchLocation);
    },

    /**
     * Returns an CCInvocation object able to construct messages using a given
     * target-action pair. (The invocation may optionnaly include the sender and
     * the event as parameters, in that order)
     *
     * @param target The target object.
     * @param action A selector identifying an action message.
     * @param controlEvent A control events for which the action message is sent.
     * See "CCControlEvent" for constants.
     *
     * @return an CCInvocation object able to construct messages using a given
     * target-action pair.
     */
    _invocationWithTargetAndActionForControlEvent:function (target, action, controlEvent) {
    },

    /**
     * Returns the CCInvocation list for the given control event. If the list does
     * not exist, it'll create an empty array before returning it.
     *
     * @param controlEvent A control events for which the action message is sent.
     * See "CCControlEvent" for constants.
     *
     * @return the CCInvocation list for the given control event.
     */
    _dispatchListforControlEvent:function (controlEvent) {
        controlEvent = controlEvent.toString();
        if (this._dispatchTable.hasOwnProperty(controlEvent))
            return this._dispatchTable[controlEvent];

        // If the invocation list does not exist for the  dispatch table, we create it

        var invocationList = [];
        this._dispatchTable[controlEvent] = invocationList;

        return invocationList;
    },

    /**
     * Adds a target and action for a particular event to an internal dispatch
     * table.
     * The action message may optionnaly include the sender and the event as
     * parameters, in that order.
     * When you call this method, target is not retained.
     *
     * @param target The target object梩hat is, the object to which the action
     * message is sent. It cannot be nil. The target is not retained.
     * @param action A selector identifying an action message. It cannot be NULL.
     * @param controlEvent A control event for which the action message is sent.
     * See "CCControlEvent" for constants.
     */
    addTargetWithActionForControlEvent:function (target, action, controlEvent) {
        // Create the invocation object
        var invocation = new cc.Invocation(target, action, controlEvent);

        // Add the invocation into the dispatch list for the given control event
        var eventInvocationList = this._dispatchListforControlEvent(controlEvent);
        eventInvocationList.push(invocation);
    },

    /**
     * Removes a target and action for a particular event from an internal dispatch
     * table.
     *
     * @param target The target object梩hat is, the object to which the action
     * message is sent. Pass nil to remove all targets paired with action and the
     * specified control events.
     * @param action A selector identifying an action message. Pass NULL to remove
     * all action messages paired with target.
     * @param controlEvent A control event for which the action message is sent.
     * See "CCControlEvent" for constants.
     */
    removeTargetWithActionForControlEvent:function (target, action, controlEvent) {
        // Retrieve all invocations for the given control event
        //<CCInvocation*>
        var eventInvocationList = this._dispatchListforControlEvent(controlEvent);

        //remove all invocations if the target and action are null
        //TODO: should the invocations be deleted, or just removed from the array? Won't that cause issues if you add a single invocation for multiple events?
        var bDeleteObjects = true;
        if (!target && !action) {
            //remove objects
            eventInvocationList.length = 0;
        } else {
            //normally we would use a predicate, but this won't work here. Have to do it manually
            for (var i = 0; i < eventInvocationList.length; i++) {
                var invocation = eventInvocationList[i];
                var shouldBeRemoved = true;
                if (target)
                    shouldBeRemoved = (target == invocation.getTarget());
                if (action)
                    shouldBeRemoved = (shouldBeRemoved && (action == invocation.getAction()));
                // Remove the corresponding invocation object
                if (shouldBeRemoved)
                    cc.ArrayRemoveObject(eventInvocationList, invocation);
            }
        }
    },

    /**
     * Updates the control layout using its current internal state.
     */
    needsLayout:function () {

    }
});

cc.Control.create = function () {
    var retControl = new cc.Control();
    if (retControl && retControl.init())
        return retControl;
    return null;
};

