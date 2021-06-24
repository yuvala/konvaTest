//// <reference path="../Declaretions.ts" />

'use strict';

import { ViewerHelper } from "./ViewerHelper";


interface IHipToolsViewer {

    AttachTemplates(): void;
    DettachTemplates(): void;
    EnableAttachTemplates(enable: boolean): void;
    
    AreTemplatesAttached(): any;
  
    SetLLDTool(lldTool: DTOLldTool, strokColor: string): void;
    SetLLDToolFromSWIP(lLDSwipItem: any): void;
	
   // LLDTool(strokColor: string): void;
	IsLLDExists(): boolean;
    GetLLDAngleToXAxis(): any;

    PrepareGetSWIP(): any;
    EndGetSWIP(connectionTransformData): void;
    UpdateOnSWIPAttach(rotationAngle: number, rotationCenter: PointF): void;
}


export class HipToolsViewer implements IHipToolsViewer {


	static LLDGroupName = 'lldGroup';
	

	private viewer;
	
	constructor(viewer: IViewer) {
		this.viewer = viewer;
	}

	IsLLDExists = function () {
		return (<IViewer>this.viewer).IsShapeExists(HipToolsViewer.LLDGroupName);
	}

    SetLLDTool = function (lldTool: DTOLldTool, strokeColor: string) {
        this.CreateLLDTool(lldTool, strokeColor);
	}

    SetLLDToolFromSWIP = function(lLDSwipItem: any) {
        var strokeColor = 'blue';

        var sLLDData = JSON.stringify(lLDSwipItem); 
        var lldSwipData: LLDSWIPData = JSON.parse(sLLDData);
        var lldTool: DTOLldTool = new DTOLldTool();
        lldTool.LeftIschialTuberosity = lldSwipData.pIschial1;
        lldTool.RightIschialTuberosity = lldSwipData.pIschial2;
        lldTool.LeftLesserTrochanter = lldSwipData.pLesser1;
        lldTool.RightLesserTrochanter = lldSwipData.pLesser2;
       
        var lldGroup = this.CreateLLDTool(lldTool, strokeColor);

        BasicToolsViewer.UpdateLabelOnSwip(lldGroup, lldSwipData.lesserlineLabel);
        BasicToolsViewer.UpdateLabelOnSwip(lldGroup, lldSwipData.ischial1PerpendicularlineLabel);
        BasicToolsViewer.UpdateLabelOnSwip(lldGroup, lldSwipData.ischial2PerpendicularlineLabel);
    }

    CreateLLDTool = function (lldTool: DTOLldTool, strokeColor: string) {
        var _this = this;
        var dicomimg = _this.viewer.stage.find('.dicomimg')[0];
        if (dicomimg == null) {
            _this.viewer.postImageOperationsQueue.push(function () { _this.SetLLDTool(lldTool, strokeColor) });
            return;
        }

        function getReport(container) {

            if (container.isVisible()) {
                var lldReport = new DTOMeasurmentToolInfo;
                lldReport.ToolName = "Leg Length Discrepancy Tool";
                lldReport.ToolValues = [];
                var lesser1 = container.find('.lesser1')[0];
                var lesser2 = container.find('.lesser2')[0];
                var lesser1Key = 'Right Leg';
                var lesser2Key = 'Left Leg';

                if (lesser1.getX() > lesser2.getX()) {
                    var lesser1Key = 'Left Leg';
                    var lesser2Key = 'Right Leg';
                }
                var ischial1PerpendicularlineLabel = container.find('.ischial1PerpendicularlineLabel')[0];
                var ischial2PerpendicularlineLabel = container.find('.ischial2PerpendicularlineLabel')[0];
                var leg1 = new KeyValuePair(lesser1Key, ischial1PerpendicularlineLabel.getText().textArr[0].text);
                var leg2 = new KeyValuePair(lesser2Key, ischial2PerpendicularlineLabel.getText().textArr[0].text);

                var lesserlineLabel = container.find('.lesserlineLabel')[0];
                var difference = new KeyValuePair('Difference', lesserlineLabel.getText().textArr[0].text);

                lldReport.ToolValues = [leg1, leg2, difference];
                return lldReport;

            }
            return null;
        }

        function getSWIP(container) {

            var imglayer = container.getStage().find('.imglayer')[0];
            var pIschial1ContainerCoords = container.find('.ischial1')[0];
            var pIschial2ContainerCoords = container.find('.ischial2')[0];
            var pLesser1ContainerCoords = container.find('.lesser1')[0];
			var pLesser2ContainerCoords = container.find('.lesser2')[0];

			if (!(pIschial1ContainerCoords || pIschial2ContainerCoords || pLesser1ContainerCoords || pLesser2ContainerCoords)) {
				return null;
			}

            var pIschial1ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pIschial1ContainerCoords.getX(), y: pIschial1ContainerCoords.getY() }, container, imglayer);
            var pIschial2ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pIschial2ContainerCoords.getX(), y: pIschial2ContainerCoords.getY() }, container, imglayer);
            var pLesser1ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pLesser1ContainerCoords.getX(), y: pLesser1ContainerCoords.getY() }, container, imglayer);
            var pLesser2ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pLesser2ContainerCoords.getX(), y: pLesser2ContainerCoords.getY() }, container, imglayer);

            var labelText;
            var labelPositionImageCoords;
            var lesserlineLabel = container.find('.lesserlineLabel')[0];
            if (lesserlineLabel) {
                labelText = lesserlineLabel.getText().text();
                var labelPositionContainerCoords = lesserlineLabel.getPosition();
                labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
            }

            var lesserlineLabelTool = {
                name: '.lesserlineLabel',
                text: labelText,
                position: labelPositionImageCoords
            }

            var ischial1PerpendicularlineLabel = container.find('.ischial1PerpendicularlineLabel')[0];
            if (ischial1PerpendicularlineLabel) {
                labelText = ischial1PerpendicularlineLabel.getText().text();
                var labelPositionContainerCoords = ischial1PerpendicularlineLabel.getPosition();
                labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
            }

            var ischial1PerpendicularlineLabelTool = {
                name: '.ischial1PerpendicularlineLabel',
                text: labelText,
                position: labelPositionImageCoords
            }

            var ischial1PerpendicularlineLabel = container.find('.ischial2PerpendicularlineLabel')[0];
            if (ischial1PerpendicularlineLabel) {
                labelText = ischial1PerpendicularlineLabel.getText().text();
                var labelPositionContainerCoords = ischial1PerpendicularlineLabel.getPosition();
                labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
            }

            var ischial2PerpendicularlineLabelTool = {
                name: '.ischial2PerpendicularlineLabel',
                text: labelText,
                position: labelPositionImageCoords
            }

            var toolData = {
                shapeType: 'LLD',
                shapeName: HipToolsViewer.LLDGroupName,
                isVisible: container.isVisible(),
                pIschial1: pIschial1ImageLayerCoords,
                pIschial2: pIschial2ImageLayerCoords,
                pLesser1: pLesser1ImageLayerCoords,
                pLesser2: pLesser2ImageLayerCoords,
                lesserlineLabel: lesserlineLabelTool,
                ischial1PerpendicularlineLabel: ischial1PerpendicularlineLabelTool,
                ischial2PerpendicularlineLabel: ischial2PerpendicularlineLabelTool
            }

            return toolData;
        }

        var lldGroup = new Konva.Group({
            draggable: true,
            name: HipToolsViewer.LLDGroupName,
            isLeftLeg: _this.viewer.imageOrientation.IsLeftBodyPart,
            getReport: getReport,
            getSWIP: getSWIP
        });

        if (lldTool == null) {
            var x = _this.viewer.GetImageWidth() / 5;
            var y = _this.viewer.GetImageHeight() / 2;
            lldTool = new DTOLldTool();
            lldTool.LeftIschialTuberosity = new PointF(x * 2, y);
            lldTool.RightIschialTuberosity = new PointF(x * 3, y);
            lldTool.LeftLesserTrochanter = new PointF(x, y + 100);
            lldTool.RightLesserTrochanter = new PointF(x * 4, y + 100);
        }

        this.viewer.shapeslayer.add(lldGroup);

        var anchor = Viewer.addAnchor(lldGroup, lldTool.LeftIschialTuberosity.x, lldTool.LeftIschialTuberosity.y, "ischial1", HipToolsViewer.connectLldTool, _this.viewer);
        Viewer.addAnchor(lldGroup, lldTool.RightIschialTuberosity.x, lldTool.RightIschialTuberosity.y, "ischial2", HipToolsViewer.connectLldTool, _this.viewer);
        Viewer.addAnchor(lldGroup, lldTool.LeftLesserTrochanter.x, lldTool.LeftLesserTrochanter.y, "lesser1", HipToolsViewer.connectLldTool, _this.viewer);
        Viewer.addAnchor(lldGroup, lldTool.RightLesserTrochanter.x, lldTool.RightLesserTrochanter.y, "lesser2", HipToolsViewer.connectLldTool, _this.viewer);

        HipToolsViewer.connectLldTool(lldGroup, _this.viewer);
        this.viewer.SetCurrentSelected(anchor);

        return lldGroup;
    }

    PrepareGetSWIP() {
        var _this = this;
        var connectionTransformData = new ConnectionTransformData();
        var isAttached = _this.AreTemplatesAttached();

        connectionTransformData.templatesAttached = isAttached;
        if (!isAttached) {           
            return connectionTransformData;
        }

        var draggableSegmentGroup = _this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
        var parentTemplate = draggableSegmentGroup.parent;

        var oldSegTransform = draggableSegmentGroup.getAbsoluteTransform().m;
        var LayerInvertedTransform = MathL.InvertTransformMatrix(this.viewer.segmentAndTemplatelayer.getAbsoluteTransform().m);
        var LayerToSegTransform = MathL.MultiplyTransformMatrix(LayerInvertedTransform, oldSegTransform);
        var parentTemplateTransform = draggableSegmentGroup.parent.getTransform().m;
        var tempParentTemplateTransform = MathL.MultiplyTransformMatrix(parentTemplateTransform, MathL.InvertTransformMatrix(LayerToSegTransform));

        var imglayer = draggableSegmentGroup.getStage().find('.imglayer')[0];
        var segmentPolygon = _this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
        var rotationAngle = MathL.CalcRotationMatrixAngle(segmentPolygon.getAbsoluteTransform().m);

        var implantItemGroup = null;
        var attachmentPoint_Image_Coords = null;
        draggableSegmentGroup.parent.children.forEach(ch => { if (ch.getAttr('selectedAttachmentPoint')) implantItemGroup = ch });
        if (implantItemGroup) {
            var implantImage = implantItemGroup.find('.templateimage')[0];
            var selectedAttachmentPoint = implantItemGroup.getAttr('selectedAttachmentPoint');
            var locationImplantImageCoords = selectedAttachmentPoint.LocationImplantImageCoords;
            attachmentPoint_Image_Coords = ViewerHelper.TranslatePointCoords(locationImplantImageCoords, implantImage, imglayer);
        }


        //if (isAttached)
        //    _this.DettachTemplates();
       
        connectionTransformData.transformMatrix = LayerToSegTransform;
        connectionTransformData.templatesAttached = isAttached;
        connectionTransformData.segmentRotationAngle = rotationAngle;
        connectionTransformData.selectedAttachmentPointCoords = attachmentPoint_Image_Coords;
        return connectionTransformData;
    }

    EndGetSWIP = function (connectionTransformData: ConnectionTransformData) {
        var _this = this;
        if (connectionTransformData.templatesAttached) {
			var draggableSegmentGroup = this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
        }
    }

    UpdateOnSWIPAttach = function (rotationAngle: number, selectedAttachmentPointCoords: PointF) {
        var _this = this;      
        var draggableSegmentGroup = this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
        var imglayer = draggableSegmentGroup.getStage().find('.imglayer')[0];
        var rotationPoint_OuterCoords = MathL.TransformCoords(selectedAttachmentPointCoords, imglayer.getAbsoluteTransform().m);
        SegmentViewer.OnSegmentMoveStart(draggableSegmentGroup, _this.viewer.shapeslayer);
        ViewerHelper.rotate(draggableSegmentGroup.parent, rotationPoint_OuterCoords, rotationAngle);
        SegmentViewer.OnSegmentMoved(draggableSegmentGroup);
        SegmentViewer.OnSegmentMoveEnd(draggableSegmentGroup);
    }

	EnableAttachTemplates = function (enable: boolean) {
		var _this = this;
		var attachmentIconShape, dettachmentIconShape;
		this.viewer.segmentAndTemplatelayer.find('.templateGroup').forEach(function (templateGroup) {
			if (enable && templateGroup.getAttr('canAttachToOtherTemplate') == true && templateGroup.find('.attachmentIcon')[0] == null) {
			}
			else if (!enable && templateGroup.find('.attachmentIcon')[0] != null) {
				var isAttached = _this.AreTemplatesAttached();
				if (isAttached) {
					_this.DettachTemplates();
				}
				attachmentIconShape = templateGroup.find('.attachmentIcon')[0];
				if (attachmentIconShape != null) {
					attachmentIconShape.hide();
				}
			}

		});

	}

	AreTemplatesAttached = function () {
		return HipToolsViewer.AreTemplatesAttached(this.viewer);
	}

	static AreTemplatesAttached = function (viewer) {
		return viewer.IsShapeExists('templateAttachmentGroup');
	}

	AttachTemplates = function () {
		var _this = this;
		if (_this.AreTemplatesAttached()) {
			return;
		}
		_this.templateAttachmentGroup = new Konva.Group({
			name: 'templateAttachmentGroup',
			draggable: true,
			enableDraggableIfNotSelected: true,
			disableDragging: false
		});
		this.viewer.segmentAndTemplatelayer.add(_this.templateAttachmentGroup);

		var moveableGroup, fixedGroup;
		_this.viewer.segmentAndTemplatelayer.find('.templateGroup').forEach(function (templateGroup) {
			if (templateGroup.getAttr('isMovingWithSegment') == true) {
				var draggableSegmentGroup = _this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
				if (draggableSegmentGroup != null) {
					//draggableSegmentGroup.setDraggable(true);
					SegmentViewer.SetSegmentFill(draggableSegmentGroup, true);
					draggableSegmentGroup.setAttr('disableRotate', false);
					draggableSegmentGroup.setAttr('allowDragingSubAnchors', false);
					ViewerHelper.MoveObjectToGroupKeepLocation(templateGroup, draggableSegmentGroup);
					draggableSegmentGroup.moveToBottom();
					draggableSegmentGroup.setAttr('onBeforeDeleteFunction', s => { _this.DettachTemplates(); });
				}
				var dettachmentIcon = templateGroup.find('.dettachmentIcon')[0];
				if (dettachmentIcon != null) {
					dettachmentIcon.show();
				}
				var attachmentIcon = templateGroup.find('.attachmentIcon')[0];
				if (attachmentIcon != null) {
					attachmentIcon.hide();
				}
				moveableGroup = templateGroup;
			}
			else {
				fixedGroup = templateGroup;
			}
			templateGroup.setDraggable(false);
			templateGroup.setAttr('disableDragging', true);

			ViewerHelper.MoveObjectToGroupKeepLocation(_this.templateAttachmentGroup, templateGroup);

			_this.templateAttachmentGroup.on("mousedown touchstart", function () {
				HipToolsViewer.OnAttachedSegmentMoveStart(_this.templateAttachmentGroup, _this.viewer.shapeslayer);
			});
			_this.templateAttachmentGroup.on("dragmove touchmove", function () {
				HipToolsViewer.OnAttachedSegmentMoved(_this.templateAttachmentGroup);
			});
			_this.templateAttachmentGroup.on("dragend touchend", function () {
				HipToolsViewer.OnAttachedSegmentMoveEnd(_this.templateAttachmentGroup);
			});

			_this.viewer.segmentAndTemplatelayer.draw();

			templateGroup.setAttr('onBeforeDeleteChildFunction', template => {
				if (template.parent.children.filter(g => g.getAttr('shapeType') == 'templateItemPartGroup' && g.getAttr('isTemplateMasterMovement') == true).length < 2) {
					_this.DettachTemplates();
				}
			});
		});

		moveableGroup.moveToTop();
		HipToolsViewer.OnAttachedSegmentMoveStart(_this.templateAttachmentGroup, _this.viewer.shapeslayer);
		HipToolsViewer.MoveTemplatesAccordingToSelectedAttachmentPoints(moveableGroup, fixedGroup);
		HipToolsViewer.OnAttachedSegmentMoved(_this.templateAttachmentGroup);
		HipToolsViewer.OnAttachedSegmentMoveEnd(_this.templateAttachmentGroup);
		HipToolsViewer.recalcOffsetLabel(_this.viewer);
		_this.viewer.segmentAndTemplatelayer.draw();
		_this.viewer.stage.draw();
	}

	static OnAttachedSegmentMoveStart = function (templateAttachmentGroup, shapeslayer) {
		templateAttachmentGroup.find('.' + SegmentViewer.DraggableSegmentGroupName).forEach(x => SegmentViewer.OnSegmentMoveStart(x, shapeslayer));
	}

	static OnAttachedSegmentMoved = function (templateAttachmentGroup) {
		templateAttachmentGroup.find('.' + SegmentViewer.DraggableSegmentGroupName).forEach(x => SegmentViewer.OnSegmentMoved(x));
	}

	static OnAttachedSegmentMoveEnd = function (templateAttachmentGroup) {
		templateAttachmentGroup.find('.' + SegmentViewer.DraggableSegmentGroupName).forEach(x => SegmentViewer.OnSegmentMoveEnd(x));
	}

	DettachTemplates = function () {
		var _this = this;
		if (!_this.AreTemplatesAttached()) {
			return;
		}
		var draggableSegmentGroup = this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
		var blackPoly = this.viewer.segmentAndTemplatelayer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];

		if (draggableSegmentGroup != null) {
			var oldSegmentTransform = draggableSegmentGroup.getAbsoluteTransform().m;
			SegmentViewer.OnSegmentMoveStart(draggableSegmentGroup, _this.viewer.shapeslayer)
			ViewerHelper.MoveObjectToGroupKeepLocation(this.viewer.segmentAndTemplatelayer, draggableSegmentGroup);
			draggableSegmentGroup.moveToBottom();
			blackPoly.moveToBottom();
			draggableSegmentGroup.position({ x: 0, y: 0 });
			draggableSegmentGroup.rotation(0);
			draggableSegmentGroup.draggable(false);
			draggableSegmentGroup.setAttr('disableDragging', true);
			draggableSegmentGroup.setAttr('allowDragingSubAnchors', true);
			draggableSegmentGroup.setAttr('disableRotate', true);
			SegmentViewer.SetSegmentFill(draggableSegmentGroup, false);
			var newSegmentTransform = draggableSegmentGroup.getAbsoluteTransform().m;
			var segmentMovementTransform = MathL.MultiplyTransformMatrix(MathL.InvertTransformMatrix(oldSegmentTransform), newSegmentTransform);
			SegmentViewer.OnSegmentMoved(draggableSegmentGroup);
			SegmentViewer.OnSegmentMoveEnd(draggableSegmentGroup);
			draggableSegmentGroup.setAttr('onBeforeDeleteFunction', null);
		}


		this.viewer.segmentAndTemplatelayer.find('.templateGroup').forEach(function (templateGroup) {
			templateGroup.moveToTop();
			templateGroup.setAttr('disableDragging', false);
			templateGroup.setDraggable(true);
			ViewerHelper.MoveObjectToGroupKeepLocation(_this.viewer.segmentAndTemplatelayer, templateGroup);

			var dettachmentIcon = templateGroup.find('.dettachmentIcon')[0];
			if (dettachmentIcon != null) {
				dettachmentIcon.hide();
			}
			var attachmentIcon = templateGroup.find('.attachmentIcon')[0];
			if (attachmentIcon != null) {
				attachmentIcon.show();
			}
			if (templateGroup.getAttr('isMovingWithSegment') == true) {
				if (draggableSegmentGroup != null) {
					var newTemplateTransform = MathL.MultiplyTransformMatrix(segmentMovementTransform, templateGroup.getTransform().m);
					ViewerHelper.SetObjectTransformMatrix(templateGroup, newTemplateTransform);
				}
				var rotateCenter = templateGroup.find('.rotatecenter')[0];
				var rotatecenter_permanent = templateGroup.find('.rotatecenter_permanent')[0];
				rotateCenter.setX(rotatecenter_permanent.getX());
				rotateCenter.setY(rotatecenter_permanent.getY());
			}
			templateGroup.setAttr('onBeforeDeleteChildFunction', null);
		});
		var templateAttachmentGroup = _this.viewer.segmentAndTemplatelayer.find('.templateAttachmentGroup')[0];
		//remove()?
		templateAttachmentGroup.destroy();

		HipToolsViewer.recalcOffsetLabel(_this.viewer);
		_this.viewer.segmentAndTemplatelayer.draw();
	}


	static createTemplate = function (viewer, templateGroup, shapeslayer, imglayer) {
		var layer = templateGroup.getLayer();

		var offsetLabel = layer.find('.offsetLabel')[0];
		var legLengthLabel = layer.find('.legLengthLabel')[0];
		if (offsetLabel == null) {

			offsetLabel = ViewerHelper.addLabel(layer, 'offsetLabel', '#ed145b', null);
			offsetLabel.find('.offsetLabelText')[0].setAttr('labelPrefix', "Offset changes: ");
			offsetLabel.setAttr('initOffsetCalcFn', HipToolsViewer.initOffsetLabelCalc);
			offsetLabel.setAttr('calcOffsetFn', HipToolsViewer.calcOffset);
			offsetLabel.setAttr('getReport', function (container) {
				if (!container.isVisible()) {
					return null;
				}
				var reportArr = container.getText().textArr;

				if (reportArr && reportArr.length > 1) {
					var toolInfo = new DTOMeasurmentToolInfo()
					toolInfo.ToolName = 'Hip Parameter Measurements';
					toolInfo.ToolValues = [];
					reportArr.forEach(v=>{
						var kvArr = v.text.split(':');
						toolInfo.ToolValues.push(new KeyValuePair(kvArr[0],kvArr[1]));

					})
					return toolInfo;

				}
				return null;
			})

			offsetLabel.moveToTop();


			//ViewerHelper.addLabel(layer, 'legLengthLabel', '#ed145b', null, 14,0.75,offsetLabel);
			//offsetLabel.find('.legLengthLabelText')[0].setAttr('labelPrefix', "Leg length changes: ");

			offsetLabel.moveToTop();

		}



		var offsetAxisVector;

		templateGroup.on("dragstart touchstart", function () {
			if (offsetLabel != null) {
				offsetAxisVector = offsetLabel.getAttr('initOffsetCalcFn')(viewer);
			}
		});
		templateGroup.on("dragmove touchmove", function () {
			if (offsetLabel != null) {
				offsetLabel.getAttr('calcOffsetFn')(viewer, offsetLabel, offsetAxisVector);
			}
		});



	}

	static recalcOffsetLabel = function (viewer) {
		var offsetLabel = viewer.segmentAndTemplatelayer.find('.offsetLabel')[0];
		if (offsetLabel != null) {
			var offsetAxisVector = offsetLabel.getAttr('initOffsetCalcFn')(viewer);
			offsetLabel.getAttr('calcOffsetFn')(viewer, offsetLabel, offsetAxisVector);

		}
	}


	static initOffsetLabelCalc = function (viewer) {
		var shapeslayer = viewer.shapeslayer
		var layer = viewer.segmentAndTemplatelayer;
		var cupTemplateGroup = null;
		var stemTemplateGroup = null;

		layer.find('.templateGroup').forEach(function (templateGroup) {
			if (templateGroup.getAttr('canAttachToOtherTemplate')) {
				stemTemplateGroup = templateGroup;
			}
			else {
				cupTemplateGroup = templateGroup;

			}
		});


		var stemSelectedAttachmentPoint = HipToolsViewer.GetSelectedAttachmentPointShape(stemTemplateGroup);
		var cupSelectedAttachmentPoint = HipToolsViewer.GetSelectedAttachmentPointShape(cupTemplateGroup);

		var lld1 = shapeslayer.findOne('.ischial1') == null ? shapeslayer.findOne('.tearDrop1') : shapeslayer.findOne('.ischial1');
		var lld2 = shapeslayer.findOne('.ischial2') == null ? shapeslayer.findOne('.tearDrop2') : shapeslayer.findOne('.ischial2');
		var offsetAxisVector;

		if (lld1 == null || lld2 == null) {
			offsetAxisVector = new Vec2(1, 0);
		} else {
			offsetAxisVector = new Vec2(lld1.getX(), lld1.getY()).subV(new Vec2(lld2.getX(), lld2.getY()));
			offsetAxisVector.normalize();
			if (offsetAxisVector.dot(new Vec2(1, 0)) < 0) {
				offsetAxisVector = offsetAxisVector.mulS(-1);
			}
		}
		if (viewer.imageOrientation.IsLeftBodyPart) {
			offsetAxisVector = offsetAxisVector.mulS(-1);
		}
		return offsetAxisVector;

	}
	static calcOffset = function (viewer, offsetLabel, offsetAxisVector) {
		var layer = viewer.segmentAndTemplatelayer;

		var cupTemplateGroup = null;
		var stemTemplateGroup = null;

		layer.find('.templateGroup').forEach(function (templateGroup) {
			if (templateGroup.getAttr('canAttachToOtherTemplate')) {
				stemTemplateGroup = templateGroup;
			}
			else {
				cupTemplateGroup = templateGroup;

			}
		});

		var stemSelectedAttachmentPoint = HipToolsViewer.GetSelectedAttachmentPointShape(stemTemplateGroup);
		var cupSelectedAttachmentPoint = HipToolsViewer.GetSelectedAttachmentPointShape(cupTemplateGroup);

		var showLabel = false;
		var labelText = "";
		if (cupSelectedAttachmentPoint != null) {
			//change adjust offset leg length label position
			//  ViewerHelper.moveLabel(offsetLabel, new PointF(cupTemplateGroup.position().x - 220, cupTemplateGroup.position().y - 520));
			// var offsetLabelWidth = offsetLabel.getText().getTextWidth();



			if (stemSelectedAttachmentPoint != null) {
				showLabel = true;
				offsetLabel.moveToTop();
				var changeVector;
				if (HipToolsViewer.AreTemplatesAttached(viewer)) {
					var draggableSegmentGroup = layer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
					var stemAttachmentPointLocOnSegment = ViewerHelper.TranslatePointCoords(new PointF(0, 0), stemSelectedAttachmentPoint, draggableSegmentGroup);
					var stemAttachmentPointLocOnImage = ViewerHelper.TranslatePointCoords(new PointF(0, 0), stemSelectedAttachmentPoint, viewer.imglayer);
					changeVector = MathL.SubtractPoints(stemAttachmentPointLocOnSegment, stemAttachmentPointLocOnImage);
				} else {
					var cupSelectedAttachmentPointLoc = ViewerHelper.TranslatePointCoords(new PointF(0, 0), cupSelectedAttachmentPoint, viewer.imglayer);
					var stemSelectedAttachmentPointLoc = ViewerHelper.TranslatePointCoords(new PointF(0, 0), stemSelectedAttachmentPoint, viewer.imglayer);
					changeVector = MathL.SubtractPoints(stemSelectedAttachmentPointLoc, cupSelectedAttachmentPointLoc);
				}

				var offsetVal = offsetAxisVector.dot(changeVector);
				var legLengthAxis = offsetAxisVector.getNormal();
				if (legLengthAxis.dot(new Vec2(0, 1)) > 0) {
					legLengthAxis = legLengthAxis.mulS(-1);
				}
				var legLengthVal = legLengthAxis.dot(changeVector);
				labelText = "Offset changes: " + (offsetVal * viewer.MMPerPixel).toFixed(1) + " mm\n" +
					"Leg length changes: " + (legLengthVal * viewer.MMPerPixel).toFixed(1) + " mm";
			}
		}
		offsetLabel.find('.offsetLabelText')[0].setAttr('text', labelText);
		if (cupSelectedAttachmentPoint != null) {
			var offsetLabelWidth = offsetLabel.getText().getTextWidth();

			if (viewer.imageOrientation.IsLeftBodyPart && offsetLabelWidth > 0) {  //change adjust offset leg length label position
				ViewerHelper.moveLabel(offsetLabel, new PointF((cupTemplateGroup.position().x - 300 - offsetLabelWidth), cupTemplateGroup.position().y));
			}
			else {
				ViewerHelper.moveLabel(offsetLabel, new PointF((cupTemplateGroup.position().x + 300), cupTemplateGroup.position().y));
			}
		}
		offsetLabel.setVisible(showLabel);
	}

	static connectLldTool = function (group, viewer) {
		var layer = group.getLayer();
		var stage = layer.getStage();
		var dicomimg = stage.find('.dicomimg')[0];
		var ischial1 = group.find('.ischial1')[0];
		var ischial2 = group.find('.ischial2')[0];
		var lesser1 = group.find('.lesser1')[0];
		var lesser2 = group.find('.lesser2')[0];
		var connectingLine = group.find('.connectingLine')[0];
		var lesserlineLabel = group.find('.lesserlineLabel')[0];
		var ischial1Perpendicular = group.find('.ischial1Perpendicular')[0];
		var ischial2Perpendicular = group.find('.ischial2Perpendicular')[0];
		var lesser1connectingLine = group.find('.lesser1connectingLine')[0];
		var lesser2connectingLine = group.find('.lesser2connectingLine')[0];
		var ischial1PerpendicularlineLabel = group.find('.ischial1PerpendicularlineLabel')[0];
		var ischial2PerpendicularlineLabel = group.find('.ischial2PerpendicularlineLabel')[0];
		var isLeftLeg = group.getAttr('isLeftLeg');

		var connectingLineToAixs1 = group.find('.connectingLineToAixs1')[0];

		if (ischial1 != null && lesser1 != null) {
			if (connectingLine == null) {
				connectingLine = ViewerHelper.addConnectingLine(group, "connectingLine");

				connectingLineToAixs1 = ViewerHelper.addConnectingLine(group, "connectingLineToAixs1");

				lesser1connectingLine = ViewerHelper.addConnectingLine(group, "lesser1connectingLine");

				lesser2connectingLine = ViewerHelper.addConnectingLine(group, "lesser2connectingLine");

				lesserlineLabel = ViewerHelper.addLabel(group, 'lesserlineLabel', connectingLine.getAttr('originalColor'), connectingLine);



				ischial1Perpendicular = new Konva.Circle({
					fill: 'cyan',
					name: 'ischial1Perpendicular',
					draggable: false,
					radius: 1,
					stroke: 'purple',
					strokeWidth: 4,
				});

				group.add(ischial1Perpendicular);

				ischial2Perpendicular = new Konva.Circle({
					fill: 'cyan',
					name: 'ischial2Perpendicular',
					draggable: false,
					radius: 1,
					stroke: 'purple',
					strokeWidth: 4,
				});
				group.add(ischial2Perpendicular);

				ischial1PerpendicularlineLabel = ViewerHelper.addLabel(group, 'ischial1PerpendicularlineLabel', '', lesser1connectingLine);



				ischial2PerpendicularlineLabel = ViewerHelper.addLabel(group, 'ischial2PerpendicularlineLabel', '', lesser2connectingLine);



			}
			var ischialPt1 = new Vec2(ischial1.getX(), ischial1.getY());
			var ischialPt2 = new Vec2(ischial2.getX(), ischial2.getY());
			var lesserPt1 = new Vec2(lesser1.getX(), lesser1.getY());
			var lesserPt2 = new Vec2(lesser2.getX(), lesser2.getY());

			var projLesser1 = ViewerHelper.calcProjectedPointOnLine(ischialPt1, ischialPt2, lesserPt1);
			var projLesser2 = ViewerHelper.calcProjectedPointOnLine(ischialPt1, ischialPt2, lesserPt2);

			ischial1Perpendicular.setX(projLesser1.x);
			ischial1Perpendicular.setY(projLesser1.y);
			ischial2Perpendicular.setX(projLesser2.x);
			ischial2Perpendicular.setY(projLesser2.y);
			var connectingLineHitRegion = group.find('.connectingLineHitRegion')[0];
			connectingLine.setPoints([ischial1.getX(), ischial1.getY(), ischial2.getX(), ischial2.getY()]);
			connectingLineHitRegion.setPoints([ischial1.getX(), ischial1.getY(), ischial2.getX(), ischial2.getY()]);

			var ischialLineDir = new Vec2(ischialPt1.x - ischialPt2.x, ischialPt1.y - ischialPt2.y);
			var ischialLineDirInv = new Vec2(-1 * ischialLineDir.x, -1 * ischialLineDir.y);
			var connectingLineToAixs1HitRegion = group.find('.connectingLineToAixs1HitRegion')[0];
			var imageStartPt = ViewerHelper.TranslatePointCoords(new PointF(dicomimg.getX(), dicomimg.getY()), stage, group);
			var imageSizeVector = ViewerHelper.TranslateVectorCoords(new PointF(dicomimg.getWidth(), dicomimg.getHeight()), dicomimg, group);
			var axisIntersactionPoint = MathL.calcIntersectionWithRect(ischialPt1, ischialLineDir, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));
			var edgeIntersactionPoint = MathL.calcIntersectionWithRect(ischialPt1, ischialLineDirInv, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));
			connectingLineToAixs1.setPoints([edgeIntersactionPoint.x, edgeIntersactionPoint.y, axisIntersactionPoint.x, axisIntersactionPoint.y]);
			connectingLineToAixs1HitRegion.setPoints([edgeIntersactionPoint.x, edgeIntersactionPoint.y, axisIntersactionPoint.x, axisIntersactionPoint.y]);
			var pointsShareSide = MathL.doPointsShareSide(ischialPt1, ischialPt2, lesserPt1, lesserPt2);

			var lesser1connectingLineHitRegion = group.find('.lesser1connectingLineHitRegion')[0];
			lesser1connectingLine.setPoints([lesser1.getX(), lesser1.getY(), ischial1Perpendicular.getX(), ischial1Perpendicular.getY()]);
			lesser1connectingLineHitRegion.setPoints([lesser1.getX(), lesser1.getY(), ischial1Perpendicular.getX(), ischial1Perpendicular.getY()]);

			var lesser2connectingLineHitRegion = group.find('.lesser2connectingLineHitRegion')[0];
			lesser2connectingLine.setPoints([lesser2.getX(), lesser2.getY(), ischial2Perpendicular.getX(), ischial2Perpendicular.getY()]);
			lesser2connectingLineHitRegion.setPoints([lesser2.getX(), lesser2.getY(), ischial2Perpendicular.getX(), ischial2Perpendicular.getY()]);

			var midPoint1 = ViewerHelper.calculateLineCenterPoint(lesser1connectingLine);
			ViewerHelper.moveLabel(ischial1PerpendicularlineLabel, midPoint1);
			var lesser1linelength = ViewerHelper.calculateLineLength(lesser1connectingLine);
			ischial1PerpendicularlineLabel.setAttr('pixelLength', lesser1linelength);

			var midPoint2 = ViewerHelper.calculateLineCenterPoint(lesser2connectingLine);
			ViewerHelper.moveLabel(ischial2PerpendicularlineLabel, midPoint2);
			var lesser2linelength = ViewerHelper.calculateLineLength(lesser2connectingLine);
			ischial2PerpendicularlineLabel.setAttr('pixelLength', lesser2linelength);

			var lenDiff = lesser2linelength - pointsShareSide * lesser1linelength;
			var reverseLenDiff = ((midPoint1.x < midPoint2.x) == isLeftLeg) == (lesser2.getY() > ischial2Perpendicular.getY());
			if (reverseLenDiff)
				lenDiff = -lenDiff;

			var midPoint = ViewerHelper.calculateLineCenterPoint(connectingLine);
			ViewerHelper.moveLabel(lesserlineLabel, midPoint);
			lesserlineLabel.setAttr('pixelLength', Math.round(Math.abs(lenDiff)));
			lesserlineLabel.setAttr('labelPrefix', isLeftLeg ? 'Left Leg is ' : 'Right Leg is ');
			lesserlineLabel.setAttr('labelPostfix', (lenDiff > 0) ? ' shorter' : ' longer');
			lesserlineLabel.setAttr('doubleClickFunc', HipToolsViewer.legLengthLabelDoubleClickFunc);

			connectingLine.setZIndex(0);

			HipToolsViewer.setCupInclinationLabel(viewer);

			HipToolsViewer.recalcOffsetLabel(viewer);
			layer.batchDraw();
			var templatesLayer = stage.find('.segmentAndTemplatelayer')[0];
			templatesLayer.batchDraw();
		}
	}

	static legLengthLabelDoubleClickFunc = function (label) {
		var group = label.parent;
		var specialSeparatorStr = ['mm longer', 'mm shorter'];
		var textNode = label.children[1];
		BasicToolsViewer.addEditLabelText(group, label.children[0], textNode, specialSeparatorStr);
	}


	static MoveTemplatesAccordingToSelectedAttachmentPoints = function (movableGroup, fixedGroup) {
		//Move stem to cup according to selected attachment points
		var movableAttachmentPointShape = HipToolsViewer.GetSelectedAttachmentPointShape(movableGroup);
		var fixedAttachmentPointShape = HipToolsViewer.GetSelectedAttachmentPointShape(fixedGroup);

		var moveToFixPoint_stemCoords = ViewerHelper.TranslatePointCoords(new PointF(0, 0), fixedAttachmentPointShape, movableGroup);
		var movableAttpoint_stemCoords = ViewerHelper.TranslatePointCoords(new PointF(0, 0), movableAttachmentPointShape, movableGroup);
		ViewerHelper.MoveObjectPointToPoint(movableGroup, movableAttpoint_stemCoords, moveToFixPoint_stemCoords);

		HipToolsViewer.MoveTemplateRotateCenterToSelectedAttachmentPoint(movableGroup);
	}

	static MoveTemplateRotateCenterToSelectedAttachmentPoint = function (templateGroup) {
		console.log("templateItemPartGroup rotation center is about to be changed to the selected attachment point location");
		var selectedAttachmentPointShape = HipToolsViewer.GetSelectedAttachmentPointShape(templateGroup);
		var rotationCentersList = templateGroup.find('.rotatecenter');
		var rotateCenter = rotationCentersList.filter(p => p.getParent() == templateGroup)[0]; //filter the children rotation center
		var moveToFixPoint_rotateCenterCoords = ViewerHelper.TranslatePointCoords(new PointF(0, 0), selectedAttachmentPointShape, rotateCenter);
		ViewerHelper.MoveObjectPointToPoint(rotateCenter, new PointF(0, 0), moveToFixPoint_rotateCenterCoords);
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

	static setCupInclinationLabel(viewer: Viewer) {
		var templatesLayer = viewer.getSegmentAndTemplatelayer();
		var templateGroups = templatesLayer.find('.templateGroup');
		
		if (templateGroups.length > 0) {
			var templateGroups = templateGroups.filter(g => g.attrs.shapeType == "Cups");

			//currently there is always one group for cups...
			for (var i = 0; i < templateGroups.length; i++) {
				var templateGroup = templateGroups[i];
				ViewerHelper.traverseContainer(templateGroup, function (child) {
					if (child.getAttr('cupVec')) HipToolsViewer.recalculateInclinationLabel(viewer, child);
				})

			}

		}
	}

	static recalculateInclinationLabel(viewer, templateItemGroup) {

		if (templateItemGroup.getAttr('cupVec') == null) {
			ViewerHelper.removeLabel(viewer, 'inclinationLabel', true)
			return;
		}
		var segmentAndTemplatelayer = viewer.segmentAndTemplatelayer;
		var shapeslayer = viewer.shapeslayer;
		var inclinationLabel = segmentAndTemplatelayer.find('.inclinationLabel')[0];
		//lld angle 
		var lldAngleDegree = 0;
		if (viewer.IsShapeExists(HipToolsViewer.LLDGroupName) && shapeslayer.findOne('.' + HipToolsViewer.LLDGroupName).isVisible()) {
			lldAngleDegree = HipToolsViewer.GetLLDAngleToXAxis(viewer).angleDegree;
		} else if (viewer.IsShapeExists(CorToolViewer.CORGroupName) && shapeslayer.findOne('.' + CorToolViewer.CORGroupName).isVisible()) {
			lldAngleDegree = CorToolViewer.GetCORLLDAngleToXAxis(viewer).angleDegree;
		}
		if (inclinationLabel) {
			//angle connectingline start position
			var connectinglineToLabel = segmentAndTemplatelayer.find('.connectinglineToLabel')[0];
			var cupLine = connectinglineToLabel.attrs.line;
			var implantImage = templateItemGroup.find('.templateimage')[0];
			var implantItem = templateItemGroup.getAttr('implantItem');
			var rotationAxisImplantImageCoords = implantItem.RotAxisImplantImageCoords;
			var rotationAxisSegmentAndTempLayerCoords = ViewerHelper.TranslatePointCoords(rotationAxisImplantImageCoords, implantImage, segmentAndTemplatelayer);
			cupLine.setPoints([rotationAxisSegmentAndTempLayerCoords.x, rotationAxisSegmentAndTempLayerCoords.y, rotationAxisSegmentAndTempLayerCoords.x, rotationAxisSegmentAndTempLayerCoords.y]);
//note: if dragged position remains
			var templateimageRect = ViewerHelper.getBoundingRect(templateItemGroup, 'boundingRect');
			//scale rect height to get proper position on different img resolutions
			var labelPositionX = viewer.imageOrientation.IsLeftBodyPart ? labelPositionX = -templateimageRect.height / 2 * templateItemGroup.scaleY() : templateimageRect.height / 2 * templateItemGroup.scaleY();
			var lablePosition = new PointF(labelPositionX, -templateimageRect.height / 2 * templateItemGroup.scaleY());
			var labelPositionOnImg = ViewerHelper.TranslatePointCoords(lablePosition, templateItemGroup.parent, segmentAndTemplatelayer);
			//add logic to calculate angle
			var existingAngle = MathL.CalcRotationMatrixAngle(templateItemGroup.getAbsoluteTransform().m);
			
			var inclinationAngle;

			var implantImageAngle = 45;
			if (viewer.imageOrientation.IsLeftBodyPart) implantImageAngle = -45;

			if (templateItemGroup.getAttr('cupVec') != null) {
				implantImageAngle = Math.round(MathL.CalcVectorDirectionAngleNoFlip(templateItemGroup.getAttr('cupVec')));
			}

			inclinationAngle = Math.abs(implantImageAngle + Math.round(existingAngle + lldAngleDegree))

			if (inclinationAngle > 180) inclinationAngle = 360 - inclinationAngle;
			if (inclinationAngle > 90) inclinationAngle = 180 - inclinationAngle;

			inclinationLabel.find('.inclinationLabelText')[0].setText(inclinationAngle + "\u00B0");
			// * 180 / Math.PI
			ViewerHelper.moveLabel(inclinationLabel, labelPositionOnImg);
		} else {
			HipToolsViewer.initInclanationLabel(viewer, templateItemGroup);
		}

	}

	static initInclanationLabel(viewer, templateItemGroup) {

		if (templateItemGroup.getAttr('cupVec') == null) return;

		if ((!viewer.shapeslayer.findOne('.' + HipToolsViewer.LLDGroupName) || !viewer.shapeslayer.findOne('.' + HipToolsViewer.LLDGroupName).isVisible())
			&& (!viewer.shapeslayer.findOne('.' + CorToolViewer.CORGroupName) || !viewer.shapeslayer.findOne('.' + CorToolViewer.CORGroupName).isVisible()
			)) return;
		var color = "#ed145b"; //original pink red
		if (viewer.IsShapeExists(HipToolsViewer.LLDGroupName) || viewer.IsShapeExists(CorToolViewer.CORGroupName)) {
			var cupLine = new Konva.Line({
				stroke: color,
				strokeWidth: 1,
				lineCap: 'round',
				lineJoin: 'round',
				name: 'cupLine',

			})
			cupLine.visible('inherit');
			//cup coordinates
			var cupRotPoint = new PointF(0, 0);
			//image coordinates
			var labelConectPoint = ViewerHelper.TranslatePointCoords(cupRotPoint, templateItemGroup.parent, viewer.segmentAndTemplatelayer);
			cupLine.setPoints([labelConectPoint.x, labelConectPoint.y, labelConectPoint.x, labelConectPoint.y,]);

			var inclinationLabel = ViewerHelper.addLabel(viewer.segmentAndTemplatelayer, 'inclinationLabel', color, cupLine);
			HipToolsViewer.recalculateInclinationLabel(viewer, templateItemGroup);
		}
	}

	static GetLLDAngleToXAxis = function (viewer) {
		var hasLLD = viewer.IsShapeExists(HipToolsViewer.LLDGroupName);
		var angle = null;

		if (hasLLD) {
			var lldGroup = viewer.shapeslayer.find('.' + HipToolsViewer.LLDGroupName)[0];
			var p1X = lldGroup.find('.ischial1')[0].getX();
			var p1Y = lldGroup.find('.ischial1')[0].getY();
			var p2X = lldGroup.find('.ischial2')[0].getX();
			var p2Y = lldGroup.find('.ischial2')[0].getY();

			if (p1X < p2X) {
				angle = MathL.CalcAngle(new PointF(p2X, p2Y), new PointF(p1X + 100, p1Y), new PointF(p1X, p1Y));
			}
			else {
				angle = MathL.CalcAngle(new PointF(p1X, p1Y), new PointF(p2X + 100, p2Y), new PointF(p2X, p2Y));
			}
		}

		return angle;
	}

	GetLLDAngleToXAxis = function () {
		var viewer = this.viewer;
		var hasLLD = viewer.IsShapeExists(HipToolsViewer.LLDGroupName);
		var angle = null;

		if (hasLLD) {
			var lldGroup = viewer.shapeslayer.find('.' + HipToolsViewer.LLDGroupName)[0];
			var p1X = lldGroup.find('.ischial1')[0].getX();
			var p1Y = lldGroup.find('.ischial1')[0].getY();
			var p2X = lldGroup.find('.ischial2')[0].getX();
			var p2Y = lldGroup.find('.ischial2')[0].getY();

			if (p1X < p2X) {
				angle = MathL.CalcAngle(new PointF(p2X, p2Y), new PointF(p1X + 100, p1Y), new PointF(p1X, p1Y));
			}
			else {
				angle = MathL.CalcAngle(new PointF(p1X, p1Y), new PointF(p2X + 100, p2Y), new PointF(p2X, p2Y));
			}
		}

		return angle;
	}

	static getCupVectorFromSpecialPoints(cupItem: DTOImplantItem): any {
		var cupVec = null;

		if (cupItem.SpecialHiddenPoints.length == 0) return cupVec;
		var points = cupItem.SpecialHiddenPoints;
		var distEdgePoints = points.filter(pt => pt.AttachmentPointName.toLowerCase().indexOf('distedge') > -1);
		var neckPoints = points.filter(pt => pt.AttachmentPointName.toLowerCase().indexOf('neck') > -1)
		if (distEdgePoints.length > 1) {
			var cupVec = MathL.SubtractPoints(distEdgePoints[0].LocationImplantImageCoords, distEdgePoints[1].LocationImplantImageCoords);
			//translate vect to image coord?
		} else if (neckPoints.length > 1) {
			var neckVec = MathL.SubtractPoints(neckPoints[0].LocationImplantImageCoords, neckPoints[1].LocationImplantImageCoords);
			var cupVec = neckVec.getNormal();
		}
		return cupVec;
	}

	static GetAdditionalAnchorsOnSegmentMove = function (SegmentGroup:any, shapeslayer:any, attachedAnchors:any) {
		var shapesToMoveWIthSegment = [CorToolViewer.FemAxisGroupName];

		ViewerHelper.traverseContainer(shapeslayer, function (child:any) {
			if (child.getAttr('shapeType') == 'Anchor') {
				if (shapesToMoveWIthSegment.indexOf(child.parent.getAttr('name')) != -1) {

					var locInSegment = ViewerHelper.TranslatePointCoords(new PointF(0, 0), child, SegmentGroup);
					var addAnchor = true;
					for (var i = 0; i < attachedAnchors.length; i++) {
						if (attachedAnchors[i].anchor.index == child.index)
							addAnchor = false;
					}
					if (addAnchor)
						attachedAnchors.push({ anchor: child, locSegmentCoords: locInSegment });
				}
			}
		});

		return attachedAnchors;
	}


}