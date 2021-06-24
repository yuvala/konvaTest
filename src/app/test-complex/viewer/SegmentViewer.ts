//// <reference path="../Declaretions.ts" />

'use strict';

import { ViewerHelper } from "./ViewerHelper";


interface ISegmentViewer {
    IsSegmentExists(): boolean;

    SetSegment(segmentPath: PointF[]): void;

    SetSegmentFromSWIP(segmentData: SegmentSWIPData): void;

}

class SegmentViewer implements ISegmentViewer {
    static BlackPolygonShapeName = 'blackPoly';
    static SegmentPolygonShapeName = 'segmentPolygon';
    static DraggableSegmentGroupName = 'draggableSegmentGroup';

    private viewer;
    // Constructor
    constructor(viewer: IViewer) {
        this.viewer = viewer;
    }


    IsSegmentExists = function () {
        return this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0] != null;
    }

    SetSegment = function (segmentPath: PointF[]) {
        if (segmentPath == null)
        {
            return;
            //  var segmentPath = [100, 192, 873, 160, 840, 523, 850, 309, 199, 639, 42, 693];
            // segmentPath = [{ x: 100, y: 192 }, { x: 873, y: 160 }, { x: 840, y: 523 }, { x: 850, y: 309 }, { x: 639, y: 42 }]
        }
        var _this = this;
        if (this.viewer.stage == null) {
            this.viewer.InitStage();
        }
        var dicomimg = _this.viewer.stage.find('.dicomimg')[0];
        if (dicomimg == null)
        {
            _this.viewer.postImageOperationsQueue.push(function () { _this.SetSegment(segmentPath); });
            return;
        }

        function getSWIP(container) {
            var imglayer = container.getStage().find('.imglayer')[0];
            var layer = container.getLayer();
            var viewer = container.getAttr('viewer');
            var blackPoly = layer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];
            var segmentPolygon = container.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
            var rotationAngle = MathL.CalcRotationMatrixAngle(segmentPolygon.getAbsoluteTransform().m);
            var blackPolyPoints = blackPoly.getPoints();
            var segmentPolyPoints = segmentPolygon.getPoints();

            if (!(blackPolyPoints || segmentPolyPoints)) {
                return null;
            }
           
            var blackPolyPointsImageCoords = [];
            for (var i = 0; i < blackPolyPoints.length; i++) {
                var blackPolyPointImageCoords = ViewerHelper.TranslatePointCoords(new PointF(blackPolyPoints[i], blackPolyPoints[++i]), layer, imglayer);
                blackPolyPointsImageCoords.push(blackPolyPointImageCoords);
            }

            var firstPointInSegmentPolygonImageCoords = ViewerHelper.TranslatePointCoords(new PointF(segmentPolyPoints[0], segmentPolyPoints[1]), container, imglayer);

            var rotateCenter = container.find('.rotatecenter')[0];
            var rotationCenterImageCoords = ViewerHelper.TranslatePointCoords(new PointF(rotateCenter.getX(), rotateCenter.getY()), container, imglayer);           

            var segmentData = {
                shapeType: "Segment",
                shapeName: SegmentViewer.SegmentPolygonShapeName,
                isVisible: container.isVisible(),
                segmentRotationAngle: rotationAngle,
                blackSegmentPoints: blackPolyPointsImageCoords,
                segmentRotationPoint: rotationCenterImageCoords,
                segmentFirstPointLocation: firstPointInSegmentPolygonImageCoords
            }

            return segmentData;
        }


        var draggableSegmentGroup = new Konva.Group({
            name: SegmentViewer.DraggableSegmentGroupName,
            draggable: false,
            disableRotate: true,
            disableDragging: true,
            allowDragingSubAnchors: true,
            mustStayBehind: true,
            attachedAnchors: [],
            viewer: _this.viewer,
            getSWIP: getSWIP
        });

        this.viewer.segmentAndTemplatelayer.add(draggableSegmentGroup);


        var anchors = [];
        segmentPath.forEach(p => anchors.push(Viewer.addAnchor(draggableSegmentGroup, p.x, p.y, "segmentAnchor", SegmentViewer.connectPolygon, anchors, segmetnDragendCallback)));
        SegmentViewer.connectPolygon(draggableSegmentGroup, anchors);
        var viewer = this.viewer;
        function segmetnDragendCallback() {
            if (!HipToolsViewer.AreTemplatesAttached(viewer)) {
                return;
            }
       //     SegmentViewer.CacheSegment(draggableSegmentGroup);
        }
    }

    SetSegmentFromSWIP = function (segmentSwipItem: any) {
        var _this = this;
        var sSegmentData = JSON.stringify(segmentSwipItem);
        var segmentSwipData: SegmentSWIPData = JSON.parse(sSegmentData);
        _this.SetSegment(segmentSwipData.blackSegmentPoints);
        _this.SetSegmentPositionOnSwip(segmentSwipData.segmentRotationAngle, segmentSwipData.segmentFirstPointLocation/*, _this.viewer*/);
    }

    SetSegmentPositionOnSwip = function (segmentRotationAngle: number ,segmentFirstPointLocation: PointF) {
        var _this = this;
        var viewer = _this.viewer;
        var draggableSegmentGroup = viewer.segmentAndTemplatelayer.find("." + SegmentViewer.DraggableSegmentGroupName)[0];
        var imglayer = draggableSegmentGroup.getStage().find('.imglayer')[0];

        SegmentViewer.SetSegmentFill(draggableSegmentGroup, true);
        
        draggableSegmentGroup.setRotation(segmentRotationAngle);
        var segmentPolygon = draggableSegmentGroup.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
        var segmentPolyPoints = segmentPolygon.getPoints();
        var origLocationGroupCoords = new PointF(segmentPolyPoints[0], segmentPolyPoints[1]);
        var destLocationGroupCoords = ViewerHelper.TranslatePointCoords(segmentFirstPointLocation, imglayer, draggableSegmentGroup);

        ViewerHelper.MoveObjectPointToPoint(draggableSegmentGroup, origLocationGroupCoords, destLocationGroupCoords);

        viewer.segmentAndTemplatelayer.draw();
        viewer.stage.draw();
    }
/*
    static CacheSegment(draggableSegmentGroup) {
        var stage = draggableSegmentGroup.getStage();
        var layer = draggableSegmentGroup.getLayer();
        var blackPoly = layer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];
        var segmentPolygon = draggableSegmentGroup.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];

        var points = segmentPolygon.getPoints();
        var PointFPoints = [];
        for (var p = 0; p < points.length; p += 2) {
            PointFPoints.push(new PointF(points[p], points[p + 1]));
        }
        var poliBounds = MathL.GetBoundingRect(PointFPoints);
        var margins = 10 / stage.getScale().x;
        //blackPoly.cache({
        //    points: points,
        //    x: poliBounds.x - margins,
        //    y: poliBounds.y - margins,
        //    width: poliBounds.width + margins * 2,
        //    height: poliBounds.height + margins * 2
        //}).offset({ x: -poliBounds.x + margins, y: -poliBounds.y + margins });
 //       segmentPolygon.cache({
  //          points: points,
 //           x: poliBounds.x - margins,
 //           y: poliBounds.y - margins,
 //           width: poliBounds.width + margins * 2,
//            height: poliBounds.height + margins * 2
 //       }).offset({ x: -poliBounds.x + margins, y: -poliBounds.y + margins });
 //       segmentPolygon.drawHitFromCache();
   
        layer.drawHit();
    }
*/
    static connectPolygon = function (group, anchors) {
        
        var stage = group.getStage();
        var layer = group.getLayer();
        var viewer = group.getAttr('viewer');

        var blackPoly = layer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];
        var segmentPolygon = group.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];


        var isFirstTime = false;
        if (blackPoly == null) {
            isFirstTime = true;
            blackPoly = new Konva.Line({
                name: SegmentViewer.BlackPolygonShapeName,
                fill: 'black',
                fillEnabled: false,
                stroke: 'black',
                strokeWidth: viewer.Pixels2MM(1),
                closed: true
            });
            segmentPolygon = SegmentViewer.createPolygon(viewer, group, viewer.imageObj);
            layer.add(blackPoly);
            group.moveToBottom();
            segmentPolygon.moveToBottom();
            blackPoly.moveToBottom();
            ViewerHelper.addRotateHandleAndBoundingRect(group, false);
            var x = 0, y = 0;
            anchors.forEach(function (anchor) {
                x += anchor.getX();
                y += anchor.getY();
            });
            var rotatePoint = new PointF(x / anchors.length, y / anchors.length);
            var rotateCenter = group.find('.rotatecenter')[0];
            rotateCenter.setX(rotatePoint.x);
            rotateCenter.setY(rotatePoint.y);
        }/* else {
            //blackPoly.clearCache().offset({ x: 0, y: 0 });;
            segmentPolygon.clearCache().offset({ x: 0, y: 0 });
        }*/

        var segmentPath = [];

        anchors.forEach(a => {
            segmentPath.push(a.getX(), a.getY());
        });
        blackPoly.setPoints(segmentPath);
        segmentPolygon.setPoints(segmentPath);
/*
        if (isFirstTime) {
            SegmentViewer.CacheSegment(group);
        }
*/
        layer.batchDraw();
    };

    static SetSegmentFill = function (segmentGroup, showImage: boolean) {

        var stage = segmentGroup.getStage();
        var layer = segmentGroup.getLayer();

        var blackPoly = layer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];
        if (!blackPoly)
            return;

        var segmentPolygon = segmentGroup.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];


        if (showImage) {
            blackPoly.fillEnabled(true);
            segmentPolygon.setFillPriority('pattern');
         //   SegmentViewer.CacheSegment(segmentGroup);
        } else {
            blackPoly.fillEnabled(false);
            segmentPolygon.setFillPriority('color');
            //blackPoly.clearCache().offset({ x: 0, y: 0 });;
            segmentPolygon.clearCache().offset({ x: 0, y: 0 });
        }
    };

    static createPolygon(viewer, group, imageObj) {
        var stage = group.getStage();
        var shapeslayer = stage.find('.shapeslayer')[0];
        var segmentAndTemplatelayer = group.getLayer();


        var segmentPolygon = new Konva.Line({
            fillPatternImage: imageObj,
            fillPatternScaleX: viewer.originalImageWidth / viewer.actualImageWidth,
            fillPatternScaleY: viewer.originalImageHeight / viewer.actualImageHeight,
            fillPatternRepeat: "no-repeat",
            //dmf set custom stroke color light yellow 
           // strokeRed: 0,//247,
            //strokeGreen: 0,// 235,
            //strokeBlue: 0,  //191,
            originalColor: '#000000',//'f7ebbf',
            strokeWidth: viewer.Pixels2MM(1),
            name: SegmentViewer.SegmentPolygonShapeName,
            shapeType: SegmentViewer.SegmentPolygonShapeName,
            fill: 'rgba(0,0,0,0.005)',
            closed: true
        });

        group.add(segmentPolygon);


        group.on("dragmove", function () {


        });
		segmentPolygon.on("mousedown touchstart", function () {
			let shapes = shapeslayer.find('Circle');
            shapes.forEach((c:any)=> console.log(segmentPolygon.intersects(new Vec2(c.x(),c.y()))));

        });
        segmentPolygon.on("dragend touchend", function () {

        });
        // add hover styling
        segmentPolygon.on("mouseover touchstart", function () {
            var layer = this.getLayer();
            document.body.style.cursor = "pointer";

            layer.batchDraw();
        });
        segmentPolygon.on("mouseout touchend", function () {
            var layer = this.getLayer();
            document.body.style.cursor = "default";

            layer.batchDraw();
        });

        return segmentPolygon;
    }

    static OnSegmentMoveStart = function (SegmentGroup, shapeslayer) {
        var segmentPolygon = SegmentGroup.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
        var segmentPathFlat = segmentPolygon.getPoints();
        var segmentPath = [];

        for (var i = 1; i < segmentPathFlat.length; i += 2) {
            segmentPath.push(new PointF(segmentPathFlat[i - 1], segmentPathFlat[i]));
        }

		let attachedAnchors = [];
		let FemAxisGroup = null;
        ViewerHelper.traverseContainer(shapeslayer, function (child:any) {
			if (child.getAttr('shapeType') == 'Anchor') {
				

				var locInSegment = ViewerHelper.TranslatePointCoords(new PointF(0, 0), child, SegmentGroup);
				if (MathL.IsPointInPoligon(segmentPath, locInSegment)) {
				
					if (child.getParent().name() == CorToolViewer.FemAxisGroupName) {
						FemAxisGroup = child.getParent();
					}
						
						attachedAnchors.push({ anchor: child, locSegmentCoords: locInSegment });
					
				}
			}          
        });
		if (FemAxisGroup) attachedAnchors = CorToolViewer.GetAdditionalAnchorsInTheGroup(FemAxisGroup,SegmentGroup, shapeslayer, attachedAnchors);

        SegmentGroup.attachedAnchors = attachedAnchors;
    }

    static OnSegmentMoved = function (SegmentGroup) {
        SegmentGroup.attachedAnchors.forEach(function (anchorData) {

            var newLoc = ViewerHelper.TranslatePointCoords(anchorData.locSegmentCoords, SegmentGroup, anchorData.anchor.parent);
            anchorData.anchor.getAttr('MoveAnchorFunc')(newLoc);
        });
    }

   static OnSegmentMoveEnd = function (SegmentGroup) {
        SegmentGroup.attachedAnchors = [];
    }

}