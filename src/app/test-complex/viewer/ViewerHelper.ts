
// //// <reference path="../Models/ImageDataModels.ts" />
// //// <reference path="../Declaretions.ts" />

// 'use strict';

import Konva from "konva";
import { PointF } from "src/app/viewer/interfaces/ImageDataModels";
import { HipToolsViewer } from "./HipToolsViewer";


declare var Vec2: any;
declare var vMath: any;
declare var MathL: any;

export class ViewerHelper {

    static MoveObjectToGroupKeepLocation(group: any, objectToMove: any) {
        var oldObjTransform = objectToMove.getAbsoluteTransform().m;
        var groupInvertedTransform = MathL.InvertTransformMatrix(group.getAbsoluteTransform().m);

        var newObjTransform = MathL.MultiplyTransformMatrix(groupInvertedTransform, oldObjTransform);
        objectToMove.moveTo(group);
        ViewerHelper.SetObjectTransformMatrix(objectToMove, newObjTransform);
    }

    static SetObjectTransformMatrix(object: any, matrix: any) {
        var transationX = matrix[4];
        var transationY = matrix[5];
        var scaleX = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]);
        var scaleY = Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3]);
        if (matrix[0] * matrix[3] - matrix[1] * matrix[2] < 0) {
            scaleY = -scaleY;
        }
        if (matrix[0] < 0) {
            scaleX = -scaleX;
            scaleY = -scaleY;
        }
        var angle = Math.acos(matrix[3] / scaleY);
        if (matrix[2] / scaleY > 0) {
            angle = -angle;
        }
        var angleDegree = angle * 180 / Math.PI;

        object.setOffset({ x: 0, y: 0 });
        object.position({ x: transationX, y: transationY });
        object.setRotation(angleDegree);
        object.scale({ x: scaleX, y: scaleY });

    }

    static TranslatePointCoords(point: PointF, origCoordsObj: any, destCoordsObj: any) {
        var oldObjTransform = origCoordsObj.getAbsoluteTransform().m;
        var newObjTransform = destCoordsObj.getAbsoluteTransform().m;

        var pointInScreenCoords = MathL.TransformCoords(point, oldObjTransform);
        var pointInNewCoords = MathL.TransformCoords(pointInScreenCoords, MathL.InvertTransformMatrix(newObjTransform));

        return pointInNewCoords;
    }

    static TranslateVectorCoords(vector: PointF, origCoordsObj: any, destCoordsObj: any) {
        var oldObjTransform = origCoordsObj.getAbsoluteTransform().m;
        var newObjTransform = destCoordsObj.getAbsoluteTransform().m;

        var vectorInScreenCoords = MathL.TransformVector(vector, oldObjTransform);
        var vectorInNewCoords = MathL.TransformVector(vectorInScreenCoords, MathL.InvertTransformMatrix(newObjTransform));

        return vectorInNewCoords;
    }


    static traverseContainer(container: any, action: any) {
        var shouldTerminate = action(container);
        if (container.getChildren == null || shouldTerminate) {
            return;
        }
        var children = container.getChildren();
        var tempChildren = children.slice();

        tempChildren.forEach(function (child: any) {
            ViewerHelper.traverseContainer(child, action);
        });
    }
    static hexToRgb(hex: any): any {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m: any, r: any, g: any, b: any) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }





    static CreateCircleWithCrossShape(stage: any, centerPoint: PointF, strokecolor: string, name: string, radius: number, drawOuterCircle: boolean, backgroundColor = 'transparent') {
        var circleCross = new Konva.Shape({
            x: centerPoint.x,
            y: centerPoint.y,
            drawOuterCircle: drawOuterCircle,
            sceneFunc: function (context) {
                context.beginPath();
                context.moveTo(radius, 0);
                context.lineTo(- radius, 0);
                context.moveTo(0, - radius);
                context.lineTo(0, radius);
                context.fillStrokeShape(this);
                if (this.getAttrs().drawOuterCircle == true) {
                    context.beginPath();
                    context.arc(0, 0, radius + 3, 0, 2 * Math.PI);
                    context.fillStrokeShape(this);
                    this.setAttr('width', (radius + 3) * 2);
                    this.setAttr('height', (radius + 3) * 2);
                    context.closePath();
                }
                else {
                    this.setAttr('width', radius * 2);
                    this.setAttr('height', radius * 2);
                }

                // KonvaJS specific context method

            },
            hitFunc: function (context) {
                context.beginPath();
                context.rect(-this.width() / 2, - this.height() / 2, this.width(), this.height());
                context.closePath();
                context.fillStrokeShape(this);
            },
            fill: backgroundColor,
            stroke: strokecolor,
            originalColor: strokecolor,
            name: name,
            strokeWidth: 2,
            shapeType: "circleCross",

        });
        return circleCross;
    }

    static getBoundingRect(group: any, excludeName: any, isRecursive = false): any {
        var children = group.getChildren();
        var c;
        var boundingRect = null;

        var first = true;
        for (var i = 0; i < children.length; i++) {
            c = children[i];
            var cBounds = null;
            if (c.nodeType == "Group") {
                cBounds = ViewerHelper.getBoundingRect(c, excludeName, true);
                if (cBounds != null)
                    cBounds = MathL.TranslateRectangleCoords(cBounds, c, group);
            }
            else if (c.getAttr('name') != excludeName && c.getAttr('name') != 'rotatehandle' && c.getAttr('name') != 'rotatehandleHitRegion' && c.getAttr('name') != 'rotatecenter' && c.getClassName() != 'Line') {
                cBounds = new RectangleF(0, 0, c.getWidth(), c.getHeight());
                cBounds = MathL.TranslateRectangleCoords(cBounds, c, group);
            }

            if (cBounds != null) {
                if (boundingRect == null)
                    boundingRect = cBounds;
                else
                    boundingRect = boundingRect.Union(cBounds)
            }
        }
        if (boundingRect == null && !isRecursive)
            boundingRect = new RectangleF(0, 0, 0, 0);
        return boundingRect;
    }

    //rotatePoint in absolute coords
    static rotate(group: any, rotatePoint: any, angle: any) {
        var anchorPointOldRectCoords = MathL.TransformCoords(rotatePoint, MathL.InvertTransformMatrix(group.getAbsoluteTransform().m));
        group.rotate(angle);
        var anchorPointNewRectCoords = MathL.TransformCoords(rotatePoint, MathL.InvertTransformMatrix(group.getAbsoluteTransform().m));
        ViewerHelper.MoveObjectPointToPoint(group, anchorPointOldRectCoords, anchorPointNewRectCoords);
    }

    static MoveObjectPointToPoint(object: any, objPoint_objCoords: any, moveToPoint_objCoords: any) {
        var movement = {
            x: moveToPoint_objCoords.x - objPoint_objCoords.x,
            y: moveToPoint_objCoords.y - objPoint_objCoords.y
        };
        var fixLayerCoords = MathL.TransformVector(movement, object.getTransform().m);
        object.move(fixLayerCoords);
    }

    static addRotateHandleAndBoundingRect(group: any, showBoundingRect: boolean) {
        var _lastLocation;
        var _this = this;
        var stage = group.getStage();
        var layer = group.getLayer();

        var handle: any, handleHitRegion: any;

        var rotateCenter = new Konva.Circle({
            radius: 8,
            draggable: false,
            stroke: '#ed145b',
            strokeWidth: 2,
            name: 'rotatecenter',
        });


        //var showBoundingRect = true; // for debug only
        var boundingRect = new Konva.Shape({

            stroke: '#FFFFFF',
            strokeWidth: 2,
            name: 'boundingRect',


            sceneFunc(canvas: any) {
                var boundingRect = ViewerHelper.getBoundingRect(group, 'boundingRect');
                var context = canvas._context;
                context.beginPath();
                if (showBoundingRect) {
                    context.rect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height);
                }
                context.closePath();
                canvas.strokeShape(this);


                if (handleHitRegion != null) {
                    var otherGroups = group.getAttr('otherGroupsForRotationHandleCalculation');
                    if (otherGroups != null) {
                        var groupsBounds: { Union: (arg0: any) => any; Inflate: (arg0: any) => any; } | null = null;
                        otherGroups.forEach((g: any) => {
                            var bounds = ViewerHelper.getBoundingRect(g, 'boundingRect');
                            bounds = MathL.TranslateRectangleCoords(bounds, g, group);
                            if (groupsBounds == null)
                                groupsBounds = bounds;
                            else
                                groupsBounds = groupsBounds.Union(bounds)
                        });

                        if (groupsBounds != null && boundingRect.Intersect(groupsBounds.Inflate(handle.getHeight())).height > 0.01) {
                            boundingRect = boundingRect.Union(groupsBounds)
                        }
                    }

                    var handleHeight = handle.getHeight();
                    var x = rotateCenter.x() - handle.getWidth() / 2;//boundingRect.x + (boundingRect.width - handle.getWidth()) / 2;
                    var y = boundingRect.y - handleHeight;
                    var lineLength = Math.abs(boundingRect.y - rotateCenter.getY())
                    var isTibial = this.getParent().getParent().attrs.shapeType == DTOImplantFamily.Tibial;

                    handleHitRegion.setX(rotateCenter.x());
                    if (isTibial)
                        handleHitRegion.setY(boundingRect.height + handleHeight * 1.5);// / 2
                    else
                        handleHitRegion.setY(y + handleHeight / 2);

                    context.beginPath();
                    context.moveTo(rotateCenter.x(), rotateCenter.y());

                    if (isTibial)
                        context.lineTo(handleHitRegion.x(), boundingRect.height + handleHeight);
                    else
                        context.lineTo(handleHitRegion.x(), handleHitRegion.getY() + handleHeight / 2);

                    context.closePath();
                    canvas.strokeShape(this);



                    handle.setX(x);
                    if (this.getParent().getParent().attrs.shapeType == DTOImplantFamily.Tibial)
                        handle.setY(boundingRect.y + boundingRect.height + handleHeight);
                    else
                        handle.setY(y);
                }

            },
        });

        group.add(boundingRect);
        group.add(rotateCenter);



        var rotatehandelIcon = new Image();
        rotatehandelIcon.onload = function () {
            let prevRotationEvent: any;
            //var handle = new Konva.Path({
            //    data: 'M50.605,27.683l4.684-4.685H42.557v12.733l4.648-4.649c2.17,2.333,3.371,5.345,3.371,8.548c0,3.359-1.309,6.517-3.684,8.893c - 4.902,4.902-12.881,4.902-17.785,0c - 2.375 - 2.375 - 3.684 - 5.533 - 3.684 - 8.893s1.309 - 6.518,3.684-8.893l-3.391 - 3.392c-3.281,3.281-5.09,7.645-5.09,12.284c0,4.641,1.809,9.003,5.09,12.284S33.359,57.002,38,57.002s9.004-1.807,12.283-5.088c3.283 - 3.281,5.09-7.644,5.09-12.284C55.373,35.146,53.682,30.923,50.605,27.683z',
            //    fill: 'white',
            //    name: 'rotatehandle',
            //    strokeWidth: 4,


            //});
            handle = new Konva.Image({
                name: 'rotatehandle',
                image: rotatehandelIcon,
                width: 70,
                strokeWidth: 0,
                draggable: true,

            });

            group.add(handle);

            handleHitRegion = new Konva.Circle({
                stroke: "transparent",
                strokeWidth: 5,
                radius: 35,
                name: 'rotatehandleHitRegion',
                draggable: true,

            });

            group.add(handleHitRegion);



            handleHitRegion.on("dragmove touchmove", (e: any) => {
                var disableRotate = group.getAttr('disableRotate');
                if (!disableRotate) {
                    handle.setX(handleHitRegion.getX());
                    handle.setY(handleHitRegion.getY());

                    var angleToMouse = ViewerHelper.claculateRotationAngleByMouseLocation(rotateCenter, prevRotationEvent, e);
                    prevRotationEvent = e;
                    console.log('angleToMouse ' + angleToMouse);
                    if (angleToMouse) {
                        var rotatePoint_groupCoords = MathL.TransformCoords({ x: 0, y: 0 }, rotateCenter.getAbsoluteTransform().m);
                        ViewerHelper.rotate(group, rotatePoint_groupCoords, angleToMouse);
                    }
                }
            });
            handleHitRegion.on("mousedown touchstart", (e: any) => {
                var disableRotate = group.getAttr('disableRotate');
                if (!disableRotate) {

                    handle.setX(handleHitRegion.getX());
                    handle.setY(handleHitRegion.getY());
                    handle.moveToTop();
                    handleHitRegion.moveToTop();
                    prevRotationEvent = e;
                }
            });
            handleHitRegion.on("dragend touchend", () => {
                let disableRotate = group.getAttr('disableRotate');
                if (!disableRotate) {

                    handle.setX(handleHitRegion.getX());
                    handle.setY(handleHitRegion.getY());
                    document.body.style.cursor = 'default';
                    layer.batchDraw();
                }
            });
            // add hover styling
            handleHitRegion.on("mouseover touchstart", () => {
                var disableRotate = group.getAttr('disableRotate');
                if (!disableRotate) {
                    let layer = handleHitRegion.getLayer();
                    document.body.style.cursor = 'w-resize';
                    handleHitRegion.setStroke('#1fb6fc');
                    layer.batchDraw();
                }
            });
            handleHitRegion.on("mouseout touchend", () => {
                var disableRotate = group.getAttr('disableRotate');
                if (!disableRotate) {
                    var layer = handleHitRegion.getLayer();
                    document.body.style.cursor = "default";
                    handleHitRegion.setStroke('transparent');
                    layer.batchDraw();
                }
            });



        };
        (<any>rotatehandelIcon).crossOrigin = "anonymous";
        rotatehandelIcon.src = "Images/rotate.png";




    }

    static claculateRotationAngleByMouseLocation = function (rotateCenter, prevRotationEvent, mouseEvent) {
        var m = rotateCenter.getAbsoluteTransform().m;
        var anchorPoint = MathL.TransformCoords({ x: 0, y: 0 }, m);
        //take care of PC touch 
        //if (mouseEvent.evt.layerX && mouseEvent.evt.layerY) {
        //	var oldlocation = { x: prevRotationEvent.evt.layerX, y: prevRotationEvent.evt.layerY };
        //	var newlocation = { x: mouseEvent.evt.layerX, y: mouseEvent.evt.layerY };
        //} else {
        var oldlocation = ViewerHelper.getOffset(prevRotationEvent.evt);
        var newlocation = ViewerHelper.getOffset(mouseEvent.evt);
        //}

        // var oldlocation = { x: prevRotationEvent.evt.layerX, y: prevRotationEvent.evt.layerY };
        // var newlocation = { x: mouseEvent.evt.layerX, y: mouseEvent.evt.layerY };
        var angle = ViewerHelper.calculateAngle(oldlocation, newlocation, anchorPoint);


        return angle;
    }
    //take care of PC touch 
    static getOffset = function (evt) {
        var el = evt.target,
            x: any = 0,
            y: any = 0;

        if (evt.layerX && evt.layerY) {
            x = evt.layerX;
            y = evt.layerY;

        } else {

            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                x += el.offsetLeft - el.scrollLeft;
                y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            if (evt.type.indexOf("touch") != -1) {
                x = evt.touches[0].clientX - x;
                y = evt.touches[0].clientY - y;
            } else {
                x = evt.clientX - x;
                y = evt.clientY - y;
            }
        }

        return { x: x, y: y };
    }




    static calculateAngle = function (p1: PointF, p2: PointF, center: PointF) {
        var theta1 = Math.atan2((p1.y - center.y), (p1.x - center.x));
        var theta2 = Math.atan2((p2.y - center.y), (p2.x - center.x));
        var angleDegree = (theta2 - theta1) * 180 / Math.PI;
        return angleDegree;
    }


    static getDistance = function (p1: any, p2: any): number {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
    }

    static addConnectingLine = function (group: any, name: string) {
        var stage = group.getStage();
        var layer = group.getLayer();
        var _this = this;

        var connectingLine = new Konva.Line({
            stroke: name === 'angleLine' ? "#FFFF66" : '#ed145b',
            name: name,
            strokeWidth: 1,
            draggable: false,
            shapeType: 'connectingLine',
            originalColor: name === 'angleLine' ? "#FFFF66" : '#ed145b'
        });

        var connectingLineHitRegion = new Konva.Line({
            stroke: 'transparent',
            name: name + 'HitRegion',
            strokeWidth: 34,
            draggable: false,
            shapeType: 'connectingLineHitRegion'
        });

        connectingLineHitRegion.on("mousedown touchstart", function () {

        });
        connectingLineHitRegion.on("dragend touchend", function () {

        });
        // add hover styling
        connectingLineHitRegion.on("mouseover touchstart", function () {
            var layer = this.getLayer();
            document.body.style.cursor = "pointer";
            //        connectingLine.setStroke('yellow');
            layer.batchDraw();
        });
        connectingLineHitRegion.on("mouseout touchend", function () {
            var layer = this.getLayer();
            document.body.style.cursor = "default";
            //       connectingLine.setStroke('red');
            layer.batchDraw();
        });
        group.add(connectingLine);
        group.add(connectingLineHitRegion);
        connectingLineHitRegion.moveToBottom();
        connectingLine.moveToBottom();
        return connectingLine;
    }

    static calcProjectedPointOnLine = function (line1, line2, point) {
        var lineVecor = line2.subV(line1);
        var pointVector = point.subV(line1);
        lineVecor.normalize();
        var len = lineVecor.dot(pointVector);
        var projectedPoint = line1.addV(lineVecor.mulS(len));
        return projectedPoint;
    }

    static CalcProjectionVector = function (vector, dirVec) {
        // assumed that dirVec is normalized!
        var len = MathL.DotProduct(vector, dirVec);
        var proj = MathL.Multiply(dirVec, len);
        return proj;
    }

    static moveLabel(label:any, newPosition: PointF) {
        var isLabelRepositionNotAllowed = label.getAttr('dragged') == null ? false : label.getAttr('dragged');
        if (!isLabelRepositionNotAllowed) {
            label.position(newPosition);
        }
    }

    static addLabelWithDirection(group:any, labelname:any, backgroundcolor:any, line:any, pointerDirection:any, originalFontSize = 14, opacity = 0.8, label = null, point = null, color = 'white') {
        return ViewerHelper.addLabel(group, labelname, backgroundcolor, line, originalFontSize, opacity, label, point, color, pointerDirection, 20)
    }

    static removeLabel(viewer: any, labelname: any, withLine: boolean) {
        var layer = viewer.segmentAndTemplatelayer;
        var label = layer.find('.' + labelname)[0];
        if (!label) return;
        if (withLine) {
            var connectingline = layer.find('.connectinglineToLabel').filter((line:any) => line.getAttr('label').name() == labelname)[0];
            if (connectingline) {
                connectingline.destroy()
            }

        }
        label.destroy();
        layer.draw();
    }

    static createLabel(viewer: any, labelname: any) {
        let layer = viewer.segmentAndTemplatelayer;
        let label = layer.find('.' + labelname)[0];
        let templateGroupList = layer.find('.templateGroup');
        if (templateGroupList.length > 0) {
            var cupsGroup = templateGroupList.filter((g: any) => g.getAttr('shapeType') == 'Cups')[0];
            if (cupsGroup) {
                ViewerHelper.traverseContainer(cupsGroup, function (child: any) {
                    if (child.getAttr('cupVec') != null) {
                        if (!label) {
                            HipToolsViewer.initInclanationLabel(viewer, child);
                        } else {
                            HipToolsViewer.recalculateInclinationLabel(viewer, child);
                        }
                        layer.draw();
                    }
                })
            }
        }
    }

    static toggleShowHideLabel(viewer: any, labelname: string, withline: boolean) {
        let layer = viewer.segmentAndTemplatelayer;
        let label = layer.find('.' + labelname)[0];
        if (label) {

            ViewerHelper.removeLabel(viewer, labelname, withline);
            //layer.draw();
        } else {
            var templateGroupList = layer.find('.templateGroup');
            if (templateGroupList.length > 0) {
                var cupsGroup = templateGroupList.filter((g: any) => g.getAttr('shapeType') == 'Cups')[0];
                if (cupsGroup) {
                    ViewerHelper.traverseContainer(cupsGroup, function (child: any) {
                        if (child.getAttr('cupVec') != null) HipToolsViewer.initInclanationLabel(viewer, child);
                        layer.draw();
                    })
                }
            }
        }
    }

    static addLabel(group: any, labelname: any, backgroundcolor: string, line: any, originalFontSize = 14, opacity = 0.8, label: any = null, point = null, color = 'white', pointerDirection = 'left', borderRadius = 20): any {
        var offsetY = 0;
        if (label === null) {
            label = new Konva.Label({
                name: labelname,
                draggable: true,
                enableDraggableIfNotSelected: true

            });
            //label.visible('inherit')
            label.add(new Konva.Tag({
                opacity: opacity,
                fill: backgroundcolor,
                //dmf: removed to help performance if need to add - add to label
                //shadowColor: 'black',
                //shadowBlur: 4,
                //shadowOffset: 5,
                //shadowOpacity: 0.5,
                visible: 'inherit',
                cornerRadius: borderRadius,
                pointerDirection: pointerDirection
            }));


            label.on("touchend", function (e: any) {
                label.setAttr('dragged', true);
                console.log('^!^!^!^!^!^!^!^!^!^!^!^!^!' + labelname + " touchend");
            });

            label.on("dragend", function (e: any) {
                label.setAttr('dragged', true);
                console.log('^!^!^!^!^!^!^!^!^!^!^!^!^!' + labelname + "dragend");
            });

            //        label.on("click tap", function () {
            //            //label.setAttr('dragged', false);
            //console.log('label click tap!');
            //        });
            //both click and dblclick doesnot work in IE
            label.on("dblclick dbltap", function (e: any) {
                //TODO: remove logs
                console.log('label on dblclick dbltap!');
                console.log(e.currentTarget);
                var labelDblClickFunc = e.currentTarget.getAttr("doubleClickFunc");
                if (labelDblClickFunc) {
                    labelDblClickFunc(e.currentTarget);
                }
            });
            group.add(label);

            if (line != null || point != null) {
                var connectingLine = new Konva.Line({
                    stroke: 'white',
                    strokeWidth: 1,
                    lineCap: 'round',
                    lineJoin: 'round',
                    name: 'connectinglineToLabel',
                    dash: [2, 2],
                    line: line,
                    point: point,
                    label: label
                });
                connectingLine.setVisible(false);

                group.add(connectingLine);

            }

        }
        else {

            var prevText = label.find('Text')[0];
            if (prevText != null) {
                offsetY = prevText.getHeight() + prevText.y() + 20;
                originalFontSize = prevText.getAttr('originalFontSize');
            }
        }


        var text = new Konva.Text({
            fontSize: originalFontSize,
            originalFontSize: originalFontSize,
            originalPadding: 4,
            fontFamily: 'Arial',
            fill: color,
            name: labelname + 'Text',
            padding: 4,
            y: offsetY
        });
        text.visible('inherit');
        label.add(text);


        return label;
    }


    static calculateLineCenterPoint(connectingLine: any): PointF {
        var midX = (connectingLine.points()[0] + connectingLine.points()[2]) / 2;
        var midY = (connectingLine.points()[1] + connectingLine.points()[3]) / 2;
        return new PointF(midX, midY);
    }

    static calculateLineLength = function (connectingLine: any): number {
        var x1 = connectingLine.getPoints()[0];
        var y1 = connectingLine.getPoints()[1];
        var x2 = connectingLine.getPoints()[2];
        var y2 = connectingLine.getPoints()[3];

        var distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        distance = Math.round(distance * 100 / 1) / 100;
        return distance;
    }

    static GetClosestContainer = function (shape: any) {
        if (shape == null) {
            return null;
        }
        try {
            while ((shape.nodeType != "Group" || (shape.nodeType == "Group" && shape.className == "Label"))
                && shape.nodeType != "Layer"
                && shape.nodeType != "Stage") {
                shape = shape.parent;
            }
            return shape;
        } catch (err) { //check if compiles to work in IE
            //console.error("GetClosestContainer ERROR")
            console.log(err);
            console.log(shape);
            return null;
        }
    }

    static GetObjectLocation(object: any): any {
        return new Vec2(object.getX(), object.getY());
    }

    static SetObjectLocation(object: any, loc: any): void {
        object.setX(loc.x);
        object.setY(loc.y);
    }

    static SetAnchorLocation = function (anchor: any, loc: any): void {
        ViewerHelper.SetObjectLocation(anchor, loc);
        var hitRegion = anchor.parent.find('.' + anchor.getName() + 'HitRegion')[0];
        ViewerHelper.SetObjectLocation(hitRegion, loc);
    }

}