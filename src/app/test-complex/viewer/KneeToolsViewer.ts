//// <reference path="../Declaretions.ts" />

'use strict';

import Konva from "konva";
import { ViewerHelper } from "./ViewerHelper";


interface IKneeToolsViewer {
    SetAPResectionLineTool(resectionLineTool: DTOAPResectionLineTool, typeName: string, strokeColor: string, isFemor: boolean, femorAxisAngle: number): void;
    SetShowResectionLine(show: boolean);
    IsResectionLineExists(isFemor?: boolean): boolean;
    GetAPResectionLineToolCondyles(isFemor: boolean): DTOAPResectionLineTool;
    LocateImplantOnImage(implantItem: DTOImplantItem, name: string, typeName: string, AutoKneeResults: DTOAutoKneeResult, isAP: boolean, isFemoral: boolean, isFirstTimeImplantLoaded: boolean)
    DettachAutoAlign(): void;
    IsAutoAligned(): void;
    AutoAlign(): void;
    GetTibialSegmentPoints(): PointF[]
    SetAPResectionLineToolFromSWIP(kneeSWIPItem: any): void;
    PrepareGetSWIP(): any;
    EndGetSWIP(connectionTransformData): void;
    UpdateOnSWIPAlign(segmentRotationAngle: number, sourcePoint: PointF, destPoint: PointF): void;
}

class KneeToolsViewer implements IKneeToolsViewer {
    static ResectionLineGroupName = 'resectionLineGroup';
    private viewer: IViewer;
    private femoralMainAPImplantData = null;
    private tibialMainAPImplantData = null;
    private isLoadingFromSWIP = false;

    // Constructor
    constructor(viewer: IViewer) {
        this.viewer = viewer;
    }

    SetAPResectionLineTool = function (resectionLineTool: DTOAPResectionLineTool, typeName: string, strokeColor: string, isFemor: boolean, femorAxisAngle: number) {
        var _this = this;
        var dicomimg = _this.viewer.stage.find('.dicomimg')[0];
        if (dicomimg == null) {
            _this.viewer.postImageOperationsQueue.push(function () { _this.SetResectionLineTool(resectionLineTool, strokeColor) });
            return;
        }

        var resectionLineGroup = _this.CreateResectionLineGroup(typeName, isFemor, femorAxisAngle);

        var anchor = _this.SetAnchors(resectionLineGroup, resectionLineTool, isFemor);

        KneeToolsViewer.connectResectionLineTool(resectionLineGroup, _this);

        KneeToolsViewer.setInitialResectionLineLevel(resectionLineGroup, _this)
        this.MoveResectionLineToImplant();
        this.viewer.SetCurrentSelected(anchor);

    }

    CreateResectionLineGroup = function (typeName: string, isFemor: boolean, femorAxisAngle: number) {
        var _this = this;

        var OnAfterDeleteResectionLineFunction = function (shapeName: string) {
            _this.viewer.RemoveShapeByName(KneeToolsViewer.ResectionLineGroupName);

            if (_this.tibialMainAPImplantData != null && _this.tibialMainAPImplantData.typeName != null) {
                var templateGroups = _this.viewer.segmentAndTemplatelayer.find('.templateGroup');
                var templateGroup = templateGroups.filter(g => g.getAttr('shapeType') == _this.tibialMainAPImplantData.typeName)[0];
                if (templateGroup != null) {
                    templateGroup.setAttr("disableRotate", false);
                    var templateItemPartGroups = templateGroup.find('.' + _this.tibialMainAPImplantData.name);
                    var templateItemPartGroup = templateItemPartGroups[0];
                    if (templateItemPartGroup != null && templateItemPartGroups.length == 1) {
                        templateItemPartGroup.setAttr("disableRotate", false);
                    }
                }
            }
            if (_this.femoralMainAPImplantData != null && _this.femoralMainAPImplantData.typeName != null) {
                var templateGroups = _this.viewer.segmentAndTemplatelayer.find('.templateGroup');
                var templateGroup = templateGroups.filter(g => g.getAttr('shapeType') == _this.femoralMainAPImplantData.typeName)[0];
                if (templateGroup != null) {
                    templateGroup.setAttr("disableRotate", false);
                    var templateItemPartGroups = templateGroup.find('.' + _this.femoralMainAPImplantData.name);
                    var templateItemPartGroup = templateItemPartGroups[0];
                    if (templateItemPartGroup != null && templateItemPartGroups.length == 1) {
                        templateItemPartGroup.setAttr("disableRotate", false);
                    }
                }
            }
        }

        function getReport(container): DTOMeasurmentToolInfo {
            if (!container.isVisible()) return null;

            var resectionLineToolInfo = new DTOMeasurmentToolInfo();

            var tipLeftProjectionLineLabel = container.find('.tipLeftProjectionLineLabel')[0];
            var tipLeftProjectionLinelabelTxt = tipLeftProjectionLineLabel.getText().text()
            var tipRightProjectionLineLabel = container.find('.tipRightProjectionLineLabel')[0];
            var tipRightProjectionLineLabelTxt = tipRightProjectionLineLabel.getText().text()
            var isLeftLeg = container.getAttr('isLeftLeg');
            //right leg
            var medialValue = tipRightProjectionLineLabelTxt;
            var lateralValue = tipLeftProjectionLinelabelTxt;
            //left leg
            if (isLeftLeg) {
                medialValue = tipLeftProjectionLinelabelTxt;
                lateralValue = tipRightProjectionLineLabelTxt;
            }


            var resectionHeightsMedial = new KeyValuePair('Medial Resection Height', medialValue);
            var resectionHeightsLateral = new KeyValuePair('Lateral Resection Height', lateralValue);

            if (container.getAttr('shapeType') == 'Femoral') {

                resectionLineToolInfo.ToolName = 'AP Femur Resection Measurements';

                var femAxisAngle = container.getAttr('axisAngle') + "\u00B0";

                //todo:? var femAnatomicalAnglePre = new KeyValuePair();
                var femAnatomicalAnglePost = new KeyValuePair('Femoral Anatomical Angle Post', femAxisAngle);

                resectionLineToolInfo.ToolValues = [resectionHeightsMedial, resectionHeightsLateral, femAnatomicalAnglePost];

            }
            if (container.getAttr('shapeType') == 'Tibial') {

                resectionLineToolInfo.ToolName = 'AP Tibial Resection Measurements';

                resectionLineToolInfo.ToolValues = [resectionHeightsMedial, resectionHeightsLateral]
            }
            return resectionLineToolInfo;
        }

        var resectionLineGroup = new Konva.Group({
            draggable: true,
            shapeType: typeName,
            name: KneeToolsViewer.ResectionLineGroupName,
            isLeftLeg: _this.viewer.imageOrientation.IsLeftBodyPart,
            isFemorCutting: isFemor,
            axisAngle: femorAxisAngle,
            onAfterDeleteFunction: OnAfterDeleteResectionLineFunction,
            getReport: getReport,
            getSWIP: this.getSWIP
        });

        this.viewer.segmentAndTemplatelayer.add(resectionLineGroup);

        resectionLineGroup.on("dragmove", function () {
            KneeToolsViewer.connectResectionLineTool_PartMoved(resectionLineGroup, _this);
        });

        return resectionLineGroup;
    }

    SetAnchors(resectionLineGroup:any, resectionLineTool: DTOAPResectionLineTool, isFemor: boolean) {
        var _this = this;

        var anchor =
            Viewer.addAnchor(resectionLineGroup, resectionLineTool.Condyle.TipLeft.x, resectionLineTool.Condyle.TipLeft.y, "tipLeft", KneeToolsViewer.connectResectionLineTool_PartMoved, _this);
        Viewer.addAnchor(resectionLineGroup, resectionLineTool.Condyle.TipRight.x, resectionLineTool.Condyle.TipRight.y, "tipRight", KneeToolsViewer.connectResectionLineTool_PartMoved, _this);
        Viewer.addAnchor(resectionLineGroup, resectionLineTool.Condyle.EdgeLeft.x, resectionLineTool.Condyle.EdgeLeft.y, "edgeLeft", KneeToolsViewer.connectResectionLineTool_leftEdgeMoved, _this);
        Viewer.addAnchor(resectionLineGroup, resectionLineTool.Condyle.EdgeRight.x, resectionLineTool.Condyle.EdgeRight.y, "edgeRight", KneeToolsViewer.connectResectionLineTool_rightEdgeMoved, _this);
        Viewer.addAnchor(resectionLineGroup, resectionLineTool.BoneAxis.BottomLeft.x, resectionLineTool.BoneAxis.BottomLeft.y, "BoneAxis_BottomLeft", KneeToolsViewer.connectResectionLineTool_PartMoved, _this);
        Viewer.addAnchor(resectionLineGroup, resectionLineTool.BoneAxis.BottomRight.x, resectionLineTool.BoneAxis.BottomRight.y, "BoneAxis_BottomRight", KneeToolsViewer.connectResectionLineTool_PartMoved, _this);
        Viewer.addAnchor(resectionLineGroup, resectionLineTool.BoneAxis.TopLeft.x, resectionLineTool.BoneAxis.TopLeft.y, "BoneAxis_TopLeft", KneeToolsViewer.connectResectionLineTool_PartMoved, _this);
        Viewer.addAnchor(resectionLineGroup, resectionLineTool.BoneAxis.TopRight.x, resectionLineTool.BoneAxis.TopRight.y, "BoneAxis_TopRight", KneeToolsViewer.connectResectionLineTool_PartMoved, _this);

        var topMiddlePt = MathL.GetMiddlePt(resectionLineTool.BoneAxis.TopLeft, resectionLineTool.BoneAxis.TopRight);
        var bottomMiddlePt = MathL.GetMiddlePt(resectionLineTool.BoneAxis.BottomLeft, resectionLineTool.BoneAxis.BottomRight);
        Viewer.addAnchor(resectionLineGroup, topMiddlePt.x, topMiddlePt.y, "BoneAxis_TopMiddle", KneeToolsViewer.connectResectionLineTool_topMidPointMoved, _this);
        Viewer.addAnchor(resectionLineGroup, bottomMiddlePt.x, bottomMiddlePt.y, "BoneAxis_BottomMiddle", KneeToolsViewer.connectResectionLineTool_bottomMidPointMoved, _this);

        if (isFemor) {
            Viewer.addAnchor(resectionLineGroup, 0, 0, "MechanicalAxisAngleHandler", KneeToolsViewer.connectResectionLineTool_AngleAnchorMoved, _this);
        }
        this.AddResectionLineConnectionLines(resectionLineGroup);

        KneeToolsViewer.connectResectionLineTool(resectionLineGroup, _this);

        return anchor;
    }

    AddResectionLineConnectionLines = function (group:any) {
        var isFemorCutting = group.getAttr('isFemorCutting');
        var isLeftLeg = group.getAttr('isLeftLeg');

        var BoneAxis_connectingLine = ViewerHelper.addConnectingLine(group, "BoneAxis_connectingLine");
        var BoneAxis_TopConnectingLine = ViewerHelper.addConnectingLine(group, "BoneAxis_TopConnectingLine");
        var BoneAxis_BottomConnectingLine = ViewerHelper.addConnectingLine(group, "BoneAxis_BottomConnectingLine");
        if (isFemorCutting) {
            var MechanicalAxisConnectingLine = ViewerHelper.addConnectingLine(group, "MechanicalAxisConnectingLine");
            MechanicalAxisConnectingLine.setAttr('strokeWidth', 1);
            MechanicalAxisConnectingLine.setAttr('originalColor', '#444');
        }

        var ResectionConnectingLine = ViewerHelper.addConnectingLine(group, "ResectionConnectingLine");
        ResectionConnectingLine.setAttr('originalColor', 'yellow');

        var PerpendicularRightCondyleConnectingLine = ViewerHelper.addConnectingLine(group, "PerpendicularRightCondyleConnectingLine");

        var PerpendicularLeftCondyleConnectingLine = ViewerHelper.addConnectingLine(group, "PerpendicularLeftCondyleConnectingLine");

        var tipLeftProjectionLineLabel = ViewerHelper.addLabelWithDirection(group, 'tipLeftProjectionLineLabel', PerpendicularLeftCondyleConnectingLine.getAttr('originalColor'), PerpendicularLeftCondyleConnectingLine, 'right');
        var tipRightProjectionLineLabel = ViewerHelper.addLabelWithDirection(group, 'tipRightProjectionLineLabel', PerpendicularRightCondyleConnectingLine.getAttr('originalColor'), PerpendicularRightCondyleConnectingLine, 'left');
        if (isFemorCutting) {
            var angleLableDir = isLeftLeg ? 'right' : 'left';
            var angleLineLabel = ViewerHelper.addLabelWithDirection(group, 'angleLineLabel', PerpendicularRightCondyleConnectingLine.getAttr('originalColor'), MechanicalAxisConnectingLine, angleLableDir);
            angleLineLabel.setAttr('doubleClickFunc', BasicToolsViewer.labelDoubleClickFunc);
        }



        tipLeftProjectionLineLabel.setAttr('doubleClickFunc', BasicToolsViewer.labelDoubleClickFunc);
        tipRightProjectionLineLabel.setAttr('doubleClickFunc', BasicToolsViewer.labelDoubleClickFunc);


        var tipRightProjection = new Konva.Circle({
            fill: 'cyan',
            name: 'tipRightProjection',
            draggable: false,
            radius: 1,
            stroke: 'purple',
            strokeWidth: 4
        });
        group.add(tipRightProjection);

        var tipLeftProjection = new Konva.Circle({
            fill: 'cyan',
            name: 'tipLeftProjection',
            draggable: false,
            radius: 1,
            stroke: 'purple',
            strokeWidth: 4

        });
        group.add(tipLeftProjection);

    }

    labelDoubleClickFunc = function (label) {
        //console.log("This label doubleclick function", label);
        var textNode = label.children[1];
        var group = label.parent;
        BasicToolsViewer.addEditLabelText(group, label.children[0], textNode);
    }




    GetAPResectionLineToolCondyles(isFemor: boolean): any {
        var theResetionLineToolGroup = this.viewer.segmentAndTemplatelayer.find('.' + KneeToolsViewer.ResectionLineGroupName).filter(r => r.getAttr('isFemorCutting') == isFemor)[0];
        if (theResetionLineToolGroup != null) {
            var tipRight = theResetionLineToolGroup.find('.tipRight')[0];
            var edgeRight = theResetionLineToolGroup.find('.edgeRight')[0];
            var tipLeft = theResetionLineToolGroup.find('.tipLeft')[0];
            var edgeLeft = theResetionLineToolGroup.find('.edgeLeft')[0];
            var resectionLineTool: DTOAPResectionLineTool = new DTOAPResectionLineTool();
            resectionLineTool.Condyle = new DTOAPKneeCondyleDetails();
            resectionLineTool.Condyle.EdgeLeft = ViewerHelper.TranslatePointCoords(new PointF(0, 0), edgeLeft, this.viewer.imglayer);
            resectionLineTool.Condyle.EdgeRight = ViewerHelper.TranslatePointCoords(new PointF(0, 0), edgeRight, this.viewer.imglayer);
            resectionLineTool.Condyle.TipLeft = ViewerHelper.TranslatePointCoords(new PointF(0, 0), tipLeft, this.viewer.imglayer);
            resectionLineTool.Condyle.TipRight = ViewerHelper.TranslatePointCoords(new PointF(0, 0), tipRight, this.viewer.imglayer);
            return resectionLineTool;
        }
        return null;
    }

    SetShowResectionLine(show: boolean) {
        (<IViewer>this.viewer).SetShowShapeByName(KneeToolsViewer.ResectionLineGroupName, show);
    }

    IsResectionLineExists(isFemor?: boolean) {
        if (isFemor == null) {
            return (<IViewer>this.viewer).IsShapeExists(KneeToolsViewer.ResectionLineGroupName);
        }
        var theResetionLineToolGroup = this.viewer.segmentAndTemplatelayer.find('.' + KneeToolsViewer.ResectionLineGroupName).filter(r => r.getAttr('isFemorCutting') == isFemor)[0];
        return theResetionLineToolGroup != null
    }

    DettachAutoAlign() {
        var _this = this;
        if (!_this.IsAutoAligned()) {
            return;
        }
        var tibialKneeAlignmentGroup = _this.viewer.segmentAndTemplatelayer.find('.tibialKneeAlignmentGroup')[0];
        var draggableSegmentGroup = tibialKneeAlignmentGroup.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
        var tibialTemplatesGroup = draggableSegmentGroup.find('.templateGroup')[0];
        var tibialResetionLineGroup = draggableSegmentGroup.find('.' + KneeToolsViewer.ResectionLineGroupName)[0];
        var femoralTemplatesGroup = this.viewer.segmentAndTemplatelayer.find('.templateGroup').filter(t => t.getAttr('shapeType') == DTOImplantFamily.Femoral)[0];

        SegmentViewer.OnSegmentMoveStart(draggableSegmentGroup, _this.viewer.shapeslayer)

        tibialTemplatesGroup.moveTo(_this.viewer.segmentAndTemplatelayer);
        tibialResetionLineGroup.moveTo(_this.viewer.segmentAndTemplatelayer);
        draggableSegmentGroup.moveTo(_this.viewer.segmentAndTemplatelayer);
        draggableSegmentGroup.position({ x: 0, y: 0 });
        draggableSegmentGroup.rotation(0);

        SegmentViewer.OnSegmentMoved(draggableSegmentGroup);
        SegmentViewer.OnSegmentMoveEnd(draggableSegmentGroup);

        tibialKneeAlignmentGroup.destroy();

        draggableSegmentGroup.setAttr('disableDragging', true);
        draggableSegmentGroup.setAttr('allowDragingSubAnchors', true);
        draggableSegmentGroup.setAttr('disableRotate', true);
        SegmentViewer.SetSegmentFill(draggableSegmentGroup, false);

        _this.viewer.segmentAndTemplatelayer.draw();

        draggableSegmentGroup.setAttr('onBeforeDeleteFunction', null);
        tibialResetionLineGroup.setAttr('onBeforeDeleteFunction', null);
        tibialTemplatesGroup.setAttr('onBeforeDeleteChildFunction', null);
        femoralTemplatesGroup.setAttr('onBeforeDeleteChildFunction', null);

        var blackPoly = this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];
        draggableSegmentGroup.moveToBottom();
        if (blackPoly)
            blackPoly.moveToBottom();
    }

    IsAutoAligned(): any {
        return this.viewer.IsShapeExists('tibialKneeAlignmentGroup');
    }

    AutoAlign() {
        var _this = this;
        if (_this.IsAutoAligned()) {
            return;
        }
        var draggableSegmentGroup = this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
        var tibialTemplatesGroup = this.viewer.segmentAndTemplatelayer.find('.templateGroup').filter(t => t.getAttr('shapeType') == DTOImplantFamily.Tibial)[0];
        var tibialResetionLineGroup = this.viewer.segmentAndTemplatelayer.find('.' + KneeToolsViewer.ResectionLineGroupName).filter(r => r.getAttr('isFemorCutting') == false)[0];
        var femoralTemplatesGroup = this.viewer.segmentAndTemplatelayer.find('.templateGroup').filter(t => t.getAttr('shapeType') == DTOImplantFamily.Femoral)[0];

        if (draggableSegmentGroup == null || tibialTemplatesGroup == null || tibialResetionLineGroup == null || femoralTemplatesGroup == null) {
            return;
        }

        var tibialKneeAlignmentGroup = new Konva.Group({
            name: 'tibialKneeAlignmentGroup',
            draggable: true,
            enableDraggableIfNotSelected: true,
            disableDragging: false,
            mustStayBehind: true
        });
        this.viewer.segmentAndTemplatelayer.add(tibialKneeAlignmentGroup);

        ViewerHelper.MoveObjectToGroupKeepLocation(tibialKneeAlignmentGroup, draggableSegmentGroup);
        ViewerHelper.MoveObjectToGroupKeepLocation(draggableSegmentGroup, tibialTemplatesGroup);
        ViewerHelper.MoveObjectToGroupKeepLocation(draggableSegmentGroup, tibialResetionLineGroup);
        SegmentViewer.SetSegmentFill(draggableSegmentGroup, true);
        draggableSegmentGroup.setAttr('allowDragingSubAnchors', false);
        draggableSegmentGroup.setAttr('disableRotate', false);
        draggableSegmentGroup.moveToBottom();

        tibialKneeAlignmentGroup.on("mousedown touchstart", function () {
            SegmentViewer.OnSegmentMoveStart(draggableSegmentGroup, _this.viewer.shapeslayer);
        });
        tibialKneeAlignmentGroup.on("dragmove touchmove", function () {
            SegmentViewer.OnSegmentMoved(draggableSegmentGroup);
        });
        tibialKneeAlignmentGroup.on("dragend touchend", function () {
            SegmentViewer.OnSegmentMoveEnd(draggableSegmentGroup);
        });

        if (!_this.isLoadingFromSWIP) {
            SegmentViewer.OnSegmentMoveStart(draggableSegmentGroup, _this.viewer.shapeslayer)

            var femoralImpLoc = this.GetTemplateLocation(femoralTemplatesGroup);
            var tibialImpLoc = this.GetTemplateLocation(tibialTemplatesGroup);
            var xAxis = femoralImpLoc.impXAxis;
            var yAxis = xAxis.getNormal();
            var origYDist = yAxis.dot(MathL.SubtractPoints(tibialImpLoc.rotAxisLocImg, femoralImpLoc.rotAxisLocImg));
            tibialKneeAlignmentGroup.rotation(femoralImpLoc.angle - tibialImpLoc.angle);
            var impDist = MathL.SubtractPoints(ViewerHelper.TranslatePointCoords(tibialImpLoc.rotAxisLocInTemplateGroup, tibialTemplatesGroup, this.viewer.segmentAndTemplatelayer), femoralImpLoc.rotAxisLocImg);
            tibialKneeAlignmentGroup.move(yAxis.mulS(-yAxis.dot(impDist) + origYDist));
            tibialKneeAlignmentGroup.move(xAxis.mulS(-xAxis.dot(impDist)));

            SegmentViewer.OnSegmentMoved(draggableSegmentGroup);
            SegmentViewer.OnSegmentMoveEnd(draggableSegmentGroup);
        }

        var OnBeforeDeleteAutoAllignedObjectFunction = function (shape:any) {
            _this.DettachAutoAlign();
        }
        draggableSegmentGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteAutoAllignedObjectFunction);
        tibialResetionLineGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteAutoAllignedObjectFunction);
        tibialKneeAlignmentGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteAutoAllignedObjectFunction);
        tibialTemplatesGroup.setAttr('onBeforeDeleteChildFunction', OnBeforeDeleteAutoAllignedObjectFunction);
        femoralTemplatesGroup.setAttr('onBeforeDeleteChildFunction', OnBeforeDeleteAutoAllignedObjectFunction);

        var blackPoly = this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];
        tibialKneeAlignmentGroup.moveToBottom();
        blackPoly.moveToBottom();

        draggableSegmentGroup.setAttr('otherGroupsForRotationHandleCalculation', [femoralTemplatesGroup]);
        _this.viewer.SetCurrentSelected(draggableSegmentGroup);
        _this.viewer.segmentAndTemplatelayer.draw();
    }


    GetTemplateLocation = function (templateGroup:any) {
        var templateItemPartGroup = templateGroup.children.filter(g => g.getAttr('shapeType') == 'templateItemPartGroup')[0];
        var rotAxis = templateItemPartGroup.find('.rotatecenter')[0];
        var rotAxisLocImg = ViewerHelper.TranslatePointCoords(new PointF(0, 0), rotAxis, this.viewer.segmentAndTemplatelayer);
        var rotAxisLocInTemplateGroup = ViewerHelper.TranslatePointCoords(new PointF(0, 0), rotAxis, templateGroup);

        var m = templateItemPartGroup.getAbsoluteTransform().m;
        var angle = Math.atan2(m[0], m[2]) * 180 / Math.PI;
        var impXAxis = new Vec2(m[0], -m[2]).normalize();

        return { angle: angle, impXAxis: impXAxis, rotAxisLocImg: rotAxisLocImg, rotAxisLocInTemplateGroup: rotAxisLocInTemplateGroup };
    }

    GetTibialSegmentPoints(): any {
        var points: PointF[];
        var theResetionLineToolGroups = this.viewer.segmentAndTemplatelayer.find('.' + KneeToolsViewer.ResectionLineGroupName);
        var tibialResectionLine = theResetionLineToolGroups.filter(r => r.getAttr('isFemorCutting') == false)[0];
        var femoralResectionLine = theResetionLineToolGroups.filter(r => r.getAttr('isFemorCutting') == true)[0];

        if (tibialResectionLine != null && femoralResectionLine != null) {
            var anchor = tibialResectionLine.find('.tipRight')[0];
            var tibialTipRight = ViewerHelper.TranslatePointCoords(new PointF(0, 0), anchor, this.viewer.imglayer);
            anchor = tibialResectionLine.find('.edgeRight')[0];
            var tibialEdgeRight = ViewerHelper.TranslatePointCoords(new PointF(0, 0), anchor, this.viewer.imglayer);
            anchor = tibialResectionLine.find('.tipLeft')[0];
            var tibialTipLeft = ViewerHelper.TranslatePointCoords(new PointF(0, 0), anchor, this.viewer.imglayer);
            anchor = tibialResectionLine.find('.edgeLeft')[0];
            var tibialEdgeLeft = ViewerHelper.TranslatePointCoords(new PointF(0, 0), anchor, this.viewer.imglayer);
            anchor = femoralResectionLine.find('.tipLeft')[0];
            var femoralTipLeft = ViewerHelper.TranslatePointCoords(new PointF(0, 0), anchor, this.viewer.imglayer);
            anchor = femoralResectionLine.find('.tipRight')[0];
            var femoralTipRight = ViewerHelper.TranslatePointCoords(new PointF(0, 0), anchor, this.viewer.imglayer);

            var tipLeft = MathL.Multiply(MathL.AddPoints(tibialTipLeft, femoralTipLeft), 0.5);
            var tipRight = MathL.Multiply(MathL.AddPoints(tibialTipRight, femoralTipRight), 0.5);

            var cutDir = MathL.SubtractPoints(tipLeft, tipRight).normalize();
            var imageBounds = new RectangleF(0, 0, this.viewer.originalImageWidth, this.viewer.originalImageHeight);

            if (MathL.IsPointInSquare(imageBounds, tipLeft) && MathL.IsPointInSquare(imageBounds, tipRight)) {
                if (tipLeft.x > tipRight.x) {
                    var tmp = tipLeft;
                    tipLeft = tipRight;
                    tipRight = tmp;
                }
                if (tibialEdgeLeft.x > tibialEdgeRight.x) {
                    var tmp = tibialEdgeLeft;
                    tibialEdgeLeft = tibialEdgeRight;
                    tibialEdgeRight = tmp;
                }
                if (cutDir.x < 0) {
                    cutDir = cutDir.mulS(-1);
                }
                var edgeLeft = cutDir.mulS(cutDir.dot(MathL.SubtractPoints(tibialEdgeLeft, tipLeft))).addV(tipLeft);
                var edgeRight = cutDir.mulS(cutDir.dot(MathL.SubtractPoints(tibialEdgeRight, tipRight))).addV(tipRight);
                var cutSize = cutDir.dot(MathL.SubtractPoints(edgeRight, edgeLeft));

                var imageEdgeRight = MathL.calcIntersectionWithRect(tipRight, cutDir, imageBounds);
                var imageEdgeLeft = MathL.calcIntersectionWithRect(tipLeft, cutDir.mulS(-1), imageBounds);

                var boundDistRight = Math.abs(cutDir.dot(MathL.SubtractPoints(imageEdgeRight, tibialEdgeRight)));
                var boundDistLeft = Math.abs(cutDir.dot(MathL.SubtractPoints(imageEdgeLeft, tibialEdgeLeft)));

                var edgeMaxDist = cutSize * 0.7;
                var rightEdgeOnBounds = boundDistRight <= edgeMaxDist;
                var leftEdgeOnBounds = boundDistLeft <= edgeMaxDist;
                var rightEdgeHalfDist = rightEdgeOnBounds ? boundDistRight / 2 : edgeMaxDist / 2;
                var leftEdgeHalfDist = leftEdgeOnBounds ? boundDistLeft / 2 : edgeMaxDist / 2;

                var topRight = MathL.AddPoints(edgeRight, cutDir.mulS(rightEdgeHalfDist));
                var topLeft = MathL.AddPoints(edgeLeft, cutDir.mulS(-leftEdgeHalfDist));
                var midRight = MathL.AddPoints(topRight, (new Vec2(1, 1)).mulS(rightEdgeHalfDist));
                var midLeft = MathL.AddPoints(topLeft, (new Vec2(-1, 1)).mulS(leftEdgeHalfDist));
                var lowRight = new PointF(midRight.x, imageBounds.height);
                var lowLeft = new PointF(midLeft.x, imageBounds.height);

                points = [topLeft, topRight, midRight, lowRight, lowLeft, midLeft];
            }
        }

        return points;
    }

    LocateImplantOnImage(implantItem: DTOImplantItem, name: string, typeName: string, autoKneeResults: DTOAutoKneeResult, isAP: boolean, isFemoral: boolean, isFirstTimeImplantLoaded: boolean) {

        var _this = this;
        if (implantItem.SpecialHiddenPoints.length > 0) {
            var templateGroups = _this.viewer.segmentAndTemplatelayer.find('.templateGroup');
            var templateGroup = templateGroups.filter((g: any) => g.getAttr('shapeType') == typeName)[0];
            if (templateGroup != null) {
                var templateItemPartGroups = templateGroup.find('.' + name);
                var templateItemPartGroup = templateItemPartGroups[0];
                if (templateItemPartGroup != null && templateItemPartGroups.length == 1) {
                    if (isAP) {
                        templateGroup.setAttr('onMoveFn', function () { _this.MoveResectionLineToImplant(isFemoral); });
                        var resectionLineData: DTOAPResectionLineTool = _this.GetAPResectionLineToolCondyles(isFemoral);
                        if (resectionLineData != null) {
                            templateGroup.setAttr("disableRotate", true);
                            templateItemPartGroup.setAttr("disableRotate", true);
                        }
                        if (isFemoral) {
                            this.femoralMainAPImplantData = { name: name, typeName: typeName, implantItem: implantItem };
                            if (resectionLineData == null && autoKneeResults != null) {
                                resectionLineData = (<DTOAutoKneeAPResult>autoKneeResults).FemorResectionLineTool;
                            }
                        }
                        else {  // tibial
                            this.tibialMainAPImplantData = { name: name, typeName: typeName };
                            if (resectionLineData == null && autoKneeResults != null) {
                                resectionLineData = (<DTOAutoKneeAPResult>autoKneeResults).TibiaResectionLineTool;
                            }
                        }
                        _this.LocateAPImplantOnResectionLine(implantItem, resectionLineData, templateItemPartGroup, isFemoral);
                    }
                    else if (isFemoral && isFirstTimeImplantLoaded) {
                        var autoKneeLatData = (<DTOAutoKneeLatResult>autoKneeResults);
                        if (autoKneeLatData != null && autoKneeLatData.FemurData != null && autoKneeLatData.FemurData.AnteriorLinePnt.x != 0) {
                            _this.LocateFemoralLatImplantOnImage(implantItem, autoKneeLatData.FemurData, templateItemPartGroup);
                        }
                    }
                }
            }
        }
    }

    //LocateAPImplantOnResectionLine_old = function (implantItem: DTOImplantItem, resectionLineData: DTOAPResectionLineTool, templateItemPartGroup, resectLevelPointName : string)
    //{
    //    // getting here, the template was already located roughly at the location and rotated to the right angle.
    //    //var latCondyleData = implantItem.SpecialHiddenPoints.filter(pt => pt.AttachmentPointName.toLowerCase() == "lat_condyle")[0];
    //    //var medCondyleData = implantItem.SpecialHiddenPoints.filter(pt => pt.AttachmentPointName.toLowerCase() == "med_condyle")[0];
    //    var resectionLevelData = KneeToolsViewer.GetImplantSpecialPoint(implantItem, resectLevelPointName);
    //    if (resectionLevelData != null) {
    //        var resectionLevelImpPt = ViewerHelper.TranslatePointCoords(resectionLevelData, templateItemPartGroup, this.viewer.imglayer);

    //        var resectLine = MathL.SubtractPoints(resectionLineData.Condyle.EdgeLeft, resectionLineData.Condyle.EdgeRight).normalize();
    //        var resectLineNormal = resectLine.getNormal();

    //        var resectionLineLevelPt = resectionLineData.Condyle.EdgeLeft;
    //        var resectionLevelDist = resectLineNormal.dot(MathL.SubtractPoints(resectionLineLevelPt, resectionLevelImpPt));

    //        var newLocation = MathL.AddPoints(resectionLevelImpPt, resectLineNormal.mulS(resectionLevelDist));
    //        var newLocImpCoords = ViewerHelper.TranslatePointCoords(newLocation, this.viewer.imglayer, templateItemPartGroup);
    //        ViewerHelper.MoveObjectPointToPoint(templateItemPartGroup, resectionLevelData, newLocImpCoords);
    //        templateItemPartGroup.getLayer().batchDraw();
    //    }
    //}

    LocateAPImplantOnResectionLine(implantItem: DTOImplantItem, resectionLineData: DTOAPResectionLineTool, templateItemPartGroup, isFemoral: boolean) {

        if (resectionLineData == null) {
            resectionLineData = this.GetAPResectionLineToolCondyles(isFemoral);
        }

        var impResectLevelPt1, impResectLevelPt2;
        if (isFemoral) {
            impResectLevelPt1 = KneeToolsViewer.GetImplantSpecialPoint(implantItem, "resect_level");
            impResectLevelPt2 = MathL.AddPoints(impResectLevelPt1, new Vec2(1, 0));
        }
        else {
            impResectLevelPt1 = KneeToolsViewer.GetImplantSpecialPoint(implantItem, "lat_line");
            impResectLevelPt2 = KneeToolsViewer.GetImplantSpecialPoint(implantItem, "med_line");
        }
        if (resectionLineData != null && resectionLineData.Condyle != null && resectionLineData.Condyle.EdgeLeft.y != 0 && impResectLevelPt1 != null && impResectLevelPt2 != null) {
            this.LocateAPImplantOnResectionLine_imp(implantItem, resectionLineData, templateItemPartGroup, impResectLevelPt1, impResectLevelPt2);
        }
    }

    LocateAPImplantOnResectionLine_imp(implantItem: DTOImplantItem, resectionLineData: DTOAPResectionLineTool, templateItemPartGroup, impResectLevelPt1, impResectLevelPt2) {
        if (impResectLevelPt1.x > impResectLevelPt2.x) {
            var tmp = impResectLevelPt1;
            impResectLevelPt1 = impResectLevelPt2;
            impResectLevelPt2 = tmp;
        }
        var resectionLevelImpPt1 = ViewerHelper.TranslatePointCoords(impResectLevelPt1, templateItemPartGroup, this.viewer.imglayer);
        var resectionLevelImpPt2 = ViewerHelper.TranslatePointCoords(impResectLevelPt2, templateItemPartGroup, this.viewer.imglayer);

        var resectLine = MathL.SubtractPoints(resectionLineData.Condyle.EdgeLeft, resectionLineData.Condyle.EdgeRight).normalize();
        var resectLineNormal = resectLine.getNormal();

        var resectionLineAngle = MathL.CalcVectorDirectionAngleNoFlip(resectLine);
        var implantAngle = MathL.CalcVectorDirectionAngle(MathL.SubtractPoints(resectionLevelImpPt2, resectionLevelImpPt1));

        this.MoveAlongAxisPointToPoint(templateItemPartGroup, MathL.GetMiddlePt(impResectLevelPt1, impResectLevelPt2), resectionLineData.Condyle.EdgeLeft, resectLineNormal);
        var rotateCenter = MathL.TransformCoords(MathL.GetMiddlePt(impResectLevelPt1, impResectLevelPt2), templateItemPartGroup.getAbsoluteTransform().m);
        ViewerHelper.rotate(templateItemPartGroup, rotateCenter, resectionLineAngle - implantAngle);
        this.MoveAlongAxisPointToPoint(templateItemPartGroup, MathL.GetMiddlePt(impResectLevelPt1, impResectLevelPt2), resectionLineData.Condyle.EdgeLeft, resectLineNormal);

        templateItemPartGroup.getLayer().batchDraw();
    }

    MoveAlongAxisPointToPoint(group: any, groupPt: any, destImgPt: any, movementAxis: any) {
        var groupPtOrig_ImgCoords = ViewerHelper.TranslatePointCoords(groupPt, group, this.viewer.imglayer);

        var resectionLevelDist = movementAxis.dot(MathL.SubtractPoints(destImgPt, groupPtOrig_ImgCoords));

        var newLocation = MathL.AddPoints(groupPtOrig_ImgCoords, movementAxis.mulS(resectionLevelDist));
        var newLocGroupCoords = ViewerHelper.TranslatePointCoords(newLocation, this.viewer.imglayer, group);
        ViewerHelper.MoveObjectPointToPoint(group, groupPt, newLocGroupCoords);
    }

    FindLocateAPImplantOnResectionLine(isFemoral: boolean) {
        var implantData = isFemoral ? this.femoralMainAPImplantData : this.tibialMainAPImplantData;

        if (implantData != null && implantData.name != null) {
            var templateGroups = this.viewer.segmentAndTemplatelayer.find('.templateGroup');
            var templateGroup = templateGroups.filter(g => g.getAttr('shapeType') == implantData.typeName)[0];
            if (templateGroup != null) {
                var templateItemPartGroups = templateGroup.find('.' + implantData.name);
                var templateItemPartGroup = templateItemPartGroups[0];
                if (templateItemPartGroup != null && templateItemPartGroups.length == 1) {
                    var implantItem = templateItemPartGroup.getAttr('implantItem');
                    if (implantItem != null) {
                        this.LocateAPImplantOnResectionLine(implantItem, null, templateItemPartGroup, isFemoral);
                    }
                }
            }
        }
    }

    static GetImplantSpecialPoint = function (implantItem: DTOImplantItem, PointName: string) {
        var pt = implantItem.SpecialHiddenPoints.filter(pt => pt.AttachmentPointName.toLowerCase().indexOf(PointName) > -1)[0];
        return (pt == null) ? null : pt.LocationImplantImageCoords;
    }

    GetTemplateItemPartGroupRotationCenter_imgCoords(templateItemPartGroup: any) {

        var rotAxis = templateItemPartGroup.find('.rotatecenter')[0];
        if (rotAxis != null) {
            return ViewerHelper.TranslatePointCoords(new PointF(0, 0), rotAxis, this.viewer.segmentAndTemplatelayer);
        }
        else {
            return ViewerHelper.TranslatePointCoords(new PointF(0, 0), templateItemPartGroup, this.viewer.segmentAndTemplatelayer);
        }
    }

    LocateFemoralLatImplantOnImage (implantItem: DTOImplantItem, kneeFemorLatData: DTOKneeLATFemurData, templateItemPartGroup) {
        // getting here, the template was already located roughly at the location and rotated to the right angle.
        var anteLinePtData = KneeToolsViewer.GetImplantSpecialPoint(implantItem, "ante_line_1");
        var distPtData = KneeToolsViewer.GetImplantSpecialPoint(implantItem, "dist_most");
        if (anteLinePtData != null && distPtData != null) {
            var impAnteLinePt = ViewerHelper.TranslatePointCoords(anteLinePtData, templateItemPartGroup, this.viewer.imglayer);
            var impDistPt = ViewerHelper.TranslatePointCoords(distPtData, templateItemPartGroup, this.viewer.imglayer);

            var anteLineDir = new Vec2(kneeFemorLatData.AnteriorLineDirection.x, kneeFemorLatData.AnteriorLineDirection.y).normalize();
            var anteLineNormal = anteLineDir.getNormal();

            var lineDirDiff = anteLineDir.mulS(anteLineDir.dot(MathL.SubtractPoints(kneeFemorLatData.DistalLinePnt, impDistPt)));
            var lineNormalDiff = anteLineNormal.mulS(anteLineNormal.dot(MathL.SubtractPoints(kneeFemorLatData.AnteriorLinePnt, impAnteLinePt)));

            var newLocation = lineNormalDiff.addV(lineDirDiff).addV(impAnteLinePt);
            var newLocImpCoords = ViewerHelper.TranslatePointCoords(newLocation, this.viewer.imglayer, templateItemPartGroup);
            ViewerHelper.MoveObjectPointToPoint(templateItemPartGroup, anteLinePtData, newLocImpCoords);
            templateItemPartGroup.getLayer().batchDraw();
        }
    }


    MoveResectionLineToImplant(isFemoral: boolean) {
        var implantData = isFemoral ? this.femoralMainAPImplantData : this.tibialMainAPImplantData;
        var theResetionLineToolGroup = this.viewer.segmentAndTemplatelayer.find('.' + KneeToolsViewer.ResectionLineGroupName).filter(r => r.getAttr('isFemorCutting') == isFemoral)[0];

        if (implantData != null && implantData.name != null && theResetionLineToolGroup != null) {

            var edgeRight = theResetionLineToolGroup.find('.edgeRight')[0];
            var edgeLeft = theResetionLineToolGroup.find('.edgeLeft')[0];
            //var edgeLeft_imgCoords = ViewerHelper.TranslatePointCoords(new PointF(0, 0), edgeLeft, this.viewer.imglayer);
            //var edgeRight_imgCoords = ViewerHelper.TranslatePointCoords(new PointF(0, 0), edgeRight, this.viewer.imglayer);
            var edgePt1 = ViewerHelper.GetObjectLocation(edgeRight);
            var edgePt2 = ViewerHelper.GetObjectLocation(edgeLeft);
            var axis = KneeToolsViewer.getAxis(theResetionLineToolGroup, true);

            var templateGroups = this.viewer.segmentAndTemplatelayer.find('.templateGroup');
            var templateGroup = templateGroups.filter(g => g.getAttr('shapeType') == implantData.typeName)[0];
            if (templateGroup != null) {
                templateGroup.setAttr("disableRotate", true);

                var templateItemPartGroups = templateGroup.find('.' + implantData.name);
                var templateItemPartGroup = templateItemPartGroups[0];
                if (templateItemPartGroup != null && templateItemPartGroups.length == 1) {
                    var implantItem = templateItemPartGroup.getAttr('implantItem');
                    if (implantItem != null) {
                        templateItemPartGroup.setAttr("disableRotate", true);
                        var impResectLevelPt;
                        if (isFemoral) {
                            impResectLevelPt = KneeToolsViewer.GetImplantSpecialPoint(implantItem, "resect_level");
                        } else {
                            impResectLevelPt = KneeToolsViewer.GetImplantSpecialPoint(implantItem, "lat_line");
                        }
                        //var resectionLevelImpPt_imgCoords = ViewerHelper.TranslatePointCoords(impResectLevelPt, templateItemPartGroup, this.viewer.imglayer);
                        var resectionLevelImpPt_lineCoords = ViewerHelper.TranslatePointCoords(impResectLevelPt, templateItemPartGroup, theResetionLineToolGroup);

                        var movement1 = MathL.SubtractPoints(resectionLevelImpPt_lineCoords, edgePt1).dot(axis);
                        var movement2 = MathL.SubtractPoints(resectionLevelImpPt_lineCoords, edgePt2).dot(axis);
                        edgePt1 = edgePt1.addV(axis.mulS(movement1));
                        edgePt2 = edgePt2.addV(axis.mulS(movement2));
                        ViewerHelper.SetAnchorLocation(edgeRight, edgePt1);
                        ViewerHelper.SetAnchorLocation(edgeLeft, edgePt2);

                        KneeToolsViewer.connectResectionLineTool_PartMoved(theResetionLineToolGroup, this);
                        this.FindLocateAPImplantOnResectionLine(isFemoral);
                    }
                }
            }
        }
    }

    PrepareGetSWIP  () {
        var _this = this;
        var connectionTransformData = new ConnectionTransformData();
        var isAligned = _this.IsAutoAligned();

        connectionTransformData.templatesAttached = isAligned;
        if (!isAligned) {
            return connectionTransformData;
        }


        var tibialKneeAlignmentGroup = _this.viewer.segmentAndTemplatelayer.find('.tibialKneeAlignmentGroup')[0];
        var draggableSegmentGroup = tibialKneeAlignmentGroup.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
        var imglayer = draggableSegmentGroup.getStage().find('.imglayer')[0];

        var tibialKneeAlignmentGroupMatrix = tibialKneeAlignmentGroup.getTransform().m;
        var draggableSegmentGroupMatrix = draggableSegmentGroup.getTransform().m;

        var draggableSegmentGroupFullMovementMatrix = MathL.MultiplyTransformMatrix(tibialKneeAlignmentGroupMatrix, draggableSegmentGroupMatrix);

        connectionTransformData.transformMatrix = draggableSegmentGroupFullMovementMatrix;

        var segmentPolygon = _this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
        var segmentPolyPoints = segmentPolygon.getPoints();
        var firstPointInSegmentPolygonB4DetachImageCoords = ViewerHelper.TranslatePointCoords(new PointF(segmentPolyPoints[0], segmentPolyPoints[1]), draggableSegmentGroup, imglayer);
        var rotationAngle = MathL.CalcRotationMatrixAngle(segmentPolygon.getAbsoluteTransform().m);

        //        _this.DettachAutoAlign();

        var segmentPolygon = _this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
        var segmentPolyPoints = segmentPolygon.getPoints();
        var firstPointInSegmentPolygonAfterDetachImageCoords = ViewerHelper.TranslatePointCoords(new PointF(segmentPolyPoints[0], segmentPolyPoints[1]), draggableSegmentGroup, imglayer);

        connectionTransformData.sourcePoint = firstPointInSegmentPolygonAfterDetachImageCoords;
        connectionTransformData.destPoint = firstPointInSegmentPolygonB4DetachImageCoords;
        connectionTransformData.segmentRotationAngle = rotationAngle;
        console.log("Original rotation angle = " + rotationAngle);
        console.log("SegmentPoint Used for Location = " + segmentPolyPoints[0] + "," + segmentPolyPoints[1]);
        console.log("firstPointInSegmentPolygonAfterDetachImageCoords = " + firstPointInSegmentPolygonAfterDetachImageCoords.x + "," + firstPointInSegmentPolygonAfterDetachImageCoords.y);
        console.log("firstPointInSegmentPolygonB4DetachImageCoords = " + firstPointInSegmentPolygonB4DetachImageCoords.x + "," + firstPointInSegmentPolygonB4DetachImageCoords.y);

        return connectionTransformData;
    }

    EndGetSWIP  (connectionTransformData: ConnectionTransformData) {

        var _this = this;

        if (!connectionTransformData.templatesAttached)
            return;

        //_this.UpdateOnSWIPAlign(connectionTransformData.segmentRotationAngle, connectionTransformData.sourcePoint, connectionTransformData.destPoint);
    }

    UpdateOnSWIPAlign  (segmentRotationAngle: number, sourcePoint: PointF, destPoint: PointF) {
        var _this = this;

        var draggableSegmentGroup = _this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
        var imglayer = draggableSegmentGroup.getStage().find('.imglayer')[0];
        var sourcePointGroupCoords = ViewerHelper.TranslatePointCoords(sourcePoint, imglayer, draggableSegmentGroup);
        console.log("sourcePointGroupCoords = " + sourcePointGroupCoords.x + "," + sourcePointGroupCoords.y);

        _this.isLoadingFromSWIP = true;
        _this.AutoAlign();
        _this.isLoadingFromSWIP = false;

        SegmentViewer.OnSegmentMoveStart(draggableSegmentGroup, _this.viewer.shapeslayer);

        var rotationCenter = draggableSegmentGroup.findOne('.rotatecenter');
        var rotationPoint_OuterCoords = MathL.TransformCoords({ x: rotationCenter.getX(), y: rotationCenter.getY() }, draggableSegmentGroup.getAbsoluteTransform().m);

        var currRotation = MathL.CalcRotationMatrixAngle(draggableSegmentGroup.getAbsoluteTransform().m);
        ViewerHelper.rotate(draggableSegmentGroup, rotationPoint_OuterCoords, segmentRotationAngle - currRotation);

        var destPointGroupCoords = ViewerHelper.TranslatePointCoords(destPoint, imglayer, draggableSegmentGroup);
        console.log("destPointGroupCoords = " + destPointGroupCoords.x + "," + destPointGroupCoords.y);

        ViewerHelper.MoveObjectPointToPoint(draggableSegmentGroup, sourcePointGroupCoords, destPointGroupCoords);

        SegmentViewer.OnSegmentMoved(draggableSegmentGroup);
        SegmentViewer.OnSegmentMoveEnd(draggableSegmentGroup);

        var destPointGroupCoordsAfterMove = ViewerHelper.TranslatePointCoords(destPoint, imglayer, draggableSegmentGroup);
        console.log("destPointGroupCoordsAfterMove = " + destPointGroupCoordsAfterMove.x + "," + destPointGroupCoordsAfterMove.y);
        var FinalPointImageCoords = ViewerHelper.TranslatePointCoords(sourcePointGroupCoords, draggableSegmentGroup, imglayer);
        console.log("FinalPointImageCoords = " + FinalPointImageCoords.x + "," + FinalPointImageCoords.y);

        _this.viewer.segmentAndTemplatelayer.draw();
        _this.viewer.stage.draw();
    }

    getSWIP(container: any) {
        var imglayer = container.getStage().find('.imglayer')[0];

        var tipRight = container.find('.tipRight')[0];
        var edgeRight = container.find('.edgeRight')[0];
        var tipLeft = container.find('.tipLeft')[0];
        var edgeLeft = container.find('.edgeLeft')[0];

        if (!(tipRight || edgeRight || tipLeft || edgeLeft)) {
            return null;
        }

        var BoneAxis_TopLeft = container.find('.BoneAxis_TopLeft')[0];
        var BoneAxis_TopRight = container.find('.BoneAxis_TopRight')[0];
        var BoneAxis_BottomRight = container.find('.BoneAxis_BottomRight')[0];
        var BoneAxis_BottomLeft = container.find('.BoneAxis_BottomLeft')[0];

        var tipRightImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: tipRight.getX(), y: tipRight.getY() }, container, imglayer);
        var tipLeftImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: tipLeft.getX(), y: tipLeft.getY() }, container, imglayer);
        var edgeRightImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: edgeRight.getX(), y: edgeRight.getY() }, container, imglayer);
        var edgeLeftImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: edgeLeft.getX(), y: edgeLeft.getY() }, container, imglayer);
        var BoneAxis_TopLeftImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: BoneAxis_TopLeft.getX(), y: BoneAxis_TopLeft.getY() }, container, imglayer);
        var BoneAxis_TopRightImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: BoneAxis_TopRight.getX(), y: BoneAxis_TopRight.getY() }, container, imglayer);
        var BoneAxis_BottomRightImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: BoneAxis_BottomRight.getX(), y: BoneAxis_BottomRight.getY() }, container, imglayer);
        var BoneAxis_BottomLeftImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: BoneAxis_BottomLeft.getX(), y: BoneAxis_BottomLeft.getY() }, container, imglayer);

        var tipRightProjectionLineLabel = container.find('.tipRightProjectionLineLabel')[0];
        var tipLeftProjectionLineLabel = container.find('.tipLeftProjectionLineLabel')[0];

        var labelText;
        var labelPositionImageCoords;
        var labelPositionContainerCoords;
        if (tipRightProjectionLineLabel) {
            labelText = tipRightProjectionLineLabel.getText().text();
            labelPositionContainerCoords = tipRightProjectionLineLabel.getPosition();
            labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
        }

        var tipRightProjectionLineLabelTool = {
            name: '.tipRightProjectionLineLabel',
            text: labelText,
            position: labelPositionImageCoords
        }

        if (tipLeftProjectionLineLabel) {
            labelText = tipLeftProjectionLineLabel.getText().text();
            labelPositionContainerCoords = tipLeftProjectionLineLabel.getPosition();
            labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
        }

        var tipLeftProjectionLineLabelTool = {
            name: '.tipLeftProjectionLineLabel',
            text: labelText,
            position: labelPositionImageCoords
        }

        var baseAPKneeCutting = {
            tipRightPoint: tipRightImageLayerCoords,
            tipLeftPoint: tipLeftImageLayerCoords,
            edgeRightPont: edgeRightImageLayerCoords,
            edgeLeftPoint: edgeLeftImageLayerCoords,
            boneAxisTopLeft: BoneAxis_TopLeftImageLayerCoords,
            boneAxisTopRight: BoneAxis_TopRightImageLayerCoords,
            boneAxisBottomRigh: BoneAxis_BottomRightImageLayerCoords,
            boneAxisBottomLeft: BoneAxis_BottomLeftImageLayerCoords,
            tipRightProjectionLineLabel: tipRightProjectionLineLabelTool,
            tipLeftProjectionLineLabel: tipLeftProjectionLineLabelTool
        }

        var kneeAPCuttingToolData;
        //if femoral
        var isFemorCutting = container.getAttr('isFemorCutting');
        if (isFemorCutting) {
            var mechanicalAxisAngleHandler = container.find('.MechanicalAxisAngleHandler')[0];
            var mechanicalAxisAngleHandlerImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: mechanicalAxisAngleHandler.getX(), y: mechanicalAxisAngleHandler.getY() }, container, imglayer);

            var axisAngle = container.getAttr('axisAngle');

            var angleLineLabel = container.find('.angleLineLabel')[0];
            if (angleLineLabel) {
                labelText = angleLineLabel.getText().text();
                labelPositionContainerCoords = angleLineLabel.getPosition();
                labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
            }

            var angleLineLabelTool = {
                name: '.angleLineLabel',
                text: labelText,
                position: labelPositionImageCoords
            }

            kneeAPCuttingToolData = {
                shapeType: 'Femoral',
                shapeName: KneeToolsViewer.ResectionLineGroupName,
                isVisible: container.isVisible(),
                baseAPKneeCutting: baseAPKneeCutting,
                femoralAxisAngle: axisAngle,
                angleLineLabel: angleLineLabelTool
            }
        }
        else {
            kneeAPCuttingToolData = {
                shapeType: 'Tibial',
                shapeName: KneeToolsViewer.ResectionLineGroupName,
                isVisible: container.isVisible(),
                baseAPKneeCutting: baseAPKneeCutting
            }
        }

        return kneeAPCuttingToolData;
    }

    SetAPResectionLineToolFromSWIP(kneeSWIPItem: any) {
        var _this = this;
        var sKneeSwipData = JSON.stringify(kneeSWIPItem);
        var isFemoral = false;
        var axisAngle: number = 0;
        var kneeCuttingComponent;
        if (kneeSWIPItem.shapeType.toUpperCase() === 'Femoral'.toUpperCase()) {
            isFemoral = true;
            var femoralComponentSwipData: KneeAPCuttingFemurSWIPData = JSON.parse(sKneeSwipData);
            axisAngle = femoralComponentSwipData.femoralAxisAngle;
            kneeCuttingComponent = femoralComponentSwipData;
        }
        else {
            var tibialComponentSwipData: KneeAPCuttingTibialSWIPData = JSON.parse(sKneeSwipData);
            kneeCuttingComponent = tibialComponentSwipData;
        }

        var boneAxisDetails: DTOBoneAxisDetails = new DTOBoneAxisDetails();
        boneAxisDetails.BottomLeft = kneeCuttingComponent.baseAPKneeCutting.boneAxisBottomLeft;
        boneAxisDetails.BottomRight = kneeCuttingComponent.baseAPKneeCutting.boneAxisBottomRigh;
        boneAxisDetails.TopLeft = kneeCuttingComponent.baseAPKneeCutting.boneAxisTopLeft;
        boneAxisDetails.TopRight = kneeCuttingComponent.baseAPKneeCutting.boneAxisTopRight;
        var kneeCondyleDetails: DTOAPKneeCondyleDetails = new DTOAPKneeCondyleDetails();
        kneeCondyleDetails.EdgeLeft = kneeCuttingComponent.baseAPKneeCutting.edgeLeftPoint;
        kneeCondyleDetails.EdgeRight = kneeCuttingComponent.baseAPKneeCutting.edgeRightPont;
        kneeCondyleDetails.TipLeft = kneeCuttingComponent.baseAPKneeCutting.tipLeftPoint;
        kneeCondyleDetails.TipRight = kneeCuttingComponent.baseAPKneeCutting.tipRightPoint;
        var apResectionLineTool: DTOAPResectionLineTool = new DTOAPResectionLineTool();
        apResectionLineTool.BoneAxis = boneAxisDetails;
        apResectionLineTool.Condyle = kneeCondyleDetails;

        var resectionLineGroup = _this.CreateResectionLineGroup(kneeCuttingComponent.shapeType, isFemoral, axisAngle);
        var anchor = _this.SetAnchors(resectionLineGroup, apResectionLineTool, isFemoral);

        KneeToolsViewer.connectResectionLineTool(resectionLineGroup, _this);

        this.viewer.SetCurrentSelected(anchor);

        BasicToolsViewer.UpdateLabelOnSwip(resectionLineGroup, kneeCuttingComponent.baseAPKneeCutting.tipRightProjectionLineLabel);
        BasicToolsViewer.UpdateLabelOnSwip(resectionLineGroup, kneeCuttingComponent.baseAPKneeCutting.tipLeftProjectionLineLabel);
        if (isFemoral)
            BasicToolsViewer.UpdateLabelOnSwip(resectionLineGroup, kneeCuttingComponent.angleLineLabel);

        _this.viewer.shapeslayer.drawScene();
    }

    static connectResectionLineTool = function (group, kneeToolsViewer) {
        var layer = group.getLayer();
        var stage = layer.getStage();
        var dicomimg = stage.find('.dicomimg')[0];
        var tipRight = group.find('.tipRight')[0];
        var edgeRight = group.find('.edgeRight')[0];
        var tipLeft = group.find('.tipLeft')[0];
        var edgeLeft = group.find('.edgeLeft')[0];

        var BoneAxis_TopLeft = group.find('.BoneAxis_TopLeft')[0];
        var BoneAxis_TopRight = group.find('.BoneAxis_TopRight')[0];
        var BoneAxis_BottomRight = group.find('.BoneAxis_BottomRight')[0];
        var BoneAxis_BottomLeft = group.find('.BoneAxis_BottomLeft')[0];

        var BoneAxis_TopMiddle = group.find('.BoneAxis_TopMiddle')[0];
        var BoneAxis_BottomMiddle = group.find('.BoneAxis_BottomMiddle')[0];
        var MechanicalAxisAngleHandler = group.find('.MechanicalAxisAngleHandler')[0];

        var BoneAxis_connectingLine = group.find('.BoneAxis_connectingLine')[0];
        var BoneAxis_TopConnectingLine = group.find('.BoneAxis_TopConnectingLine')[0];
        var BoneAxis_BottomConnectingLine = group.find('.BoneAxis_BottomConnectingLine')[0];

        var ResectionConnectingLine = group.find('.ResectionConnectingLine')[0];
        var MechanicalAxisConnectingLine = group.find('.MechanicalAxisConnectingLine')[0];

        var PerpendicularLeftCondyleConnectingLine = group.find('.PerpendicularLeftCondyleConnectingLine')[0];
        var PerpendicularRightCondyleConnectingLine = group.find('.PerpendicularRightCondyleConnectingLine')[0];
        var angleLineLabel = group.find('.angleLineLabel')[0];
        var tipLeftProjection = group.find('.tipLeftProjection')[0];
        var tipRightProjection = group.find('.tipRightProjection')[0];

        var tipLeftProjectionLineLabel = group.find('.tipLeftProjectionLineLabel')[0];
        var tipRightProjectionLineLabel = group.find('.tipRightProjectionLineLabel')[0];

        var isLeftLeg = group.getAttr('isLeftLeg');
        var midToLeftEdgeDist = group.getAttr('midToLeftEdgeDist');
        var midToRightEdgeDist = group.getAttr('midToRightEdgeDist');
        var isFemorCutting = group.getAttr('isFemorCutting');
        var axisAngle = group.getAttr('axisAngle');
        if (isLeftLeg)
            axisAngle = -axisAngle;

        var topRightPt = ViewerHelper.GetObjectLocation(BoneAxis_TopRight);
        var topLeftPt = ViewerHelper.GetObjectLocation(BoneAxis_TopLeft);
        var topMiddlePt = MathL.GetMiddlePt(topLeftPt, topRightPt);

        ViewerHelper.SetAnchorLocation(BoneAxis_TopMiddle, topMiddlePt);

        var bottomLeftPt = ViewerHelper.GetObjectLocation(BoneAxis_BottomLeft);
        var bottomRightPt = ViewerHelper.GetObjectLocation(BoneAxis_BottomRight);
        var bottomMiddlePt = MathL.GetMiddlePt(bottomLeftPt, bottomRightPt);
        ViewerHelper.SetAnchorLocation(BoneAxis_BottomMiddle, bottomMiddlePt);

        var edgePt1 = ViewerHelper.GetObjectLocation(edgeRight);
        var edgePt2 = ViewerHelper.GetObjectLocation(edgeLeft);
        var tipPt1 = ViewerHelper.GetObjectLocation(tipRight);
        var tipPt2 = ViewerHelper.GetObjectLocation(tipLeft);

        var jointMidPt = MathL.calcLinesIntersection(edgePt1, edgePt2, topMiddlePt, bottomMiddlePt);
        var boneAxis = new Vec2(topMiddlePt.x, topMiddlePt.y).subV(new Vec2(jointMidPt.x, jointMidPt.y)).normalize();
        var realAxis = boneAxis;
        if (isFemorCutting && axisAngle != 0) {
            realAxis = realAxis.rotateDegrees(axisAngle);
        }
        var axisNormal = realAxis.getNormal();

        if (midToLeftEdgeDist == null) {
            midToRightEdgeDist = new Vec2(edgePt1.x, edgePt1.y).subV(new Vec2(jointMidPt.x, jointMidPt.y)).dot(axisNormal);
            midToLeftEdgeDist = new Vec2(edgePt2.x, edgePt2.y).subV(new Vec2(jointMidPt.x, jointMidPt.y)).dot(axisNormal);

        }
        edgePt1 = new Vec2(jointMidPt.x, jointMidPt.y).addV(axisNormal.mulS(midToRightEdgeDist));
        edgePt2 = new Vec2(jointMidPt.x, jointMidPt.y).addV(axisNormal.mulS(midToLeftEdgeDist));
        ViewerHelper.SetAnchorLocation(edgeRight, edgePt1);
        ViewerHelper.SetAnchorLocation(edgeLeft, edgePt2);

        var projTip1 = ViewerHelper.calcProjectedPointOnLine(edgePt1, edgePt2, tipPt1);
        var projTip2 = ViewerHelper.calcProjectedPointOnLine(edgePt1, edgePt2, tipPt2);

        ViewerHelper.SetObjectLocation(tipRightProjection, projTip1);
        ViewerHelper.SetObjectLocation(tipLeftProjection, projTip2);

        var imageStartPt = ViewerHelper.TranslatePointCoords(new PointF(dicomimg.getX(), dicomimg.getY()), stage, group);
        var imageSizeVector = ViewerHelper.TranslateVectorCoords(new PointF(dicomimg.getWidth(), dicomimg.getHeight()), dicomimg, group);

        var holderPt;
        if (isFemorCutting) {
            var angleHolderDist = (MathL.Distance(jointMidPt, topMiddlePt) + MathL.Distance(jointMidPt, bottomMiddlePt)) / 2;
            holderPt = new Vec2(jointMidPt.x, jointMidPt.y).addV(realAxis.mulS(angleHolderDist));
            ViewerHelper.SetAnchorLocation(MechanicalAxisAngleHandler, holderPt);

            var realAxisIntersactionPoint = MathL.calcIntersectionWithRect(jointMidPt, realAxis, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));
            var MechanicalAxisConnectingLineHitRegion = group.find('.MechanicalAxisConnectingLineHitRegion')[0];
            MechanicalAxisConnectingLine.setPoints([jointMidPt.x, jointMidPt.y, realAxisIntersactionPoint.x, realAxisIntersactionPoint.y]);
            MechanicalAxisConnectingLineHitRegion.setPoints([jointMidPt.x, jointMidPt.y, realAxisIntersactionPoint.x, realAxisIntersactionPoint.y]);
        }

        var boneAxisIntersactionPoint = MathL.calcIntersectionWithRect(jointMidPt, boneAxis, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));
        var BoneAxis_connectingLineHitRegion = group.find('.BoneAxis_connectingLineHitRegion')[0];
        BoneAxis_connectingLine.setPoints([jointMidPt.x, jointMidPt.y, boneAxisIntersactionPoint.x, boneAxisIntersactionPoint.y]);
        BoneAxis_connectingLineHitRegion.setPoints([jointMidPt.x, jointMidPt.y, boneAxisIntersactionPoint.x, boneAxisIntersactionPoint.y]);

        var BoneAxis_TopConnectingLineHitRegion = group.find('.BoneAxis_TopConnectingLineHitRegion')[0];
        BoneAxis_TopConnectingLine.setPoints([topRightPt.x, topRightPt.y, topLeftPt.x, topLeftPt.y]);
        BoneAxis_TopConnectingLineHitRegion.setPoints([topRightPt.x, topRightPt.y, topLeftPt.x, topLeftPt.y]);

        var BoneAxis_BottomConnectingLineHitRegion = group.find('.BoneAxis_BottomConnectingLineHitRegion')[0];
        BoneAxis_BottomConnectingLine.setPoints([bottomRightPt.x, bottomRightPt.y, bottomLeftPt.x, bottomLeftPt.y]);
        BoneAxis_BottomConnectingLineHitRegion.setPoints([bottomRightPt.x, bottomRightPt.y, bottomLeftPt.x, bottomLeftPt.y]);

        var ResectionConnectingLineHitRegion = group.find('.ResectionConnectingLineHitRegion')[0];
        ResectionConnectingLine.setPoints([edgePt1.x, edgePt1.y, edgePt2.x, edgePt2.y]);
        ResectionConnectingLineHitRegion.setPoints([edgePt1.x, edgePt1.y, edgePt2.x, edgePt2.y]);

        var PerpendicularRightCondyleConnectingLineHitRegion = group.find('.PerpendicularRightCondyleConnectingLineHitRegion')[0];
        PerpendicularRightCondyleConnectingLine.setPoints([tipPt1.x, tipPt1.y, projTip1.x, projTip1.y]);
        PerpendicularRightCondyleConnectingLineHitRegion.setPoints([tipPt1.x, tipPt1.y, projTip1.x, projTip1.y]);
        var PerpendicularLeftCondyleConnectingLineHitRegion = group.find('.PerpendicularLeftCondyleConnectingLineHitRegion')[0];
        PerpendicularLeftCondyleConnectingLine.setPoints([tipPt2.x, tipPt2.y, projTip2.x, projTip2.y]);
        PerpendicularLeftCondyleConnectingLineHitRegion.setPoints([tipPt2.x, tipPt2.y, projTip2.x, projTip2.y]);

        var labelPt = edgePt2.addV(realAxis.mulS(tipLeftProjectionLineLabel.getHeight() * 2));
        ViewerHelper.moveLabel(tipLeftProjectionLineLabel, new PointF(labelPt.x, labelPt.y));
        var lesser1linelength = ViewerHelper.calculateLineLength(PerpendicularLeftCondyleConnectingLine);
        tipLeftProjectionLineLabel.setAttr('pixelLength', lesser1linelength);
        labelPt = edgePt1.addV(realAxis.mulS(tipLeftProjectionLineLabel.getHeight() * 2));
        ViewerHelper.moveLabel(tipRightProjectionLineLabel, new PointF(labelPt.x, labelPt.y));
        var lesser1linelength = ViewerHelper.calculateLineLength(PerpendicularRightCondyleConnectingLine);
        tipRightProjectionLineLabel.setAttr('pixelLength', lesser1linelength);
        if (isFemorCutting) {
            var angleDegree = Math.round(Math.abs(axisAngle)) + "\u00B0";
            //angleLineLabel.find('Text')[0].setText(Math.round(Math.abs(axisAngle)) + "\u00B0");
            var textNode = angleLineLabel.find('Text')[0];
            if (!textNode._partialText) textNode['_partialText'] = angleDegree;
            if (textNode.textArr[0].text == "" || textNode['_partialText'].indexOf(' ') < 0) {
                textNode.setText(angleDegree);
            } else {
                if (textNode['_partialText'].indexOf(' ') > 0) {
                    var oldDegreeText = textNode._partialText.substr(0, textNode._partialText.indexOf(' '));
                    textNode['_partialText'] = textNode._partialText.replace(oldDegreeText, angleDegree);
                    textNode.setText(textNode['_partialText'])
                }
            }
            labelPt = MathL.GetMiddlePt(holderPt, jointMidPt);
            ViewerHelper.moveLabel(angleLineLabel, labelPt);
        }

        ResectionConnectingLine.setZIndex(0);
        layer.batchDraw();
    }

    static connectResectionLineTool_PartMoved(group: any, kneeToolsViewer: any) {

        KneeToolsViewer.connectResectionLineTool(group, kneeToolsViewer);
        kneeToolsViewer.FindLocateAPImplantOnResectionLine(group.getAttr('isFemorCutting'));
    }

    static connectResectionLineTool_topMidPointMoved(group: any, kneeToolsViewer: any) {

        var BoneAxis_TopLeft = group.find('.BoneAxis_TopLeft')[0];
        var BoneAxis_TopRight = group.find('.BoneAxis_TopRight')[0];
        var BoneAxis_TopMiddle = group.find('.BoneAxis_TopMiddle')[0];

        var topLeftPt = ViewerHelper.GetObjectLocation(BoneAxis_TopLeft);
        var topRightPt = ViewerHelper.GetObjectLocation(BoneAxis_TopRight);
        var topMiddlePt = ViewerHelper.GetObjectLocation(BoneAxis_TopMiddle);

        var oldTopMidPt = MathL.GetMiddlePt(topLeftPt, topRightPt);
        var diff = topMiddlePt.subV(oldTopMidPt);
        topLeftPt = topLeftPt.addV(diff);
        topRightPt = topRightPt.addV(diff);

        ViewerHelper.SetAnchorLocation(BoneAxis_TopLeft, topLeftPt);
        ViewerHelper.SetAnchorLocation(BoneAxis_TopRight, topRightPt);

        KneeToolsViewer.connectResectionLineTool_PartMoved(group, kneeToolsViewer);
    }

    static connectResectionLineTool_bottomMidPointMoved(group: any, kneeToolsViewer: any) {

        var BoneAxis_BottomLeft = group.find('.BoneAxis_BottomLeft')[0];
        var BoneAxis_BottomRight = group.find('.BoneAxis_BottomRight')[0];
        var BoneAxis_BottomMiddle = group.find('.BoneAxis_BottomMiddle')[0];

        var bottomLeftPt = ViewerHelper.GetObjectLocation(BoneAxis_BottomLeft);
        var bottomRightPt = ViewerHelper.GetObjectLocation(BoneAxis_BottomRight);
        var bottomMiddlePt = ViewerHelper.GetObjectLocation(BoneAxis_BottomMiddle);

        var oldBottomMidPt = MathL.GetMiddlePt(bottomLeftPt, bottomRightPt);
        var diff = bottomMiddlePt.subV(oldBottomMidPt);
        bottomLeftPt = bottomLeftPt.addV(diff);
        bottomRightPt = bottomRightPt.addV(diff);

        ViewerHelper.SetAnchorLocation(BoneAxis_BottomLeft, bottomLeftPt);
        ViewerHelper.SetAnchorLocation(BoneAxis_BottomRight, bottomRightPt);

        KneeToolsViewer.connectResectionLineTool_PartMoved(group, kneeToolsViewer);
    }

    static connectResectionLineTool_AngleAnchorMoved(group: any, kneeToolsViewer: any) {

        var edgeRight = group.find('.edgeRight')[0];
        var edgeLeft = group.find('.edgeLeft')[0];
        var BoneAxis_TopMiddle = group.find('.BoneAxis_TopMiddle')[0];
        var BoneAxis_BottomMiddle = group.find('.BoneAxis_BottomMiddle')[0];
        var BoneAxis_BottomMiddle = group.find('.BoneAxis_BottomMiddle')[0];
        var MechanicalAxisAngleHandler = group.find('.MechanicalAxisAngleHandler')[0];

        var edgePt1 = ViewerHelper.GetObjectLocation(edgeRight);
        var edgePt2 = ViewerHelper.GetObjectLocation(edgeLeft);
        var bottomMiddlePt = ViewerHelper.GetObjectLocation(BoneAxis_BottomMiddle);
        var topMiddlePt = ViewerHelper.GetObjectLocation(BoneAxis_TopMiddle);
        var angleHandlerPt = ViewerHelper.GetObjectLocation(MechanicalAxisAngleHandler);

        var isLeftLeg = group.getAttr('isLeftLeg');
        var isFemorCutting = group.getAttr('isFemorCutting');
        var axisAngle = group.getAttr('axisAngle');

        var jointMidPt = MathL.calcLinesIntersection(edgePt1, edgePt2, topMiddlePt, bottomMiddlePt);
        var axis = topMiddlePt.subV(jointMidPt).normalize();

        var angleData = MathL.CalcAngle(topMiddlePt, angleHandlerPt, jointMidPt);
        var angleDeg = angleData.angleDegree;
        if (isLeftLeg)
            angleDeg = -angleDeg
        group.setAttr('axisAngle', angleDeg);

        KneeToolsViewer.connectResectionLineTool_PartMoved(group, kneeToolsViewer);
    }

    static connectResectionLineTool_leftEdgeMoved(group: any, kneeToolsViewer: any) {
        var edgeRight = group.find('.edgeRight')[0];
        var edgeLeft = group.find('.edgeLeft')[0];
        var edgePt1 = ViewerHelper.GetObjectLocation(edgeRight);
        var edgePt2 = ViewerHelper.GetObjectLocation(edgeLeft);

        var axis = KneeToolsViewer.getAxis(group, true);
        var movement = edgePt2.subV(edgePt1).dot(axis);
        edgePt1 = edgePt1.addV(axis.mulS(movement));
        ViewerHelper.SetAnchorLocation(edgeRight, edgePt1);

        KneeToolsViewer.connectResectionLineTool_PartMoved(group, kneeToolsViewer);
    }

    static connectResectionLineTool_rightEdgeMoved(group: any, kneeToolsViewer: any) {
        var edgeRight = group.find('.edgeRight')[0];
        var edgeLeft = group.find('.edgeLeft')[0];
        var edgePt1 = ViewerHelper.GetObjectLocation(edgeRight);
        var edgePt2 = ViewerHelper.GetObjectLocation(edgeLeft);

        var axis = KneeToolsViewer.getAxis(group, true);
        var movement = edgePt1.subV(edgePt2).dot(axis);
        edgePt2 = edgePt2.addV(axis.mulS(movement));
        ViewerHelper.SetAnchorLocation(edgeLeft, edgePt2);

        KneeToolsViewer.connectResectionLineTool_PartMoved(group, kneeToolsViewer);
    }

    static getAxis(group: any, getMechanicalAxis: boolean) {
        var edgeRight = group.find('.edgeRight')[0];
        var edgeLeft = group.find('.edgeLeft')[0];

        var BoneAxis_TopMiddle = group.find('.BoneAxis_TopMiddle')[0];
        var BoneAxis_BottomMiddle = group.find('.BoneAxis_BottomMiddle')[0];

        var edgePt1 = ViewerHelper.GetObjectLocation(edgeRight);
        var edgePt2 = ViewerHelper.GetObjectLocation(edgeLeft);
        var bottomMiddlePt = ViewerHelper.GetObjectLocation(BoneAxis_BottomMiddle);
        var topMiddlePt = ViewerHelper.GetObjectLocation(BoneAxis_TopMiddle);

        var isLeftLeg = group.getAttr('isLeftLeg');
        var isFemorCutting = group.getAttr('isFemorCutting');
        var axisAngle = group.getAttr('axisAngle');
        if (isLeftLeg)
            axisAngle = -axisAngle;

        var jointMidPt = MathL.calcLinesIntersection(edgePt1, edgePt2, topMiddlePt, bottomMiddlePt);
        var axis = topMiddlePt.subV(jointMidPt).normalize();
        if (getMechanicalAxis && isFemorCutting && axisAngle != 0) {
            axis = axis.rotateDegrees(axisAngle).normalize();
        }

        return axis;
    }

    static setInitialResectionLineLevel(group: any, kneeToolsViewer: any) {
        var setLevelToMaxValue = true;
        var initialMinMaxDistMM = 9; //in mm
        var initialMinMaxDistPixels = kneeToolsViewer.viewer.MM2Pixels(initialMinMaxDistMM);

        var tipRight = group.find('.tipRight')[0];
        var edgeRight = group.find('.edgeRight')[0];
        var tipLeft = group.find('.tipLeft')[0];
        var edgeLeft = group.find('.edgeLeft')[0];

        var edgePt1 = ViewerHelper.GetObjectLocation(edgeRight);
        var edgePt2 = ViewerHelper.GetObjectLocation(edgeLeft);
        var tipPt1 = ViewerHelper.GetObjectLocation(tipRight);
        var tipPt2 = ViewerHelper.GetObjectLocation(tipLeft);

        var axis = KneeToolsViewer.getAxis(group, true);
        var tipsDiff = tipPt1.subV(tipPt2).dot(axis);
        var baseTip = (tipsDiff < 0) !== setLevelToMaxValue ? tipPt2 : tipPt1;

        var movement = baseTip.subV(edgePt1).dot(axis) + initialMinMaxDistPixels;
        edgePt1 = edgePt1.addV(axis.mulS(movement));
        movement = edgePt1.subV(edgePt2).dot(axis);
        edgePt2 = edgePt2.addV(axis.mulS(movement));
        ViewerHelper.SetAnchorLocation(edgeRight, edgePt1);
        ViewerHelper.SetAnchorLocation(edgeLeft, edgePt2);

        KneeToolsViewer.connectResectionLineTool_PartMoved(group, kneeToolsViewer);
    }

}

