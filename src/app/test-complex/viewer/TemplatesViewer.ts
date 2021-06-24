//// <reference path="../Declaretions.ts" />

'use strict';

import Konva from "konva";
import { ViewerHelper } from "./ViewerHelper";


interface ITemplatesViewer {


    SetTemplateAttachmentPointSelected(templateName, selectedAttachmentsPoint: DTOAttachmentPoint);
    SetTemplate(templateFamily: DTOImplantFamily, implantItem: DTOImplantItem, location: PointF, templateImgRotationAngle: number, templateImgMMPerPixel: number, name: string, typeName: string,
        attachmentsPoints: PointF[], canAttachToOtherTemplate: boolean, isMovingWithSegment: boolean, isTemplateMasterMovement: boolean,
        SuccessFunction: (templateFamily: DTOImplantFamily, implantItem: DTOImplantItem, dialogID: number, classificationName: string, viewerIndex: number) => void,
        OnTemplateSelectedFunction: (shapeType: string, shapeName: string) => void,
        OnTemplateUnSelectedFunction: (shapeType: string, shapeName: string) => void,
        OnAfterDeleteTemplatePartFunction: (shapeName: string) => void,
        dialogID: number, classificationName: string, viewerIndex: number, cupVec?: any): void;

    ToggleShowTemplates(DialogUniqueID, isAutoHip: boolean): void;
    IsTemplatesVisible: boolean;

    SetTemplateOnSWIP(templateSwipData: ImplantSWIPData): void;
}

class TemplatesViewer implements ITemplatesViewer {
    static DraggableSegmentGroupName = 'draggableSegmentGroup';

    private viewer;
    // Constructor
    constructor(viewer: IViewer) {
        this.viewer = viewer;
    }
    //DMF bool to toggle templates visibility  button
    IsTemplatesVisible = true;

    ToggleShowTemplates = function (DialogUniqueID, isAutoHip) {


        //      this.IsTemplatesVisible = !this.IsTemplatesVisible;

        (<IViewer>this.viewer).ToggleShowShapeByName(DialogUniqueID, isAutoHip);
    }


    SetTemplateAttachmentPointSelected = function (templateName, selectedAttachmentsPoint: DTOAttachmentPoint) {
        var _this = this;

        var theTemplateItemPartGroup = _this.viewer.segmentAndTemplatelayer.find('.' + templateName)[0];


        if (theTemplateItemPartGroup == null) {
            return false;
        }
        //  var theTemplateGroup = theTemplateItemPartGroup.getParent();
        var attachmentPointsShapes = theTemplateItemPartGroup.find('.attachmentPoint');
        if (attachmentPointsShapes[0] != null) {
            attachmentPointsShapes.forEach(function (attachmentPointShape) {
                attachmentPointShape.setAttr('drawOuterCircle', false);
                attachmentPointShape.setAttr('attchmentSelected', false);
            });
            attachmentPointsShapes.forEach(function (attachmentPointShape) {
                var isSelected = attachmentPointShape.getX() == selectedAttachmentsPoint.LocationImplantImageCoords.x && attachmentPointShape.getY() == selectedAttachmentsPoint.LocationImplantImageCoords.y;
                if (isSelected) {
                    var selectedAttachmentPointInGroup = theTemplateItemPartGroup.getAttr('selectedAttachmentPoint');
                    if (selectedAttachmentPointInGroup) {
                        theTemplateItemPartGroup.setAttr('selectedAttachmentPoint', selectedAttachmentsPoint);
                    }
                    else {
                        theTemplateItemPartGroup.setAttr('selectedAttachmentPoint', selectedAttachmentsPoint);
                    }
                }
                attachmentPointShape.setAttr('drawOuterCircle', isSelected);
                attachmentPointShape.setAttr('attchmentSelected', isSelected);
                var isAttached = HipToolsViewer.AreTemplatesAttached(_this.viewer);
                if (isSelected && isAttached) {
                    var moveableGroup, fixedGroup;
                    _this.viewer.segmentAndTemplatelayer.find('.templateGroup').forEach(function (templateGroup) {
                        if (templateGroup.getAttr('isMovingWithSegment') == true) {
                            moveableGroup = templateGroup;
                        }
                        else {
                            fixedGroup = templateGroup;
                        }
                    });
                    _this.templateAttachmentGroup = _this.viewer.segmentAndTemplatelayer.find('.templateAttachmentGroup')[0];
                    HipToolsViewer.OnAttachedSegmentMoveStart(_this.templateAttachmentGroup, _this.viewer.shapeslayer);
                    HipToolsViewer.MoveTemplatesAccordingToSelectedAttachmentPoints(moveableGroup, fixedGroup);
                    HipToolsViewer.OnAttachedSegmentMoved(_this.templateAttachmentGroup);
                    HipToolsViewer.OnAttachedSegmentMoveEnd(_this.templateAttachmentGroup);
                }
            });

        }
        HipToolsViewer.recalcOffsetLabel(_this.viewer);
        _this.viewer.segmentAndTemplatelayer.draw();
    }

    SetTemplate(templateFamily: DTOImplantFamily, implantItem: DTOImplantItem, location: PointF, templateImgRotationAngle: number, scale: number, name: string, typeName: string, attachmentsPoints: PointF[],
        canAttachToOtherTemplate: boolean, isMovingWithSegment: boolean, isTemplateMasterMovement: boolean,
        SuccessFunction: (templateFamily: DTOImplantFamily, implantItem: DTOImplantItem, dialogID: number, classificationName: string, viewerIndex: number) => void,   //   (imageSrc: string, dialogId: number, implantItem: DTOImplantItem, viewerIndex: number) => void,
        OnTemplateSelectedFunction: (shapeType: string, shapeName: string) => void,
        OnTemplateUnSelectedFunction: (shapeType: string, shapeName: string) => void,
        OnAfterDeleteTemplatePartFunction: (shapeName: string) => void,
        dialogID: number, classificationName: string, viewerIndex: number) {//cupVec?:any
        var _this = this;
        if (this.viewer.stage == null) {
            this.viewer.InitStage();
        }

        var templateGroups = _this.viewer.segmentAndTemplatelayer.find('.templateGroup');
        templateGroups.forEach((s: any) => s.setVisible(true));

        var templateGroup = templateGroups.filter((g: any) => g.getAttr('shapeType') == typeName)[0];
        var templateimgShape: any, templateimageObj: any, templateItemPartGroup: any;

        if (templateGroup != null) {
            templateItemPartGroup = templateGroup.find('.' + name)[0];
        }
        else {
            templateGroup = new Konva.Group({
                x: location.x,
                y: location.y,
                name: 'templateGroup',
                draggable: true,
                enableDraggableIfNotSelected: false,
                shapeType: typeName,
                isMovingWithSegment: isMovingWithSegment,
                canAttachToOtherTemplate: canAttachToOtherTemplate,
                onMoveFn: null,
            });
            _this.viewer.segmentAndTemplatelayer.add(templateGroup);
            ViewerHelper.addRotateHandleAndBoundingRect(templateGroup, false);

            templateGroup.on("dragmove", function () {
                HipToolsViewer.recalcOffsetLabel(_this.viewer);
                //cup inclination
                if (templateGroup.attrs.shapeType == "Cups") {
                    var templateItemPartGroup = templateGroup.children.filter(g => g.getAttr('shapeType') == 'templateItemPartGroup' && g.find('.attachmentPoint').length > 0)[0];
                    if (templateItemPartGroup != null) {
                        if (templateItemPartGroup.getAttr('cupVec') != null)
                            HipToolsViewer.recalculateInclinationLabel(_this.viewer, templateItemPartGroup);
                    }
                }
                templateGroup.moveToTop();
                if (templateGroup.getAttr('onMoveFn') != null) {
                    templateGroup.getAttr('onMoveFn')();
                }
            });
        }

        if (typeof (templateItemPartGroup) === "undefined" || templateItemPartGroup == null) {



            var currentMasterMovementImplant = templateGroup.children.filter(g => g.getAttr('shapeType') == 'templateItemPartGroup' && g.getAttr('isTemplateMasterMovement') == true)[0];
            if (currentMasterMovementImplant != null) {
                location = ViewerHelper.TranslatePointCoords(currentMasterMovementImplant.getAttr('startPoint'), currentMasterMovementImplant, _this.viewer.imglayer);

            }

            templateimageObj = new Image();
            templateItemPartGroup = new Konva.Group({
                x: 0,
                y: 0,
                name: name,
                draggable: !isTemplateMasterMovement,
                disableDragging: isTemplateMasterMovement,
                shapeType: 'templateItemPartGroup',
                isTemplateMasterMovement: isTemplateMasterMovement,
                onShapeSelectedFunction: OnTemplateSelectedFunction,
                onShapeUnSelectedFunction: OnTemplateUnSelectedFunction,
                onAfterDeleteFunction: OnAfterDeleteTemplatePartFunction,
                startPoint: implantItem.StartPointImplantImageCoords,
                implantItem: implantItem,
                implantFamilyId: templateFamily.FamilyId
            });

            templateGroup.add(templateItemPartGroup);

            let templateimgShape = new Konva.Image({
                x: 0,
                y: 0,
                image: undefined,
                name: 'templateimage',
                draggable: false,
                shapeType: 'templateimgShape'
            });

            templateItemPartGroup.add(templateimgShape);

            templateimageObj.onload = function () {
                templateimgShape.setImage(templateimageObj);

                templateimgShape.cache();
                templateimgShape.drawHitFromCache();

                if (!isTemplateMasterMovement) {
                    ViewerHelper.addRotateHandleAndBoundingRect(templateItemPartGroup, false);
                }
                //var existingAngle = MathL.CalcRotationMatrixAngle(templateItemPartGroup.getAbsoluteTransform().m);

                //if (currentMasterMovementImplant!=null) existingAngle = MathL.CalcRotationMatrixAngle(currentMasterMovementImplant.getAbsoluteTransform().m);
                //console.warn("Existing Angle", existingAngle, ' ', currentMasterMovementImplant);

                ViewerHelper.rotate(templateItemPartGroup, implantItem.RotAxisImplantImageCoords, templateImgRotationAngle);
                templateItemPartGroup.scale({ x: scale, y: scale });

                var locationAbsCoords = MathL.TransformCoords(location, _this.viewer.imglayer.getAbsoluteTransform().m);
                var locationTemplateCoords = MathL.TransformCoords(locationAbsCoords, MathL.InvertTransformMatrix(templateItemPartGroup.getAbsoluteTransform().m));
                ViewerHelper.MoveObjectPointToPoint(templateItemPartGroup, implantItem.StartPointImplantImageCoords, locationTemplateCoords);
                TemplatesViewer.onTemplateImageLoadedSuccessfuly(templateFamily, _this.viewer, true, templateGroup, templateItemPartGroup, templateimgShape, scale, attachmentsPoints,
                    implantItem.RotAxisImplantImageCoords, templateimageObj, SuccessFunction, implantItem, dialogID, classificationName, viewerIndex);




                _this.viewer.segmentAndTemplatelayer.draw();
                _this.viewer.segmentAndTemplatelayer.drawHit();

            };


            HipToolsViewer.createTemplate(_this.viewer, templateItemPartGroup, _this.viewer.shapeslayer, _this.viewer.imglayer);
        } else {

            templateimgShape = templateItemPartGroup.find('.templateimage')[0];
            templateimgShape.setAttr('image', null);
            templateimageObj = new Image();
            templateimgShape.clearCache();

            templateimageObj.onload = function () {
                templateimgShape.setAttr('image', templateimageObj);
                templateimgShape.cache();
                templateimgShape.drawHitFromCache();

                templateItemPartGroup.scale({ x: scale, y: scale });
                templateItemPartGroup.setAttr('implantItem', implantItem);
                TemplatesViewer.onTemplateImageLoadedSuccessfuly(templateFamily, _this.viewer, false, templateGroup, templateItemPartGroup, templateimgShape, scale, attachmentsPoints,
                    implantItem.RotAxisImplantImageCoords, templateimageObj, SuccessFunction, implantItem, dialogID, classificationName, viewerIndex);
                _this.viewer.segmentAndTemplatelayer.draw();
                _this.viewer.segmentAndTemplatelayer.drawHit();
            };
        }

        templateimageObj.src = 'data:image/png;base64,' + implantItem.ImplantImageBase64;
        //DMF change template visibility button icon
        //      this.IsTemplatesVisible = true;
    }// end of set template

    static dumpMatrix = function (m) {
        return ("" + m[0] + "," + m[1] + "," + m[2] + "," + m[3] + "," + m[4] + "," + m[5]);
    }

    SetTemplateOnSWIP = function (templateSwipData: ImplantSWIPData) {
        var _this = this;
        var templateGroups = _this.viewer.segmentAndTemplatelayer.find('.templateGroup');
        var templateGroup = templateGroups.filter(g => g.getAttr('shapeType') == templateSwipData.templateShapeType)[0];

        var templateItemPartGroups = templateGroup.children.filter(g => g.getAttr('shapeType') == 'templateItemPartGroup');
        var templateItemPartGroup = templateItemPartGroups.filter(g => g.getAttr('implantFamilyId') == templateSwipData.implantFamilyId)[0];
        var imglayer = templateGroup.getStage().find('.imglayer')[0];
        var layer = templateGroup.getLayer();

        var implantImage = templateItemPartGroup.find('.templateimage')[0];

        var implantItem = templateItemPartGroup.getAttr('implantItem');

        ViewerHelper.MoveObjectToGroupKeepLocation(imglayer, templateItemPartGroup);
        templateItemPartGroup.setRotation(templateSwipData.implantItemRotationAngle);
        ViewerHelper.MoveObjectToGroupKeepLocation(templateGroup, templateItemPartGroup);

        var startPointImplantImageCoords = implantItem.StartPointImplantImageCoords;
        var origLocation_templateGroupCoords = ViewerHelper.TranslatePointCoords(startPointImplantImageCoords, implantImage, templateItemPartGroup);
        var newLocation_templateGroupCoords = ViewerHelper.TranslatePointCoords(templateSwipData.implantStartPointImageCoords, imglayer, templateItemPartGroup);

        ViewerHelper.MoveObjectPointToPoint(templateItemPartGroup, origLocation_templateGroupCoords, newLocation_templateGroupCoords);

        var finalLocation_ImageCoords = ViewerHelper.TranslatePointCoords(startPointImplantImageCoords, implantImage, imglayer);///!!!!!! remove
        var finalRotation = MathL.CalcRotationMatrixAngle(templateItemPartGroup.getAbsoluteTransform().m);
        console.log("dest Location: (" + templateSwipData.implantStartPointImageCoords.x + "," + templateSwipData.implantStartPointImageCoords.y + "), dest Rotation: " + templateSwipData.implantItemRotationAngle);
        console.log("final Location: (" + finalLocation_ImageCoords.x + "," + finalLocation_ImageCoords.y + "), Final Rotation: " + finalRotation);
        console.log("Using start point in implant: (" + startPointImplantImageCoords.x + "," + startPointImplantImageCoords.y + ")");
        console.log("templateItemPartGroup Transform = " + TemplatesViewer.dumpMatrix(templateItemPartGroup.getTransform().m));
        console.log("templateItemPartGroup Parent Transform = " + TemplatesViewer.dumpMatrix(templateItemPartGroup.parent.getTransform().m));
        console.log("templateItemPartGroup Absolute Transform = " + TemplatesViewer.dumpMatrix(templateItemPartGroup.getAbsoluteTransform().m));
        console.log("implantImage Transform = " + TemplatesViewer.dumpMatrix(implantImage.getTransform().m));
        console.log("implantImage Absolute Transform = " + TemplatesViewer.dumpMatrix(implantImage.getAbsoluteTransform().m));
        console.log("ImageLayer Transform = " + TemplatesViewer.dumpMatrix(imglayer.getTransform().m));

        if (templateSwipData.isTemplateMasterMovement) {
            var rotationCentersList = templateGroup.find('.rotatecenter');
            var rotateCenter = rotationCentersList.filter(p => p.getParent() == templateGroup)[0]; //filter the children rotation center
            var rotationAxisImplantImageCoords = implantItem.RotAxisImplantImageCoords;
            var moveToFixPoint_rotateCenterCoords = ViewerHelper.TranslatePointCoords(rotationAxisImplantImageCoords, implantImage, rotateCenter);
            ViewerHelper.MoveObjectPointToPoint(rotateCenter, new PointF(0, 0), moveToFixPoint_rotateCenterCoords);
            var rotatecenter_permanent = templateGroup.find('.rotatecenter_permanent')[0];
            ViewerHelper.MoveObjectPointToPoint(rotatecenter_permanent, new PointF(0, 0), moveToFixPoint_rotateCenterCoords);
        }

        if (templateSwipData.labels && templateSwipData.labels.length) {
            if (templateSwipData.templateShapeType == "Cups") {
                var inclinationLabel = layer.find('.inclinationLabel')[0];
                var inclinationLabelData = templateSwipData.labels.filter(obj => { return obj.name === '.inclinationLabel' })[0];
                if (inclinationLabel) {
                    HipToolsViewer.recalculateInclinationLabel(_this.viewer, templateItemPartGroup);
                }

                if (inclinationLabel && inclinationLabelData) {
                    BasicToolsViewer.UpdateLabelOnSwipDirect(inclinationLabel, inclinationLabelData);
                }
            }
            else if (templateSwipData.templateShapeType == "Stems") {
                var offsetLabel = layer.find('.offsetLabel')[0];
                var offsetLabelData = templateSwipData.labels.filter(obj => { return obj.name === '.offsetLabel' })[0];

                if (offsetLabel && offsetLabelData) {
                    BasicToolsViewer.UpdateLabelOnSwipDirect(offsetLabel, offsetLabelData);
                }
            }
        }

        _this.viewer.segmentAndTemplatelayer.draw();
        _this.viewer.stage.draw();
    }

    static onTemplateImageLoadedSuccessfuly = function (templateFamily, viewer, isFirstTime: boolean, templateGroup, templateItemPartGroup, templateimgShape, scale, attachmentsPoints, templateImgRotationPoint, templateimageObj, SuccessFunction, implantItem, dialogID, classificationName, viewerIndex) {
        var stage = templateGroup.getStage();
        var isAttachedStem = HipToolsViewer.AreTemplatesAttached(viewer) && templateGroup.getAttr('isMovingWithSegment') == true;
        var isTemplateMasterMovement = templateItemPartGroup.getAttr('isTemplateMasterMovement');
        //console.warn("Adding template. templateImgRotationPoint: " + templateImgRotationPoint.x + "," + templateImgRotationPoint.y);

        if (isTemplateMasterMovement) {
            var implantImage = templateItemPartGroup.find('.templateimage')[0];
            templateImgRotationPoint = ViewerHelper.TranslatePointCoords(templateImgRotationPoint, implantImage, templateGroup);//!
            if (!isFirstTime) {         //locate new template center on prev template center
                var rotatecenter_permanent = templateGroup.find('.rotatecenter_permanent')[0];

                var oldRotationPoint = new PointF(rotatecenter_permanent.getX(), rotatecenter_permanent.getY());
                var newRotationPoint = templateImgRotationPoint;

                rotatecenter_permanent.destroy();
                if (isAttachedStem) {
                    var draggableSegmentGroup = viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
                    if (draggableSegmentGroup.parent == templateGroup) {
                        ViewerHelper.MoveObjectToGroupKeepLocation(viewer.segmentAndTemplatelayer, draggableSegmentGroup);
                        ViewerHelper.MoveObjectPointToPoint(templateGroup, newRotationPoint, oldRotationPoint);
                        ViewerHelper.MoveObjectToGroupKeepLocation(templateGroup, draggableSegmentGroup);
                        draggableSegmentGroup.moveToBottom();
                    }
                } else {
                    ViewerHelper.MoveObjectPointToPoint(templateGroup, newRotationPoint, oldRotationPoint);
                }
            }
            else {

            }
            var newrotatecenter_permanent = ViewerHelper.CreateCircleWithCrossShape(stage, templateImgRotationPoint, '#f7ebbf', 'rotatecenter_permanent', 5, false);
            templateGroup.add(newrotatecenter_permanent);
            newrotatecenter_permanent.moveToTop();
            newrotatecenter_permanent.moveToTop();
        }

        var rotationCentersList = templateGroup.find('.rotatecenter');
        var rotateCenter;
        if (isTemplateMasterMovement) {
            rotateCenter = rotationCentersList.filter(p => p.getParent() == templateGroup)[0];
        }
        else {
            rotateCenter = rotationCentersList.filter(p => p.getParent() == templateItemPartGroup)[0];
            if (!isFirstTime) {        //locate new template center on prev template center
                ViewerHelper.MoveObjectPointToPoint(templateItemPartGroup, templateImgRotationPoint, new PointF(rotateCenter.getX(), rotateCenter.getY()));
            }
        }
        if (isAttachedStem && isTemplateMasterMovement) {
            //        ViewerHelper.MoveTemplateRotateCenterToSelectedAttachmentPoint(templateGroup); AttachmentPoint is not selected as this stage
        }
        else {
            rotateCenter.setX(templateImgRotationPoint.x);
            rotateCenter.setY(templateImgRotationPoint.y);
        }

        templateItemPartGroup.find('.attachmentPoint').destroy();
        if (attachmentsPoints != null) {
            attachmentsPoints.forEach(function (attachmentPoint) {
                var cross = ViewerHelper.CreateCircleWithCrossShape(stage, attachmentPoint, '#f7ebbf', 'attachmentPoint', 5, false);
                templateItemPartGroup.add(cross);
            });
        }
        viewer.SetCurrentSelected(templateItemPartGroup);
        HipToolsViewer.recalcOffsetLabel(viewer);

        if (templateFamily.ClassificationName == 'Cups' && templateFamily.HasAttachmentPoints) {//templateGroup.parent.getAttr('shapeType')
            var cupVec = HipToolsViewer.getCupVectorFromSpecialPoints(implantItem);
            if (cupVec) {
                templateItemPartGroup.setAttr('cupVec', cupVec);
                templateItemPartGroup.setAttr('getReport', getReport);
            }
            ViewerHelper.traverseContainer(templateGroup, function (child:any) {
                if (child.getAttr('cupVec') != null) {
                    var inclinationLabel = templateGroup.getLayer().find('.inclinationLabel')[0];
                    if (inclinationLabel != null) {
                        HipToolsViewer.recalculateInclinationLabel(viewer, child);
                    } else {
                        HipToolsViewer.initInclanationLabel(viewer, child);
                    }
                }
            });
        }
        if (SuccessFunction != null) {
            SuccessFunction(templateFamily, implantItem, dialogID, classificationName, viewerIndex);
        }

        function getReport(container) {
            if (!container.isVisible()) return null;
            var layer = container.getLayer();
            var report = new DTOMeasurmentToolInfo();
            var label = layer.find('.inclinationLabel')[0]; //supports only one
            if (label) {
                var angleValue = label.getText().text()

                report.ToolName = "Cup Inclination"
                report.ToolValues = [new KeyValuePair('Angle', angleValue)]
                return report;
            }
            return null;
        }

        templateItemPartGroup.setAttr('getSWIP', getSWIP);

        function getSWIP(container) {

            var imglayer = container.getStage().find('.imglayer')[0];
            var layer = container.getLayer();

            var implantFamilyId = container.getAttr('implantFamilyId');
            var implantItem = container.getAttr('implantItem');
            var implantItemId = implantItem.ImplantId;

            var shapeName = container.getAttr('name');

            var templateGroup = container.parent;
            ViewerHelper.MoveObjectToGroupKeepLocation(imglayer, container);
            var rotationAngle = MathL.CalcRotationMatrixAngle(container.getTransform().m);
            ViewerHelper.MoveObjectToGroupKeepLocation(templateGroup, container);

            var isTemplateMasterMovement = container.getAttr('isTemplateMasterMovement');
            var shapeType = container.parent.attrs.shapeType;
            var selectedAttachmentPointInGroup = container.getAttr('selectedAttachmentPoint');

            var implantItem = templateItemPartGroup.getAttr('implantItem');
            var implantStartPointImplantImageCoords = implantItem.StartPointImplantImageCoords;

            var implantImage = container.find('.templateimage')[0];
            var implantStartPointImageCoords = ViewerHelper.TranslatePointCoords(implantStartPointImplantImageCoords, implantImage, imglayer);

            var inclinationLabel = layer.find('.inclinationLabel')[0];
            var offsetLabel = layer.find('.offsetLabel')[0];
            //console.log("Saving Location: (" + implantStartPointImageCoords.x + "," + implantStartPointImageCoords.y + "), saving Rotation: " + rotationAngle);
            //console.log("Saved start point in implant: (" + implantStartPointImplantImageCoords.x + "," + implantStartPointImplantImageCoords.y + ")");
            //console.log("templateItemPartGroup Transform = " + TemplatesViewer.dumpMatrix(container.getTransform().m));
            //console.log("templateItemPartGroup Parent Transform = " + TemplatesViewer.dumpMatrix(container.parent.getTransform().m));
            //console.log("templateItemPartGroup Absolute Transform = " + TemplatesViewer.dumpMatrix(container.getAbsoluteTransform().m));
            //console.log("implantImage Transform = " + TemplatesViewer.dumpMatrix(implantImage.getTransform().m));
            //console.log("implantImage Absolute Transform = " + TemplatesViewer.dumpMatrix(implantImage.getAbsoluteTransform().m));
            //console.log("ImageLayer Transform = " + TemplatesViewer.dumpMatrix(imglayer.getTransform().m));

            var implantData = {
                shapeType: 'Template',
                shapeName: shapeName,
                templateShapeType: shapeType,
                isVisible: container.isVisible(),
                implantFamilyId: implantFamilyId,
                implantItemId: implantItemId,
                implantStartPointImageCoords: implantStartPointImageCoords,
                implantItemRotationAngle: rotationAngle,
                isTemplateMasterMovement: isTemplateMasterMovement,
                selectedAttachmentPoint: null,
                labels: []
            };

            if (selectedAttachmentPointInGroup)
                implantData.selectedAttachmentPoint = selectedAttachmentPointInGroup;

            var labelText;
            var labelPositionImageCoords;
            if (inclinationLabel && shapeType == 'Cups' && selectedAttachmentPointInGroup) {
                labelText = inclinationLabel.getText().text();
                var labelPositionLayerCoords = inclinationLabel.getPosition();
                labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionLayerCoords, layer, imglayer);

                var toolInclinationLabel = {
                    name: '.inclinationLabel',
                    text: labelText,
                    position: labelPositionImageCoords
                };

                implantData.labels.push(toolInclinationLabel);
            }

            if (offsetLabel && shapeType == 'Stems') {
                labelText = offsetLabel.getText().text();
                var labelPositionLayerCoords = offsetLabel.getPosition();
                labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionLayerCoords, layer, imglayer);

                var toolOffsetLabel = {
                    name: '.offsetLabel',
                    text: labelText,
                    position: labelPositionImageCoords
                };

                implantData.labels.push(toolOffsetLabel);
            }

            return implantData;
        }

    }

    static GetSelectedAttachmentPointShape = function (templateGroup) {
        if (templateGroup != null) {
            var attachmentPointsShapes = templateGroup.find('.attachmentPoint');
            if (attachmentPointsShapes[0] != null) {
                var selectedAttachmentPoint = attachmentPointsShapes.filter(a => a.getAttr('attchmentSelected') == true)[0];
                return selectedAttachmentPoint
            }
        }
        return null;
    }
}