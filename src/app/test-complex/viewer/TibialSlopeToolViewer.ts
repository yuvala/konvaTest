//// <reference path="../Declaretions.ts" />

'use strict';

interface ITibialSlopeToolViewer {

	SetTibialSlopeTool(shapeName: string, strokeColor: any, isLeft: boolean, imageAutoKneeData: any): void;
	SetShowTibialSlop(show: boolean): void;
    getReport(container: any): any;
    SetTibialSlopeToolFromSWIP(swipItem: any, isLeftBodyPart: boolean): void;
}

// *** comment code is because we do not need label dgree (for now) ***

class TibialSlopeToolViewer implements ITibialSlopeToolViewer  {

	private viewer;
	static setDrawData;
	static isLeft;
	static TibialeSlopeGroupName;

	constructor(viewer: IViewer) {
		this.viewer = viewer;
	}

	// helping  functions start
	buildShape = function (shapeName) {
		// create group and sub groups
		var _this = this;
        var group = this.createGroup(shapeName, true);
        group.setAttr('getSWIP', this.getSWIP);
		var angleLineSubGroup = this.createGroup('angleLineSubGroup', false);
		var bottomLineSubGroup = this.createGroup('bottomLineSubGroup', false);
		var upperLineSubGroup = this.createGroup('upperLineSubGroup', false);
		var OnBeforeDeleteSubGroup = function (shape) {
			_this.viewer.RemoveShape(shape.parent);

		}
		angleLineSubGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteSubGroup);
		upperLineSubGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteSubGroup);
		bottomLineSubGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteSubGroup);
	
		angleLineSubGroup.on("dragmove dragend", function (e) {
			TibialSlopeToolViewer.angleLineConnectFunction(angleLineSubGroup, 'red');
		});
		bottomLineSubGroup.on("dragmove dragend", function (e) {
			TibialSlopeToolViewer.bottomLineConnectFunction(bottomLineSubGroup, 'red');
		});

		upperLineSubGroup.on("dragmove dragend", function (e) {
			TibialSlopeToolViewer.upperLineConnectFunction(upperLineSubGroup, 'red');
		});

		// add Connecting Lines 
		var angleLine = ViewerHelper.addConnectingLine(angleLineSubGroup, 'angleLine');
		var bottomLine = ViewerHelper.addConnectingLine(bottomLineSubGroup, 'bottomLine');
		var upperLine = ViewerHelper.addConnectingLine(upperLineSubGroup, 'upperLine');
		var middleLine = ViewerHelper.addConnectingLine(group, 'middleLine');
		var centerPoint = ViewerHelper.addConnectingLine(group, 'centerPoint');
		//ViewerHelper.addLabelWithDirection(group, 'label', '#ed145b', angleLine, 'left');
		this.viewer.shapeslayer.add(group)
		group.add(angleLineSubGroup);
		group.add(bottomLineSubGroup);
		group.add(upperLineSubGroup);
	
		
		return group;

	}
	createGroup = function (groupName:string, isGetReport:boolean) {
		var group = new Konva.Group({
			name: groupName,
            draggable: true,
		});
		if (isGetReport) {
			group.setAttr('getReport', this.getReport);
        }
        
		return group
	}
	getReport = function (container) {
		if (!container.isVisible()) return null;
		var label = container.find('.label')[0];
		if (label) {
			var angleValue = label.getText().text();
			var tibialSlopeReport = new DTOMeasurmentToolInfo;
			tibialSlopeReport.ToolName = 'Tibial Slope';
			tibialSlopeReport.ToolValues = [new KeyValuePair('angle', angleValue)];
			return tibialSlopeReport;
		}
		return null;
	}
	connectTibialSlopeTool = function (group, strokeColor) {

		// *** get  elements ***
		var layer = group.getLayer();
		var stage = group.getStage();
		var dicomimg = stage.findOne('.dicomimg');
		var imgLayer = stage.children.find('.imglayer')[0];
		var imageSizeVector = ViewerHelper.TranslateVectorCoords(new PointF(dicomimg.getWidth(), dicomimg.getHeight()), dicomimg, imgLayer);
		var imageStartPt = ViewerHelper.TranslatePointCoords(new PointF(dicomimg.getX(), dicomimg.getY()), dicomimg, imgLayer);
		var angleLineSubGroup = group.findOne('.angleLineSubGroup');
		var upperLineSubGroup = group.findOne('.upperLineSubGroup');
		var bottomLineSubGroup = group.findOne('.bottomLineSubGroup');

		var bottomLineP1 = group.find('.bottomLineP1')[0];
		var bottomLineP2 = group.find('.bottomLineP2')[0];
		var upperLineP1 = group.find('.upperLineP1')[0];
		var upperLineP2 = group.find('.upperLineP2')[0];
		var angleLineP1 = group.find('.angleLineP1')[0];
		var angleLineP2 = group.find('.angleLineP2')[0];
		// from sub group coords to MainGroup coords
		var bottomLineP1_groupCoords = ViewerHelper.TranslatePointCoords({ x: bottomLineP1.getX(), y: bottomLineP1.getY() }, bottomLineSubGroup, group);
		var bottomLineP2_groupCoords = ViewerHelper.TranslatePointCoords({ x: bottomLineP2.getX(), y: bottomLineP2.getY() }, bottomLineSubGroup, group);
		var upperLineP1_groupCoords = ViewerHelper.TranslatePointCoords({ x: upperLineP1.getX(), y: upperLineP1.getY() }, upperLineSubGroup, group);
		var upperLineP2_groupCoords = ViewerHelper.TranslatePointCoords({ x: upperLineP2.getX(), y: upperLineP2.getY() }, upperLineSubGroup, group);
		var angleLineP1_groupCoords = ViewerHelper.TranslatePointCoords({ x: angleLineP1.getX(), y: angleLineP1.getY() }, angleLineSubGroup, group);
		var angleLineP2_groupCoords = ViewerHelper.TranslatePointCoords({ x: angleLineP2.getX(), y: angleLineP2.getY() }, angleLineSubGroup, group);

		var middleLine = group.find('.middleLine')[0];
		var middleLineHitRegion = group.find('.middleLineHitRegion')[0];
		middleLineHitRegion.on("click dragstart", function (e) {
			angleLineSubGroup.attrs.selected = true;
			upperLineSubGroup.attrs.selected = true;
			bottomLineSubGroup.attrs.selected = true;
			var layer = group.getLayer();
			layer.draw();
		});

		var upperLine = group.find('.upperLine')[0];
		var upperLineHitRegion = group.find('.upperLineHitRegion')[0];
		var bottomLine = group.find('.bottomLine')[0];
		var bottomLineHitRegion = group.find('.bottomLineHitRegion')[0];
		var angleLine = group.find('.angleLine')[0];
		var angleLineHitRegion = group.find('.angleLineHitRegion')[0];
		var centerPoint = group.find('.centerPoint')[0];
		var label = group.find('.label')[0];

		bottomLine.setPoints([bottomLineP1.getX(), bottomLineP1.getY(), bottomLineP2.getX(), bottomLineP2.getY()]);
		bottomLineHitRegion.setPoints([bottomLineP1.getX(), bottomLineP1.getY(), bottomLineP2.getX(), bottomLineP2.getY()]);
		upperLine.setPoints([upperLineP1.getX(), upperLineP1.getY(), upperLineP2.getX(), upperLineP2.getY()]);
		upperLineHitRegion.setPoints([upperLineP1.getX(), upperLineP1.getY(), upperLineP2.getX(), upperLineP2.getY()]);

		angleLine.setPoints([angleLineP1.getX(), angleLineP1.getY(), angleLineP2.getX(), angleLineP2.getY()]);
		angleLineHitRegion.setPoints([angleLineP1.getX(), angleLineP1.getY(), angleLineP2.getX(), angleLineP2.getY()]);
		var angleLineMidPoint = MathL.GetMiddlePt({ x: angleLineP1_groupCoords.x, y: angleLineP1_groupCoords.y }, { x: angleLineP2_groupCoords.x, y: angleLineP2_groupCoords.y });
		var upperMiddlePoint = MathL.GetMiddlePt({ x: upperLineP1_groupCoords.x, y: upperLineP1_groupCoords.y }, { x: upperLineP2_groupCoords.x, y: upperLineP2_groupCoords.y });
		var bottomMiddlePoint = MathL.GetMiddlePt({ x: bottomLineP1_groupCoords.x, y: bottomLineP1_groupCoords.y }, { x: bottomLineP2_groupCoords.x, y: bottomLineP2_groupCoords.y });

		if (bottomMiddlePoint < upperMiddlePoint) {
			var temp = bottomLine;
			var tempHitRegion = bottomLineHitRegion;

			bottomLine = upperLine;
			bottomLineHitRegion = upperLineHitRegion;

			upperLine = temp;
			upperLineHitRegion = tempHitRegion
		}
		// middleLine - init
		middleLine.setPoints([bottomMiddlePoint.x, bottomMiddlePoint.y, upperMiddlePoint.x, upperMiddlePoint.y]);

		// extending middle 
		var vectorPt1G = new Vec2(upperMiddlePoint.x, upperMiddlePoint.y);
		var vectorPt2G = new Vec2(bottomMiddlePoint.x, bottomMiddlePoint.y);

		var vectorPt1 = ViewerHelper.TranslatePointCoords(vectorPt1G, group, imgLayer);
		var vectorPt2 = ViewerHelper.TranslatePointCoords(vectorPt2G, group, imgLayer);

		var middleLineDir = new Vec2(vectorPt1.x - vectorPt2.x, vectorPt1.y - vectorPt2.y);
		var middleLineDirInv = new Vec2(-1 * middleLineDir.x, -1 * middleLineDir.y);

		var axisIntersactionPoint = MathL.calcIntersectionWithRect(vectorPt1, middleLineDir, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));
		var edgeIntersactionPoint = MathL.calcIntersectionWithRect(vectorPt2, middleLineDirInv, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));
		axisIntersactionPoint = ViewerHelper.TranslatePointCoords(axisIntersactionPoint, imgLayer, group);
		edgeIntersactionPoint = ViewerHelper.TranslatePointCoords(edgeIntersactionPoint, imgLayer, group);

		// middleLine extended bottom
		middleLine.setPoints([edgeIntersactionPoint.x, edgeIntersactionPoint.y, bottomMiddlePoint.x, bottomMiddlePoint.y]);
		middleLineHitRegion.setPoints([edgeIntersactionPoint.x, edgeIntersactionPoint.y, bottomMiddlePoint.x, bottomMiddlePoint.y]);

		var middleLineStratPoint = { x: Math.round(middleLine.getPoints()[0]), y: Math.round(middleLine.getPoints()[1]) };
		var middleLineEndPoint = { x: Math.round(middleLine.getPoints()[2]), y: Math.round(middleLine.getPoints()[3]) };
		var angleLineStartPoint = { x: Math.round(angleLineP1_groupCoords.x), y: Math.round(angleLineP1_groupCoords.y) };
		var angleLineEndPoint = { x: Math.round(angleLineP2_groupCoords.x), y: Math.round(angleLineP2_groupCoords.y) };

		// middleLine extended top

		var angleLineMiddleLineintersection = MathL.calcLinesIntersection(middleLineStratPoint, middleLineEndPoint, angleLineStartPoint, angleLineEndPoint);
		angleLineMiddleLineintersection = ViewerHelper.TranslatePointCoords(angleLineMiddleLineintersection, group, imgLayer);
	
		var isPointInImage = MathL.IsPointInSquare(new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y), angleLineMiddleLineintersection)
		var extedPoint;
		if (isPointInImage) {

			extedPoint = ViewerHelper.TranslatePointCoords(angleLineMiddleLineintersection, imgLayer, group);

			if (extedPoint.y > bottomMiddlePoint.y || extedPoint.y > upperMiddlePoint.y) {
				if (bottomMiddlePoint.y < upperMiddlePoint.y) {
					extedPoint = bottomMiddlePoint;
				} else {
					extedPoint = upperMiddlePoint;
				}
			}
		} else {
			if (bottomMiddlePoint.y < upperMiddlePoint.y) {
				extedPoint = bottomMiddlePoint;
			} else {
				extedPoint = upperMiddlePoint;
			}
		}

		middleLine.setPoints([Math.round(middleLineStratPoint.x), Math.round(middleLineStratPoint.y), Math.round(extedPoint.x), Math.round(extedPoint.y)]);
		middleLineHitRegion.setPoints([Math.round(middleLineStratPoint.x), Math.round(middleLineStratPoint.y), Math.round(extedPoint.x), Math.round(extedPoint.y)]);
		// update variables
		middleLineStratPoint = { x: Math.round(middleLine.getPoints()[0]), y: Math.round(middleLine.getPoints()[1]) };
		middleLineEndPoint = { x: Math.round(extedPoint.x), y: Math.round(extedPoint.y) };


		// intersectsPoint and angleDataText
		var intersectsPoint;
		var angleDataText;
	
		if (angleLine.attrs.points && middleLine.attrs.points) {
			intersectsPoint = MathL.calcLinesIntersection(middleLineStratPoint, middleLineEndPoint, angleLineStartPoint, angleLineEndPoint);
			if (intersectsPoint) {
				centerPoint.setPoints([intersectsPoint.x, intersectsPoint.y,
				intersectsPoint.x, intersectsPoint.y])
				if (TibialSlopeToolViewer.isLeft) {
					var angleData = MathL.CalcAngle(angleLineStartPoint, middleLineStratPoint, intersectsPoint);
				} else {
					var angleData = MathL.CalcAngle(angleLineEndPoint, middleLineStratPoint, intersectsPoint);
				}
				angleDataText = Math.round(angleData.absAngleDegree) + "\u00B0";

				var arc = group.findOne('.arc');
				if (!arc) {
					arc = new Konva.Shape({

						sceneFunc: function (context) {

							var x = this.getX();
							var y = this.getY();
							var startAngle = this.getAttrs().startAngle;
							var endAngle = this.getAttrs().endAngle;
							var radius = this.getAttrs().radius;
							if (x != null && y != null && startAngle != null && endAngle != null) {
								context.beginPath();
								context.arc(x, y, radius, startAngle, endAngle, false);
								context.strokeShape(this);
							}
						},
						hitFunc: function (context) {
							var x = this.getX();
							var y = this.getY();
							var startAngle = this.getAttrs().startAngle;
							var endAngle = this.getAttrs().endAngle;
							var radius = this.getAttrs().radius;
							if (x != null && y != null && startAngle != null && endAngle != null) {
								context.beginPath();
								context.arc(x, y, radius, startAngle, endAngle, false);
								context.closePath();
								context.fill(this);
							}
						},
						//startAngle: 20,
						//endAngle: 70,
						//   radius:70,
						stroke: 'white',
						strokeWidth: 4,
						name: 'arc'

					});
					group.add(arc);

				}
				arc.setX(intersectsPoint.x / 2);
				arc.setY(intersectsPoint.y / 2);
				arc.getAttrs().startAngle = angleData.theta1;
				arc.getAttrs().endAngle = angleData.theta2;


				var connectingLine1 = new Konva.Line({ points: [angleLineStartPoint.x, angleLineStartPoint.y, intersectsPoint.x, intersectsPoint.y] });
				var connectingLine1HitRegion = new Konva.Line({ points: [angleLineStartPoint.x, angleLineStartPoint.y, intersectsPoint.x, intersectsPoint.y] });
				var connectingLine2 = new Konva.Line({ points: [intersectsPoint.x, intersectsPoint.y, middleLineEndPoint.x, middleLineEndPoint.y] });
				var connectingLine2HitRegion = new Konva.Line({ points: [intersectsPoint.x, intersectsPoint.y, middleLineEndPoint.x, middleLineEndPoint.y] });
				arc.getAttrs().radius = 100;

			}
	
			// TibialSlopeToolViewer.removeLabel(group);
		}
		// label handling 


		if (!label) {
			var anchors = {
				bottomLineP1: bottomLineP1.getPosition(),
				bottomLineP2: bottomLineP2.getPosition(),
				upperLineP1: upperLineP1.getPosition(),
				upperLineP2: upperLineP2.getPosition(),
				angleLineP1: angleLineP1.getPosition(),
				angleLineP2: angleLineP2.getPosition()
			}
			label = TibialSlopeToolViewer.addLabel(group, anchors);
			TibialSlopeToolViewer.makeLabelEditable(group);

			//label = group.find('.label')[0];
		} else { 
			var connectinglineToLabel = group.findOne(".connectinglineToLabel");
			var connectinglinePoints = connectinglineToLabel.getPoints();
			connectinglineToLabel.setPoints([intersectsPoint.x, intersectsPoint.y, connectinglinePoints[2], connectinglinePoints[3]])
		}
		
		var textNode = TibialSlopeToolViewer.handleEditableLabel(label, angleDataText);
		label.find('Text')[0].children[1]= textNode;
		
		var shapeLines = {
			middleLine: middleLine,
			middleLineHitRegion: middleLineHitRegion,
			bottomLine: bottomLine,
			bottomLineHitRegion: bottomLineHitRegion,
			upperLine: upperLine,
			upperLineHitRegion: upperLineHitRegion,
			angleLine: angleLine,
			angleLineHitRegion: angleLineHitRegion,
			label: label
		}
		// *** handleEditableLabel - make editable comment separated from degree text ***		
		// draw  tool
		TibialSlopeToolViewer.drawShape(layer, shapeLines)
	}

	static drawShape = function (layer, shapeLines) {

		shapeLines.upperLine.setZIndex(0);
		shapeLines.upperLineHitRegion.setZIndex(1);
		shapeLines.bottomLine.setZIndex(0);
		shapeLines.bottomLineHitRegion.setZIndex(1);
		shapeLines.middleLine.setZIndex(0);
		shapeLines.middleLineHitRegion.setZIndex(1);
		shapeLines.angleLine.setZIndex(0);
		shapeLines.angleLineHitRegion.setZIndex(0);
		//shapeLines.label.zIndex(2);
		shapeLines.label.setZIndex(2);
		layer.batchDraw();
	}
	static createAnchors = function (/*x, y,*/ drawData, toolLegsOffset, imageRect) {
		// connectFunction will be  used only  in event listenr

		var group = drawData.group;
		var angleLineSubGroup = drawData.group.findOne('.angleLineSubGroup');
		var bottomLineSubGroup = drawData.group.findOne('.bottomLineSubGroup');
		var upperLineSubGroup = drawData.group.findOne('.upperLineSubGroup');

		var x;
		var y;
		var tibialSlopeDirection;
		var width;
		if (drawData.imageAutoKneeData && drawData.imageAutoKneeData.TibiaData) {
			x = drawData.imageAutoKneeData.TibiaData.TibialPlateauCenter.x;
			y = drawData.imageAutoKneeData.TibiaData.TibialPlateauCenter.y;
			tibialSlopeDirection = drawData.imageAutoKneeData.TibiaData.TibialSlopeDirection;
			width = drawData.viewer.MM2Pixels(drawData.imageAutoKneeData.TibiaData.TibialPlateauWidth);
		}else {
			x = drawData.imageWidth / 2 - 150;
			y = drawData.imageHeight / 2;
			tibialSlopeDirection = { x: 0.9, y: -0.1 };
			width = 300;
		}

		// angle line ancors
		var tibialPlateauCenterVec = new Vec2(x, y);
		var tibialSlopeDirectionVec = new Vec2(tibialSlopeDirection.x, tibialSlopeDirection.y);
		var halfPlateaWidth = width / 2;
		var dirMultiSizeVec = tibialSlopeDirectionVec.mulS(halfPlateaWidth);
		var anc6 = tibialPlateauCenterVec.addV(dirMultiSizeVec);
		var anc5 = tibialPlateauCenterVec.subV(dirMultiSizeVec);
		var angleLineVec = anc6.subV(anc5);
		var angleLineFifth = MathL.GetWeightedMidPt(anc5, anc6 , 0.20);
		var angleLineFifthVec = new Vec2(angleLineFifth.x, angleLineFifth.y);
		var angleLineFourFifths = MathL.GetWeightedMidPt(anc5, anc6, 0.80);
		var angleLineFourFifthsVec = new Vec2(angleLineFourFifths.x, angleLineFourFifths.y);
		var referencePoint;
		var rotationAngle;

		TibialSlopeToolViewer.isLeft ? referencePoint = angleLineFourFifthsVec : referencePoint = angleLineFifthVec ;
		TibialSlopeToolViewer.isLeft ? rotationAngle = 10 : rotationAngle = -10;

		//referencePoint.y = referencePoint.y + 2 * toolLegsOffset

		// rotate degree 180 to make line go down instad of up
		var centerVec = angleLineVec.getNormal().rotateDegrees(180 + rotationAngle).normalize(); // 80 degrees rotated
		var centerPt1 = referencePoint.addV(centerVec.mulS(2 * toolLegsOffset));
		var centerPt2 = referencePoint.addV(centerVec.mulS(3 * toolLegsOffset));
		// var centerLineVec = referencePoint.subV(centerLine);
		// var relativetibialSlopeXDirection = tibialSlopeDirection.x / tibialSlopeDirection.y;
		// var relativetibialSlopeYDirection = tibialSlopeDirection.y / tibialSlopeDirection.x;
		// var centerLineNormal = centerLine.getNormal().normalize().mulS(width * 0.4);

		//referencePoint.x + referencePointNormal.x;
		//referencePoint.y - referencePointNormal.y;

		var anc4 = centerPt1.addV(centerVec.getNormal().mulS(width * 0.3));
		var anc3 = centerPt1.addV(centerVec.getNormal().mulS(-width * 0.3));
		var anc2 = centerPt2.addV(centerVec.getNormal().mulS(width * 0.3));
		var anc1 = centerPt2.addV(centerVec.getNormal().mulS(-width * 0.3));




		// var anchor1 = Viewer.addAnchor(drawData.group, x, y, "bottomLineP1", drawData.connectFunction);
		var bottomLineP1 = Viewer.addAnchor(bottomLineSubGroup, anc1.x, anc1.y, "bottomLineP1", TibialSlopeToolViewer.bottomLineConnectFunction);
		// var anchor2 = Viewer.addAnchor(group, anchor2x, y, "bottomLineP2", drawData.connectFunction); // connectFunction anchor  adding
		var bottomLineP2 = Viewer.addAnchor(bottomLineSubGroup, anc2.x, anc2.y, "bottomLineP2", TibialSlopeToolViewer.bottomLineConnectFunction);
		// var anchor3 = Viewer.addAnchor(group, x, anchor3y, "upperLineP1", drawData.connectFunction);
		var upperLineP1 = Viewer.addAnchor(upperLineSubGroup, anc3.x, anc3.y, "upperLineP1", TibialSlopeToolViewer.upperLineConnectFunction);
		// var anchor4 = Viewer.addAnchor(group, anchor4x, anchor4y, "upperLineP2", drawData.connectFunction);
		var upperLineP2 = Viewer.addAnchor(upperLineSubGroup, anc4.x, anc4.y, "upperLineP2", TibialSlopeToolViewer.upperLineConnectFunction);
		var angleLineP1 = Viewer.addAnchor(angleLineSubGroup, anc5.x, anc5.y, "angleLineP1", TibialSlopeToolViewer.angleLineConnectFunction);
		var angleLineP2 = Viewer.addAnchor(angleLineSubGroup, anc6.x, anc6.y, "angleLineP2", TibialSlopeToolViewer.angleLineConnectFunction);
		var anchors = {
			bottomLineP1: bottomLineP1,
			bottomLineP2: bottomLineP2,
			upperLineP1: upperLineP1,
			upperLineP2: upperLineP2,
			angleLineP1: angleLineP1,
			angleLineP2: angleLineP2
		}
		return anchors
	}
	static angleLineConnectFunction = function (group, strokeColor) {
		//angleLineConnectFunction
		var angleLine = group.find('.angleLine')[0];
		var angleLineHitRegion = group.find('.angleLineHitRegion')[0];
		var angleLineP1 = group.find('.angleLineP1')[0];
		var angleLineP2 = group.find('.angleLineP2')[0];
		 angleLine.setPoints([angleLineP1.getX(), angleLineP1.getY(), angleLineP2.getX(), angleLineP2.getY()]);
		 angleLineHitRegion.setPoints([angleLineP1.getX(), angleLineP1.getY(), angleLineP2.getX(), angleLineP2.getY()]);
	}
	static bottomLineConnectFunction = function (group, strokeColor) { 
		//angleLineConnectFunction
		var bottomLine = group.find('.bottomLine')[0];
		var bottomLineHitRegion = group.find('.bottomLineHitRegion')[0];
		var bottomLineP1 = group.find('.bottomLineP1')[0];
		var bottomLineP2 = group.find('.bottomLineP2')[0];
		bottomLine.setPoints([bottomLineP1.getX(), bottomLineP1.getY(), bottomLineP2.getX(), bottomLineP2.getY()]);
		bottomLineHitRegion.setPoints([bottomLineP1.getX(), bottomLineP1.getY(), bottomLineP2.getX(), bottomLineP2.getY()]);
	}
	static upperLineConnectFunction = function (group, strokeColor) {
		//angleLineConnectFunction
		var upperLine = group.find('.upperLine')[0];
		var upperLineHitRegion = group.find('.upperLineHitRegion')[0];
		var upperLineP1 = group.find('.upperLineP1')[0];
		var upperLineP2 = group.find('.upperLineP2')[0];
		upperLine.setPoints([upperLineP1.getX(), upperLineP1.getY(), upperLineP2.getX(), upperLineP2.getY()]);
		upperLineHitRegion.setPoints([upperLineP1.getX(), upperLineP1.getY(), upperLineP2.getX(), upperLineP2.getY()]);
	}
	//param on hold x, y, 
	static onSetDrawPointStart = function (setDrawData, swipData = null) {
		// strat drawing to tool
		var stageWidth = setDrawData.stage.getWidth();
		var stageHeight = setDrawData.stage.getHeight();
		var screenStartOnImgCoords = MathL.TranslateScreenPointToImagePoint(setDrawData.viewer.img, new PointF(0, 0));
		var screenEndOnImgCoords = MathL.TranslateScreenPointToImagePoint(setDrawData.viewer.img, new PointF(stageWidth, stageHeight));
		var imageRect = RectangleF.CreateFromPoints(screenStartOnImgCoords, screenEndOnImgCoords).Intersect(RectangleF.CreateFromPoints(new PointF(0, 0), new PointF(setDrawData.imageWidth, setDrawData.imageHeight)));

        TibialSlopeToolViewer.toolLegsOffset = Math.min(imageRect.width, imageRect.height) / 8;
        var anchors = null;
		//x, y,
        if (swipData) {
            anchors = TibialSlopeToolViewer.createAnchorsFromSWIP(setDrawData, swipData, imageRect);
        }
        else {
            anchors = TibialSlopeToolViewer.createAnchors(setDrawData, TibialSlopeToolViewer.toolLegsOffset, imageRect);
        }
		setDrawData.connectFunction(setDrawData.group, setDrawData.strokeColor);
		setDrawData.group.attrs.selected = true;
		setDrawData.stage.getLayers().off("mousedown");
		setDrawData.stage.getLayers().off("touchstart");
		setDrawData.viewer.SetDeActivateViewerMouseState();
		setDrawData.viewer.shapeslayer.drawScene();
    }

	static removeLabel = function (group) {
		if (group.findOne(".label")) {
			group.findOne(".label").destroy();
			group.findOne(".connectinglineToLabel").destroy();
			group.findOne(".arc").destroy();
		}
    }

	static makeLabelEditable = function (group) {
		// make label editable
		//var middleGroup = group.find('.middleGroup')[0];
		var label = group.find(".label")[0];
		if (label) {
			//var textNode = label.children[1];
			label.setAttr('doubleClickFunc', BasicToolsViewer.labelDoubleClickFunc);
			//textNode.on('click touch tap', () => {
			//	BasicToolsViewer.addEditLabelText(group, label.children[0], textNode);
			//});
		}
	}

	//static labelDoubleClickFunc = function (label) {
	//	var textNode = label.children[1];
	//	var group = label.parent;
	//	BasicToolsViewer.addEditLabelText(group, label.children[0], textNode);
	//}


	static handleEditableLabel = function (label, angleDataText) {
		var textNode = label.children[1];
		if (!textNode._partialText) {
			textNode['_partialText'] = angleDataText;
			textNode['textArr'][0].text = angleDataText;
		}
		else {
			if (textNode._partialText.indexOf(' ') > 0) {
				var oldDegreeText = textNode._partialText.substr(0, textNode._partialText.indexOf(' '));
				textNode['_partialText'] = textNode._partialText.replace(oldDegreeText, angleDataText);
			} else {
				textNode['_partialText'] = angleDataText;
			}
		}
		textNode.text(textNode['_partialText']);
		return textNode;//BasicToolsViewer.handleEditableLabel(label, angleDataText);
	}
	static addLabel = function (group, anchors) {
		var centerPoint = group.findOne('.centerPoint');

		//var startingPoint = { x: (anchors.angleLineP1.x + anchors.upperLineP2.x) / 2, y: anchors.angleLineP1.y }
		var labelPoint = { x: centerPoint.attrs.points[0] - 200, y: centerPoint.attrs.points[1] + 200 }
		if (!TibialSlopeToolViewer.isLeft) {
			labelPoint = { x: centerPoint.attrs.points[0] + 200, y: centerPoint.attrs.points[1] + 200 };
		} 

		var label = ViewerHelper.addLabelWithDirection(group, 'label', '#ed145b', centerPoint, 'left');
		//var label = group.findOne('.label');
		ViewerHelper.moveLabel(label, labelPoint)
		return label;
	}
	static toolLegsOffset;

	// helping functions end
	SetTibialSlopeTool = function (shapeName: string, strokeColor: any, isLeft: boolean, imageAutoKneeData) {
		// init params
		TibialSlopeToolViewer.isLeft = isLeft;
		TibialSlopeToolViewer.TibialeSlopeGroupName = shapeName;
		var group = this.buildShape(shapeName);
		TibialSlopeToolViewer.setDrawData = {
			imageWidth: this.viewer.originalImageWidth,
			imageHeight: this.viewer.originalImageHeight,
			strokeColor: strokeColor,
			group: group,
			stage: group.getStage(),
			connectFunction: this.connectTibialSlopeTool,
			viewer: this.viewer,
			imageAutoKneeData: imageAutoKneeData
		}

		this.viewer.SetViewerMouseState(shapeName);
	
		var _this = this;
		group.on("dragmove dragend", function () {
			_this.connectTibialSlopeTool(group, 'red');
		});
		// listen to event
		//TibialSlopeToolViewer.setDrawData.stage.getLayers().on("mousedown touchstart", function (e) {
			//e.evt.preventDefault()
			//e.evt.stopPropagation()
			//var layerCoords = ViewerHelper.getOffset(e.evt);
			//var imgcoords = MathL.TranslateScreenPointToImagePoint(TibialSlopeToolViewer.setDrawData.viewer.imglayer, layerCoords);
			// TibialSlopeToolViewer.onSetDrawPointStart(imgcoords.x, imgcoords.y,TibialSlopeToolViewer.setDrawData);
		//});
		TibialSlopeToolViewer.onSetDrawPointStart(TibialSlopeToolViewer.setDrawData);
	}
	static GetTextToolDialog = function (ViewerElementID) {
		var dialog = $("#" + ViewerElementID).parent().find('.texttool-dialog');
		return dialog;
	}


	SetShowTibialSlop = function (show: boolean) {
		(<IViewer>this.viewer).SetShowShapeByName(TibialSlopeToolViewer.TibialeSlopeGroupName, show);
    }

    getSWIP = function (container) {
        var imglayer = container.getStage().find('.imglayer')[0];

        var angleLineSubGroup = container.findOne('.angleLineSubGroup');
		var angleLineP1 = angleLineSubGroup.find('.angleLineP1')[0];
		var angleLineP2 = angleLineSubGroup.find('.angleLineP2')[0];
		if (!(angleLineSubGroup || angleLineP1 || angleLineP2)) {
			return null;
		}
        var angleLineP1ImageCoords = ViewerHelper.TranslatePointCoords({ x: angleLineP1.getX(), y: angleLineP1.getY() }, angleLineSubGroup, imglayer);
		var angleLineP2ImageCoords = ViewerHelper.TranslatePointCoords({ x: angleLineP2.getX(), y: angleLineP2.getY() }, angleLineSubGroup, imglayer);
        
        var upperLineSubGroup = container.findOne('.upperLineSubGroup');
		var upperLineP1 = upperLineSubGroup.find('.upperLineP1')[0];
		var upperLineP2 = upperLineSubGroup.find('.upperLineP2')[0];
        var upperLineP1ImageCoords = ViewerHelper.TranslatePointCoords({ x: upperLineP1.getX(), y: upperLineP1.getY() }, upperLineSubGroup, imglayer);
		var upperLineP2ImageCoords = ViewerHelper.TranslatePointCoords({ x: upperLineP2.getX(), y: upperLineP2.getY() }, upperLineSubGroup, imglayer);

        var bottomLineSubGroup = container.findOne('.bottomLineSubGroup');
		var bottomLineP1 = bottomLineSubGroup.find('.bottomLineP1')[0];
		var bottomLineP2 = bottomLineSubGroup.find('.bottomLineP2')[0];
        var bottomLineP1ImageCoords = ViewerHelper.TranslatePointCoords({ x: bottomLineP1.getX(), y: bottomLineP1.getY() }, bottomLineSubGroup, imglayer);
		var bottomLineP2ImageCoords = ViewerHelper.TranslatePointCoords({ x: bottomLineP2.getX(), y: bottomLineP2.getY() }, bottomLineSubGroup, imglayer);

        var label = container.findOne('.label');
        var labelText;
        var labelPositionImageCoords;
        if (label) {
            labelText = label.getText().text();
            var labelPositionContainerCoords = label.getPosition();
            labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
        }

        var labelTool = {
            name: '.label',
            text: labelText,
            position: labelPositionImageCoords
        }

        var tibialSlopeToolSWIPData = {
            shapeType: 'TibialSlopeTool',
            shapeName: container.getName(),
            isVisible: container.isVisible(),
            angleLineP1: angleLineP1ImageCoords,
            angleLineP2: angleLineP2ImageCoords,
            bottomLineP1: bottomLineP1ImageCoords,
            bottomLineP2: bottomLineP2ImageCoords,
            upperLineP1: upperLineP1ImageCoords,
            upperLineP2: upperLineP2ImageCoords,
            label: labelTool
        }

        return tibialSlopeToolSWIPData;
    }

    SetTibialSlopeToolFromSWIP = function (swipItem: any, isLeftBodyPart: boolean) {
        var _this = this;
        var sSwipData = JSON.stringify(swipItem);
        var tibialSlopeSwipData: TibialSlopeToolSWIPData = JSON.parse(sSwipData);

        TibialSlopeToolViewer.isLeft = isLeftBodyPart;
        TibialSlopeToolViewer.TibialeSlopeGroupName = tibialSlopeSwipData.shapeName;
        var group = this.buildShape(tibialSlopeSwipData.shapeName);
        TibialSlopeToolViewer.setDrawData = {
            imageWidth: this.viewer.originalImageWidth,
            imageHeight: this.viewer.originalImageHeight,
            strokeColor: 'blue',
            group: group,
            stage: group.getStage(),
            connectFunction: this.connectTibialSlopeTool,
            viewer: this.viewer,
            imageAutoKneeData: null
        }

        this.viewer.SetViewerMouseState(tibialSlopeSwipData.shapeName);

        var _this = this;
        group.on("dragmove dragend", function () {
            _this.connectTibialSlopeTool(group, 'red');
        });
       
        TibialSlopeToolViewer.onSetDrawPointStart(TibialSlopeToolViewer.setDrawData, tibialSlopeSwipData);

        BasicToolsViewer.UpdateLabelOnSwip(group, tibialSlopeSwipData.label);

        _this.viewer.shapeslayer.drawScene();
    }

    static createAnchorsFromSWIP = function (drawData, tibialSlopeSwipData: TibialSlopeToolSWIPData, imageRect) {
        var group = drawData.group;
        var angleLineSubGroup = drawData.group.findOne('.angleLineSubGroup');
        var bottomLineSubGroup = drawData.group.findOne('.bottomLineSubGroup');
        var upperLineSubGroup = drawData.group.findOne('.upperLineSubGroup');

		var bottomLineP1 = Viewer.addAnchor(bottomLineSubGroup, tibialSlopeSwipData.bottomLineP1.x, tibialSlopeSwipData.bottomLineP1.y, "bottomLineP1", TibialSlopeToolViewer.bottomLineConnectFunction);
		var bottomLineP2 = Viewer.addAnchor(bottomLineSubGroup, tibialSlopeSwipData.bottomLineP2.x, tibialSlopeSwipData.bottomLineP2.y, "bottomLineP2", TibialSlopeToolViewer.bottomLineConnectFunction);
		var upperLineP1 = Viewer.addAnchor(upperLineSubGroup, tibialSlopeSwipData.upperLineP1.x, tibialSlopeSwipData.upperLineP1.y, "upperLineP1", TibialSlopeToolViewer.upperLineConnectFunction);
		var upperLineP2 = Viewer.addAnchor(upperLineSubGroup, tibialSlopeSwipData.upperLineP2.x, tibialSlopeSwipData.upperLineP2.y, "upperLineP2", TibialSlopeToolViewer.upperLineConnectFunction);
		var angleLineP1 = Viewer.addAnchor(angleLineSubGroup, tibialSlopeSwipData.angleLineP1.x, tibialSlopeSwipData.angleLineP1.y, "angleLineP1", TibialSlopeToolViewer.angleLineConnectFunction);
		var angleLineP2 = Viewer.addAnchor(angleLineSubGroup, tibialSlopeSwipData.angleLineP2.x, tibialSlopeSwipData.angleLineP2.y, "angleLineP2", TibialSlopeToolViewer.angleLineConnectFunction);
        var anchors = {
			bottomLineP1: bottomLineP1,
			bottomLineP2: bottomLineP2,
			upperLineP1: upperLineP1,
			upperLineP2: upperLineP2,
			angleLineP1: angleLineP1,
			angleLineP2: angleLineP2
        }
        return anchors
    }
}