//// <reference path="../Declaretions.ts" />

'use strict';

import Konva from "konva";
import { ViewerHelper } from "./ViewerHelper";


interface ICorToolViewer {

	SetCORTool(autoHipResult: DTOAutoHipResult): void;

	IsCORExists(): boolean;

	IsCORToolVisible(): boolean;

	GetCupLocationForTreatedSide(): DTOCupLocationDetails;

	GetStemLocationForTreatedSide(): DTOStemLocationDetails;

	SetCORToolFromSWIP(corSWIPItem: any): void;
}

class CorToolViewer implements ICorToolViewer {
	static CORGroupName = 'corGroup';
	static CORLLDGroupName = 'corLldGroup';
	static FemAxisGroupName = 'femAxisGroup';
	static FemurAxisLine = 'femurAxisLine';
	static ColorPink = '#ed145b';
	static ColorTrans = '#000000';

	private viewer;
	constructor(viewer: IViewer) {
		this.viewer = viewer;
	}

	IsCORExists = function () {
		return (<IViewer>this.viewer).IsShapeExists(CorToolViewer.CORGroupName);
	}

	IsCORToolVisible = function () {
		var isVisible = false;
		var shapeslayer = this.viewer.getShapeslayer();
		var corToolGroup = shapeslayer.findOne('.' + CorToolViewer.CORGroupName);
		if (corToolGroup) isVisible = corToolGroup.isVisible();
		return isVisible;
	}

	SetCORTool(autoHipResult: DTOAutoHipResult) {

		//console.log('COR Tool called on viewer')
		var _this = this;
		var dicomimg = _this.viewer.stage.find('.dicomimg')[0];
		if (dicomimg == null) {
			_this.viewer.postImageOperationsQueue.push(function () { _this.SetCORTool(autoHipResult) });
			return;
		}

		function onBeforeDeleteChildFunction(child: any) {
			var stage = child.getStage();
			var templatesLayer = stage.findOne('.segmentAndTemplatelayer');
			var inclinationLabel = templatesLayer.findOne('.inclinationLabel');
			if (inclinationLabel) ViewerHelper.removeLabel(_this.viewer, 'inclinationLabel', true);

			var container = child.getParent();
			container.destroy();
		}

		var corGroup = new Konva.Group({
			draggable: true,
			name: CorToolViewer.CORGroupName,
			isLeftLeg: _this.viewer.imageOrientation.IsLeftBodyPart,
			getReport: this.getReport,
			getSWIP: this.getSWIP,
			onBeforeDeleteChildFunction: onBeforeDeleteChildFunction
			//femOffset: null,
		})
		//TODO: may be should optimize - put mock data in each tool component function
		//TODO: make function that checks valid points coordinates example negative or bigger then image
		if (!autoHipResult) {
			autoHipResult = new DTOAutoHipResult();
		}
		if (autoHipResult.LldTool == null) {
			//console.log("COR USES LLD MOCK");
			//default location
			var x = _this.viewer.GetImageWidth();
			var y = _this.viewer.GetImageHeight();
			//autoHipResult = new DTOAutoHipResult();
			autoHipResult.LldTool = new DTOLldTool();
			autoHipResult.LldTool.LeftLesserTrochanter = new PointF(x * 4 / 5, y * 3 / 4); // 1520,1310
			autoHipResult.LldTool.RightLesserTrochanter = new PointF(x / 5, y * 3 / 4); // 320,1349
			autoHipResult.LldTool.LeftTearDrop = new PointF(x * 2 / 3, y * 2 / 3);//1307.3901297339241, 1118.3703340711788
			autoHipResult.LldTool.RightTearDrop = new PointF(x / 3, y * 2 / 3);//535.4496973476478, 1130.148726246592
		}
		if (autoHipResult.StemLocationDetailsLeftSide == null) {
			//console.log("COR USES Left Stem  MOCK");
			autoHipResult.StemLocationDetailsLeftSide = new DTOStemLocationDetails();
			autoHipResult.StemLocationDetailsLeftSide.Angle = -0.5365906;
			autoHipResult.StemLocationDetailsLeftSide.Location = new PointF(x * 8 / 9, y * 3 / 5);//1685.152, 960.5136
			autoHipResult.StemLocationDetailsLeftSide.Width = 14.52605; //mm
		}
		if (autoHipResult.StemLocationDetailsRightSide == null) {
			//console.log("COR USES Right Stem  MOCK");
			autoHipResult.StemLocationDetailsRightSide = new DTOStemLocationDetails();
			autoHipResult.StemLocationDetailsRightSide.Angle = 0;//-6
			autoHipResult.StemLocationDetailsRightSide.Location = new PointF(x / 9, y * 3 / 5);//128.24697792183565, 996.1326678160938
			autoHipResult.StemLocationDetailsRightSide.Width = 20;
		}
		if (autoHipResult.CupLocationDetailsLeftSide == null) {
			//console.log("COR USES Left Cup  MOCK");
			autoHipResult.CupLocationDetailsLeftSide = new DTOCupLocationDetails();
			autoHipResult.CupLocationDetailsLeftSide.Angle = 0;
			autoHipResult.CupLocationDetailsLeftSide.Location = new PointF(x * 3 / 4, y * 3 / 5);//1503, 1016
			autoHipResult.CupLocationDetailsLeftSide.Radius = 21.664114; //mm
		}
		if (autoHipResult.CupLocationDetailsRightSide == null) {
			//console.log("COR USES Right Cup  MOCK");
			autoHipResult.CupLocationDetailsRightSide = new DTOCupLocationDetails();
			autoHipResult.CupLocationDetailsRightSide.Angle = 0;
			autoHipResult.CupLocationDetailsRightSide.Location = new PointF(x / 4, y * 3 / 5);//stage coord 352.2628583408383, 1044.0835136965907
			autoHipResult.CupLocationDetailsRightSide.Radius = 22.49735; //mm
		}

		if (autoHipResult.AutoHipDataLeftSide == null) {
			var stage = _this.viewer.stage;
			var imageStartPt = new PointF(dicomimg.getX(), dicomimg.getY())
			var imageSizeVector = new PointF(dicomimg.getWidth(), dicomimg.getHeight());
			var femAxisStartPoint = autoHipResult.StemLocationDetailsLeftSide.Location;
			var femAxisAngle = autoHipResult.StemLocationDetailsLeftSide.Angle;
			var vec = new Vec2(0, 100);
			vec = vec.normalize();
			vec = vec.rotateDegrees(femAxisAngle);
			var femAxisEndPoint = MathL.calcIntersectionWithRect(femAxisStartPoint, vec, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));

			var vec4th = new Vec2(femAxisEndPoint.x - femAxisStartPoint.x, femAxisEndPoint.y - femAxisStartPoint.y).divS(4);
			var upperCenterPoint = MathL.AddPoints(new Vec2(femAxisStartPoint.x, femAxisStartPoint.y), vec4th.mulS(2));
			var lowerCenterPoint = MathL.AddPoints(new Vec2(femAxisStartPoint.x, femAxisStartPoint.y), vec4th.mulS(3));

			autoHipResult.AutoHipDataLeftSide = new DTOAutoHipData();
			autoHipResult.AutoHipDataLeftSide.UpperCenterPointFinderLineLateralPoint = new PointF(upperCenterPoint.x - _this.viewer.MM2Pixels(10), upperCenterPoint.y);
			autoHipResult.AutoHipDataLeftSide.UpperCenterPointFinderMedialPoint = new PointF(upperCenterPoint.x + _this.viewer.MM2Pixels(10), upperCenterPoint.y);
			autoHipResult.AutoHipDataLeftSide.LowerCenterPointFinderLineLateralPoint = new PointF(lowerCenterPoint.x - _this.viewer.MM2Pixels(10), lowerCenterPoint.y);
			autoHipResult.AutoHipDataLeftSide.LowerCenterPointFinderLineMedialPoint = new PointF(upperCenterPoint.x + _this.viewer.MM2Pixels(10), lowerCenterPoint.y);
		}

		if (autoHipResult.AutoHipDataRightSide == null) {
			var stage = _this.viewer.stage;
			var imageStartPt = new PointF(dicomimg.getX(), dicomimg.getY())
			var imageSizeVector = new PointF(dicomimg.getWidth(), dicomimg.getHeight());
			var femAxisStartPoint = autoHipResult.StemLocationDetailsRightSide.Location;
			var femAxisAngle = autoHipResult.StemLocationDetailsRightSide.Angle;
			var vec = new Vec2(0, 100);
			vec = vec.normalize();
			vec = vec.rotateDegrees(femAxisAngle);
			var femAxisEndPoint = MathL.calcIntersectionWithRect(femAxisStartPoint, vec, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));

			var vec4th = new Vec2(femAxisEndPoint.x - femAxisStartPoint.x, femAxisEndPoint.y - femAxisStartPoint.y).divS(4);
			var upperCenterPoint = MathL.AddPoints(new Vec2(femAxisStartPoint.x, femAxisStartPoint.y), vec4th.mulS(2));
			var lowerCenterPoint = MathL.AddPoints(new Vec2(femAxisStartPoint.x, femAxisStartPoint.y), vec4th.mulS(3));

			autoHipResult.AutoHipDataRightSide = new DTOAutoHipData();
			autoHipResult.AutoHipDataRightSide.UpperCenterPointFinderLineLateralPoint = new PointF(upperCenterPoint.x + _this.viewer.MM2Pixels(10), upperCenterPoint.y);
			autoHipResult.AutoHipDataRightSide.UpperCenterPointFinderMedialPoint = new PointF(upperCenterPoint.x - _this.viewer.MM2Pixels(10), upperCenterPoint.y);
			autoHipResult.AutoHipDataRightSide.LowerCenterPointFinderLineLateralPoint = new PointF(lowerCenterPoint.x + _this.viewer.MM2Pixels(10), lowerCenterPoint.y);
			autoHipResult.AutoHipDataRightSide.LowerCenterPointFinderLineMedialPoint = new PointF(upperCenterPoint.x - _this.viewer.MM2Pixels(10), lowerCenterPoint.y);
		}

		this.viewer.shapeslayer.add(corGroup);
		var healthySideLeft = !this.viewer.imageOrientation.IsLeftBodyPart;
		this.SetCorLldTool(_this.viewer, corGroup, autoHipResult.LldTool); //corGroup
		this.SetMasterCenterOfRotationGroup(_this.viewer, corGroup, autoHipResult, healthySideLeft);
		this.SetFemurAnatomicalAxis(_this.viewer, corGroup, autoHipResult, true);
		this.SetFemurAnatomicalAxis(_this.viewer, corGroup, autoHipResult, false);

	}//set cor tool

	SetCorLldTool(viewer, corGroup, corToolData: DTOLldTool) { //corGroup
		var corLldGroup = new Konva.Group({
			draggable: true,
			name: CorToolViewer.CORLLDGroupName,
			isLeftLeg: viewer.imageOrientation.IsLeftBodyPart,
		})
		corGroup.add(corLldGroup);
		var anchor = Viewer.addAnchor(corLldGroup, corToolData.LeftTearDrop.x, corToolData.LeftTearDrop.y, "tearDrop1", CorToolViewer.connectCorLld, viewer);
		Viewer.addAnchor(corLldGroup, corToolData.RightTearDrop.x, corToolData.RightTearDrop.y, "tearDrop2", CorToolViewer.connectCorLld, viewer);
		Viewer.addAnchor(corLldGroup, corToolData.LeftLesserTrochanter.x, corToolData.LeftLesserTrochanter.y, "corLesser1", CorToolViewer.connectCorLld, viewer);
		Viewer.addAnchor(corLldGroup, corToolData.RightLesserTrochanter.x, corToolData.RightLesserTrochanter.y, "corLesser2", CorToolViewer.connectCorLld, viewer);
		CorToolViewer.connectCorLld(corLldGroup, viewer);
		this.viewer.SetGroupSelected(CorToolViewer.CORLLDGroupName);
		corLldGroup.setZIndex(0);

		corLldGroup.on("dragmove", function () {
			var group = corGroup.findOne('.masterCORGroup');
			CorToolViewer.connectOtherCORCircle(group, viewer);
		});
	}//end set cor lld tool

	private SetFemurAnatomicalAxis = function (viewer, corGroup, autoHipResult: DTOAutoHipResult, IsLeftBodyPart: boolean) {
		var StemLocationDetails = IsLeftBodyPart ? autoHipResult.StemLocationDetailsLeftSide : autoHipResult.StemLocationDetailsRightSide;
		var CupLocationDetails = IsLeftBodyPart ? autoHipResult.CupLocationDetailsLeftSide : autoHipResult.CupLocationDetailsRightSide;

		var dicomimg = corGroup.getStage().findOne('.dicomimg');
		var stage = corGroup.getStage();
		var imageStartPt = ViewerHelper.TranslatePointCoords(new PointF(dicomimg.getX(), dicomimg.getY()), stage, corGroup);
		var imageSizeVector = ViewerHelper.TranslateVectorCoords(new PointF(dicomimg.getWidth(), dicomimg.getHeight()), dicomimg, corGroup);

		var group = this.CreateFemurAnatomocalAxisGroup(viewer, corGroup, IsLeftBodyPart);

		this.viewer.SetViewerMouseState(CorToolViewer.CORGroupName);	//move to coonect func?
		//set fem axis line default points
		// TODO: remove here or remove mock in root function
		var angle = 0;
		var startPoint = viewer.imageOrientation.IsLeftBodyPart ?
			new PointF(viewer.GetImageWidth() * 3 / 4, viewer.GetImageHeight() / 2)
			: new PointF(viewer.GetImageWidth() / 4, viewer.GetImageHeight() / 2);

		if (StemLocationDetails != null) {
			var angle = StemLocationDetails.Angle;
			var startPoint = StemLocationDetails.Location;
		}
		// direction vectort and intersection with image edge
		var vec = new Vec2(0, 100);
		vec = vec.normalize();
		vec = vec.rotateDegrees(angle);
		var endPoint = MathL.calcIntersectionWithRect(startPoint, vec, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));

		var femurAxisLine = group.findOne('.' + CorToolViewer.FemurAxisLine);
		femurAxisLine.setPoints([startPoint.x, startPoint.y, endPoint.x, endPoint.y]);
		var femurAxisLineHitRegion = group.find('.' + CorToolViewer.FemurAxisLine + 'HitRegion')[0];
		femurAxisLineHitRegion.setPoints([startPoint.x, startPoint.y, endPoint.x, endPoint.y]);
		//set center line finders default position
		var autoHipData = IsLeftBodyPart ? autoHipResult.AutoHipDataLeftSide : autoHipResult.AutoHipDataRightSide;
		var defaultValues: boolean = IsLeftBodyPart ? autoHipData == null : autoHipData == null;
		//console.log("defaultValues autoHipResult", autoHipData);
		//TODO: set default values if no data
		if (!defaultValues) {
			this.SetCenterPointFinderLines(viewer, group, autoHipData.LowerCenterPointFinderLineMedialPoint, autoHipData.LowerCenterPointFinderLineLateralPoint,
				autoHipData.UpperCenterPointFinderMedialPoint, autoHipData.UpperCenterPointFinderLineLateralPoint);
		}

		viewer.shapeslayer.drawScene();

		return group;
	}

	private CreateFemurAnatomocalAxisGroup = function (viewer, corGroup, IsLeftBodyPart: boolean) {
		var bodypart = IsLeftBodyPart ? 'Left' : 'Right';
		var groupname = CorToolViewer.FemAxisGroupName;

		var group = new Konva.Group({
			name: groupname,
			id: bodypart,
			draggable: true
		});
		var LowerCenterPointFinderSubGroup = new Konva.Group({
			name: "CenterPointFindersLowerSubGroup",
			draggable: true,
			visible: false
		})
		var UpperCenterPointFinderSubGroup = new Konva.Group({
			name: "CenterPointFindersUpperSubGroup",
			draggable: true,
			visible: false
		})

		var OnBeforeDeleteSubGroup = function (shape) {
			viewer.RemoveShape(shape.parent);
		}

		LowerCenterPointFinderSubGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteSubGroup);
		UpperCenterPointFinderSubGroup.setAttr('onBeforeDeleteFunction', OnBeforeDeleteSubGroup);
		group.add(LowerCenterPointFinderSubGroup);
		group.add(UpperCenterPointFinderSubGroup);

		var onFemAxisSelectedFunc = function () {
			UpperCenterPointFinderSubGroup.show();
			UpperCenterPointFinderSubGroup.attrs.selected = 'true';
			LowerCenterPointFinderSubGroup.show();
			LowerCenterPointFinderSubGroup.attrs.selected = 'true';
			viewer.shapeslayer.drawScene();
		}

		var onFemAxisUnSelectedFunc = function () {
			UpperCenterPointFinderSubGroup.hide();
			LowerCenterPointFinderSubGroup.hide();
			viewer.shapeslayer.drawScene();
		}

		group.setAttr('onShapeSelectedFunction', onFemAxisSelectedFunc);
		group.setAttr('onShapeUnSelectedFunction', onFemAxisUnSelectedFunc);
		corGroup.add(group);

		group.on("dragmove dragend", function () {
			//TODO: change to update relevant
			CorToolViewer.ConnectFemAxisPoints(group, viewer);
			viewer.shapeslayer.drawScene();
		});
		var femurAxisLine = ViewerHelper.addConnectingLine(group, CorToolViewer.FemurAxisLine);
		//TODO: check if make additional angle helper line
		var lowerCenterPointFinderLine = ViewerHelper.addConnectingLine(LowerCenterPointFinderSubGroup, "lowerCenterPointFinderLine");
		var upperCenterPointFinderLine = ViewerHelper.addConnectingLine(UpperCenterPointFinderSubGroup, "upperCenterPointFinderLine");

		return group;
	}

	private SetCenterPointFinderLines(viewer, group, lowerP1: PointF, lowerP2: PointF, upperP1: PointF, upperP2: PointF) {
		var lowerCenterPointFinderSubGroup = group.findOne('.CenterPointFindersLowerSubGroup');
		var upperCenterPointFinderSubGroup = group.findOne('.CenterPointFindersUpperSubGroup');
		var lowerCenterPointFinderLine = lowerCenterPointFinderSubGroup.findOne('.lowerCenterPointFinderLine');
		var upperCenterPointFinderLine = upperCenterPointFinderSubGroup.findOne('.upperCenterPointFinderLine');

		lowerCenterPointFinderLine.setPoints([lowerP1.x, lowerP1.y, lowerP2.x, lowerP2.y]);
		Viewer.addAnchor(lowerCenterPointFinderSubGroup, lowerP1.x, lowerP1.y, "lcpf1", CorToolViewer.ConnectLowerFinderLine, viewer);
		Viewer.addAnchor(lowerCenterPointFinderSubGroup, lowerP2.x, lowerP2.y, "lcpf2", CorToolViewer.ConnectLowerFinderLine, viewer);

		upperCenterPointFinderLine.setPoints([upperP1.x, upperP1.y, upperP2.x, upperP2.y])

		Viewer.addAnchor(upperCenterPointFinderSubGroup, upperP1.x, upperP1.y, "ucpf1", CorToolViewer.ConnectUpperFinderLine, viewer);
		Viewer.addAnchor(upperCenterPointFinderSubGroup, upperP2.x, upperP2.y, "ucpf2", CorToolViewer.ConnectUpperFinderLine, viewer);

		CorToolViewer.ConnectFemAxisPoints(group, viewer);


	}

	SetMasterCenterOfRotationGroup(viewer: Viewer, corGroup, autoHipResult: DTOAutoHipResult, healthySideLeft: boolean) {
		var group = this.CreateMasterCORGroup(viewer, corGroup);

		var theSideAcetabularData: DTOCupLocationDetails = healthySideLeft ? autoHipResult.CupLocationDetailsLeftSide : autoHipResult.CupLocationDetailsRightSide;

		var radius = viewer.MM2Pixels(theSideAcetabularData.Radius);
		var center = theSideAcetabularData.Location;

		var p1 = new PointF(center.x - radius, center.y);
		var p2 = new PointF(center.x + radius, center.y);

		this.CreateAndConnectCircle(viewer, group, p1, p2);
		//TODO: to set circle label default location use group.findOne('.lineLabel');

		this.viewer.shapeslayer.draw();
	}// end SetMasterCenterOfRotationGroup

	SetMasterCenterOfRotationGroupOnSWIP(viewer: Viewer, corGroup, corCenterOfRotation: CorCenterOfRotation) {
		var group = this.CreateMasterCORGroup(viewer, corGroup);
		this.CreateAndConnectCircle(viewer, group, corCenterOfRotation.circleP1, corCenterOfRotation.circleP2);
		this.viewer.shapeslayer.draw();
	}

	private CreateMasterCORGroup(viewer: Viewer, corGroup) {
		var group = new Konva.Group({
			name: 'masterCORGroup',
			draggable: true,
			femOffset: null
		})
		corGroup.add(group);

		group.on("dragmove", function () {
			CorToolViewer.connectOtherCORCircle(group, viewer);
		})

		return group;
	}

	private CreateAndConnectCircle(viewer: Viewer, group, p1: PointF, p2: PointF) {
		var anchor = Viewer.addAnchor(group, p1.x, p1.y, "p1", CorToolViewer.connectPointsToCircleDiameter, viewer);
		Viewer.addAnchor(group, p2.x, p2.y, "p2", CorToolViewer.connectPointsToCircleDiameter, viewer);
		CorToolViewer.connectPointsToCircleDiameter(group, viewer);
	}

	static setSecondaryCenterOfRotationGroup(corGroup, radius, center, viewer) {

		var group = new Konva.Group({
			name: 'secondaryCORGroup',
			draggable: true,
			femOffset: null
		})

		corGroup.add(group);
		var p1 = new PointF(center.x - radius, center.y);
		var p2 = new PointF(center.x + radius, center.y);

		var anchor = Viewer.addAnchor(group, p1.x, p1.y, "p1", CorToolViewer.connectPointsToCircleDiameter, viewer);
		Viewer.addAnchor(group, p2.x, p2.y, "p2", CorToolViewer.connectPointsToCircleDiameter, viewer);
		CorToolViewer.connectPointsToCircleDiameter(group, viewer);
		//TODO: to set circle label default location use group.findOne('.lineLabel');
		group.on("dragmove", function () {

			CorToolViewer.connectOtherCORCircle(group, viewer);
		})

	}//setSecondaryCenterOfRotationGroup

	static connectPointsToCircleDiameter(group, viewer) {
		BasicToolsViewer.connectPointsToCircleDiameter(group, viewer);
		CorToolViewer.connectOtherCORCircle(group, viewer);
	}

	static connectOtherCORCircle(group, viewer) {
		var corGroup = group.parent;
		var stage = corGroup.getStage();
		var imglayer = stage.getLayers()[0];
		var p1Crc = group.find('.p1')[0];
		var p2Crc = group.find('.p2')[0];
		var p1 = new Vec2(p1Crc.getX(), p1Crc.getY());
		var p2 = new Vec2(p2Crc.getX(), p2Crc.getY());
		var centerPt = MathL.GetMiddlePt(p1, p2);
		var centerInGroup = new Vec2(centerPt.x, centerPt.y);
		var radius = MathL.Distance(p1, p2) / 2;

		var center = ViewerHelper.TranslatePointCoords(centerInGroup, group, imglayer);

		var corLLdGroup = corGroup.findOne('.' + CorToolViewer.CORLLDGroupName);
		var tearDrop1Crc = corLLdGroup.find('.tearDrop1')[0];
		var tearDrop2Crc = corLLdGroup.find('.tearDrop2')[0];
		var tearDrop1InGroup = new Vec2(tearDrop1Crc.getX(), tearDrop1Crc.getY());
		var tearDrop2InGroup = new Vec2(tearDrop2Crc.getX(), tearDrop2Crc.getY());

		var tearDrop1 = ViewerHelper.TranslatePointCoords(tearDrop1InGroup, corLLdGroup, imglayer);
		var tearDrop2 = ViewerHelper.TranslatePointCoords(tearDrop2InGroup, corLLdGroup, imglayer);

		tearDrop1 = new Vec2(tearDrop1.x, tearDrop1.y);
		tearDrop2 = new Vec2(tearDrop2.x, tearDrop2.y);

		var closestTearDrop = (MathL.Distance(center, tearDrop1InGroup) < MathL.Distance(center, tearDrop2InGroup)) ? tearDrop1 : tearDrop2;
		var oppositeTearDrop = (MathL.Distance(center, tearDrop1InGroup) < MathL.Distance(center, tearDrop2InGroup)) ? tearDrop2 : tearDrop1;

		function calcMirrorPoint(point, referenceTD, destTD) {
			var lldV = MathL.SubtractPoints(referenceTD, destTD)
			var lldVN = lldV.normalize();
			var lldVNormal = lldVN.getNormal();
			var vec = MathL.SubtractPoints(point, referenceTD);
			var vecW = ViewerHelper.CalcProjectionVector(vec, lldVN);
			var vecH = ViewerHelper.CalcProjectionVector(vec, lldVNormal);

			var mirrorP = destTD.addV(vecH).subV(vecW);

			return mirrorP;
		}

		var otherCenter = calcMirrorPoint(center, closestTearDrop, oppositeTearDrop);
		var p1img = ViewerHelper.TranslatePointCoords(p1, group, imglayer);
		var otherP1img = calcMirrorPoint(p1img, closestTearDrop, oppositeTearDrop)

		var p2img = ViewerHelper.TranslatePointCoords(p2, group, imglayer);
		var otherP2img = calcMirrorPoint(p2img, closestTearDrop, oppositeTearDrop)

		if (group.getName() == "masterCORGroup") {
			var otherCircleGroup = corGroup.findOne('.secondaryCORGroup');
			if (otherCircleGroup == null) {
				CorToolViewer.setSecondaryCenterOfRotationGroup(corGroup, radius, otherCenter, viewer);
				var otherCircleGroup = corGroup.findOne('.secondaryCORGroup');
			}
		} else {
			var otherCircleGroup = corGroup.findOne('.masterCORGroup');
		}
		var otherP1 = ViewerHelper.TranslatePointCoords(otherP1img, imglayer, otherCircleGroup)
		var otherP2 = ViewerHelper.TranslatePointCoords(otherP2img, imglayer, otherCircleGroup)

		var secp1Crc = otherCircleGroup.find('.p1')[0];
		var secp2Crc = otherCircleGroup.find('.p2')[0];
		var secp1CrcHitRegion = otherCircleGroup.find('.p1HitRegion')[0];
		var secp2CrcHitRegion = otherCircleGroup.find('.p2HitRegion')[0];
		secp1Crc.setX(otherP1.x)
		secp1Crc.setY(otherP1.y)
		secp1CrcHitRegion.setX(otherP1.x)
		secp1CrcHitRegion.setY(otherP1.y)
		secp2Crc.setX(otherP2.x)
		secp2Crc.setY(otherP2.y)
		secp2CrcHitRegion.setX(otherP2.x)
		secp2CrcHitRegion.setY(otherP2.y)
		BasicToolsViewer.connectPointsToCircleDiameter(otherCircleGroup, null)
		var femGroupsArr = corGroup.find('.' + CorToolViewer.FemAxisGroupName);
		if (femGroupsArr.length > 1) {
			femGroupsArr.forEach(fg => {
				CorToolViewer.connectFemOffsetLineLabel(fg, viewer)
			})
		}

		corGroup.draw();
	}//end connectOtherCORCircle

	static connectCorLld(group, viewer: Viewer) {

		var layer = group.getLayer();
		var stage = layer.getStage();
		var dicomimg = stage.find('.dicomimg')[0];

		var tearDrop1 = group.find('.tearDrop1')[0];
		var tearDrop2 = group.find('.tearDrop2')[0];
		var corLesser1 = group.find('.corLesser1')[0];
		var corLesser2 = group.find('.corLesser2')[0];

		var connectingLineCorLld = group.find('.connectingLineCorLld')[0];

		var corTearDropLineLabel = group.find('.corTearDropLineLabel')[0];

		var tearDrop1Circle = group.find('.tearDrop1Circle')[0];
		var tearDrop2Circle = group.find('.tearDrop2Circle')[0];
		var lesser1connectingLine = group.find('.corLesser1connectingLine')[0];
		var lesser2connectingLine = group.find('.corLesser2connectingLine')[0];
		var lesser1connectingLabel = group.find('.lesser1connectingLabel')[0];
		var lesser2connectingLabel = group.find('.lesser2connectingLabel')[0];

		var isLeftLeg = group.getAttr('isLeftLeg');

		var connectingLineCorLldtoAxis1 = group.find('.connectingLineCorLldtoAxis1')[0];

		if (tearDrop1 != null && corLesser1 != null) {
			if (connectingLineCorLld == null) {
				connectingLineCorLld = ViewerHelper.addConnectingLine(group, 'connectingLineCorLld');
				connectingLineCorLldtoAxis1 = ViewerHelper.addConnectingLine(group, 'connectingLineCorLldtoAxis1');
				lesser1connectingLine = ViewerHelper.addConnectingLine(group, 'corLesser1connectingLine');
				lesser2connectingLine = ViewerHelper.addConnectingLine(group, 'corLesser2connectingLine');
				corTearDropLineLabel = ViewerHelper.addLabel(group,
					'corTearDropLineLabel',
					connectingLineCorLld.getAttr('originalColor'),
					connectingLineCorLld);

				tearDrop1Circle = new Konva.Circle({
					fill: 'cyan',
					name: 'tearDrop1Circle',
					draggable: false,
					radius: 1,
					stroke: 'purple',
					strokeWidth: 4,
				});
				group.add(tearDrop1Circle);
				tearDrop2Circle = new Konva.Circle({
					fill: 'cyan',
					name: 'tearDrop2Circle',
					draggable: false,
					radius: 1,
					stroke: 'purple',
					strokeWidth: 4,
				});
				group.add(tearDrop2Circle);

				lesser1connectingLabel = ViewerHelper.addLabel(group, 'lesser1connectingLabel', '', lesser1connectingLine);
				lesser2connectingLabel = ViewerHelper.addLabel(group, 'lesser2connectingLabel', '', lesser2connectingLine);
			}

			var tearDropPt1 = new Vec2(tearDrop1.getX(), tearDrop1.getY());
			var tearDropPt2 = new Vec2(tearDrop2.getX(), tearDrop2.getY());
			var lesserPt1 = new Vec2(corLesser1.getX(), corLesser1.getY());
			var lesserPt2 = new Vec2(corLesser2.getX(), corLesser2.getY());

			var projLesser1 = ViewerHelper.calcProjectedPointOnLine(tearDropPt1, tearDropPt2, lesserPt1);
			var projLesser2 = ViewerHelper.calcProjectedPointOnLine(tearDropPt1, tearDropPt2, lesserPt2);

			tearDrop1Circle.setX(projLesser1.x);
			tearDrop1Circle.setY(projLesser1.y);
			tearDrop2Circle.setX(projLesser2.x);
			tearDrop2Circle.setY(projLesser2.y);

			var connectingLineCorLldHitRegion = group.find('.connectingLineCorLldHitRegion')[0];
			connectingLineCorLldHitRegion.setPoints([tearDropPt1.x, tearDropPt1.y, tearDropPt2.x, tearDropPt2.y]);
			connectingLineCorLld.setPoints([tearDropPt1.x, tearDropPt1.y, tearDropPt2.x, tearDropPt2.y]);

			var tearDropsLineDir = MathL.SubtractPoints(tearDropPt1, tearDropPt2);
			var tearDropsLineDirInv = new Vec2(-1 * tearDropsLineDir.x, -1 * tearDropsLineDir.y);
			var connectingLineCorLldtoAxis1HitRegion = group.find('.connectingLineCorLldtoAxis1HitRegion')[0];

			var imgStartPt = ViewerHelper.TranslatePointCoords(new PointF(dicomimg.getX(), dicomimg.getY()), dicomimg, group);
			var imageSizeVector = ViewerHelper.TranslateVectorCoords(new PointF(dicomimg.getWidth(), dicomimg.getHeight()), dicomimg, group);

			var axisIntersactionPoint: PointF = MathL.calcIntersectionWithRect(tearDropPt1, tearDropsLineDir, new RectangleF(imgStartPt.x, imgStartPt.y, imageSizeVector.x, imageSizeVector.y));
			var edgeIntersactionPoint: PointF = MathL.calcIntersectionWithRect(tearDropPt1, tearDropsLineDirInv, new RectangleF(imgStartPt.x, imgStartPt.y, imageSizeVector.x, imageSizeVector.y));

			connectingLineCorLldtoAxis1.setPoints([edgeIntersactionPoint.x, edgeIntersactionPoint.y, axisIntersactionPoint.x, axisIntersactionPoint.y])
			connectingLineCorLldtoAxis1HitRegion.setPoints([edgeIntersactionPoint.x, edgeIntersactionPoint.y, axisIntersactionPoint.x, axisIntersactionPoint.y]);

			var pointsShareSide = MathL.doPointsShareSide(tearDropPt1, tearDropPt2, lesserPt1, lesserPt2);

			var lesser1connectingLineHitRegion = group.find('.corLesser1connectingLineHitRegion')[0];
			lesser1connectingLine.setPoints([lesserPt1.x, lesserPt1.y, tearDrop1Circle.getX(), tearDrop1Circle.getY()]);
			lesser1connectingLineHitRegion.setPoints([lesserPt1.x, lesserPt1.y, tearDrop1Circle.getX(), tearDrop1Circle.getY()]);

			var lesser2connectingLineHitRegion = group.find('.corLesser2connectingLineHitRegion')[0];
			lesser2connectingLine.setPoints([lesserPt2.x, lesserPt2.y, tearDrop2Circle.getX(), tearDrop2Circle.getY()]);
			lesser2connectingLineHitRegion.setPoints([lesserPt2.x, lesserPt2.y, tearDrop2Circle.getX(), tearDrop2Circle.getY()]);

			var midPoint1 = ViewerHelper.calculateLineCenterPoint(lesser1connectingLine);
			ViewerHelper.moveLabel(lesser1connectingLabel, midPoint1);
			var lesser1linelength = ViewerHelper.calculateLineLength(lesser1connectingLine);
			lesser1connectingLabel.setAttr('pixelLength', lesser1linelength);

			var midPoint2 = ViewerHelper.calculateLineCenterPoint(lesser2connectingLine);
			ViewerHelper.moveLabel(lesser2connectingLabel, midPoint2);
			var lesser2linelength = ViewerHelper.calculateLineLength(lesser2connectingLine);
			lesser2connectingLabel.setAttr('pixelLength', lesser2linelength);

			var lenDiff = lesser2linelength - pointsShareSide * lesser1linelength;
			var reverseLenDiff = ((midPoint1.x < midPoint2.x) == isLeftLeg) == (lesserPt2.y > tearDrop2Circle.getY());
			if (reverseLenDiff)
				lenDiff = -lenDiff;

			corTearDropLineLabel.setAttr('pixelLength', Math.round(Math.abs(lenDiff)));

			corTearDropLineLabel.setAttr('labelPrefix', isLeftLeg ? 'Left Leg is ' : 'Right Leg is ');
			corTearDropLineLabel.setAttr('labelPostfix', (lenDiff > 0) ? ' shorter' : ' longer');

			var midPoint = ViewerHelper.calculateLineCenterPoint(connectingLineCorLld);
			//calculate  better label position 
			var betterLabelPosition = new PointF(0, 0);
			betterLabelPosition.y = midPoint.y + viewer.MM2Pixels(20);
			var labelWidth = corTearDropLineLabel.width() < 20 ? 320 : corTearDropLineLabel.width();
			betterLabelPosition.x = midPoint.x - labelWidth / 2;
			ViewerHelper.moveLabel(corTearDropLineLabel, betterLabelPosition);
			corTearDropLineLabel.setAttr('doubleClickFunc', HipToolsViewer.legLengthLabelDoubleClickFunc);
			//CorToolViewer.makeCORLLDLabelEditable(group);

			connectingLineCorLld.setZIndex(0);

			var corGroup = group.parent;
			var masterCircleGroup = corGroup.find('.masterCORGroup')[0]
			if (masterCircleGroup != null) {

				CorToolViewer.connectPointsToCircleDiameter(masterCircleGroup, viewer);
			}

			HipToolsViewer.setCupInclinationLabel(viewer);
			HipToolsViewer.recalcOffsetLabel(viewer);

			layer.batchDraw();
			var templatesLayer = stage.find('.segmentAndTemplatelayer')[0];
			templatesLayer.batchDraw();
		}
	}//end connectCorLld

	static connectFemOffsetLineLabel(group, viewer: Viewer) { //femoral axis group

		var connectingLine = group.findOne('.' + CorToolViewer.FemurAxisLine);
		var connectingLineHitRegion = group.findOne('.' + CorToolViewer.FemurAxisLine + 'HitRegion')
		var femLinePts = connectingLine.getPoints();
		var femV1 = new Vec2(femLinePts[0], femLinePts[1]);
		var femV2 = new Vec2(femLinePts[2], femLinePts[3]);


		var corGroup = group.parent;
		var circlesArr = corGroup.find('.circle');
		var closestProjLen = null;
		var closestProjPt = null;
		var centerV = null;
		var circleGroup;
		circlesArr.forEach(function (c, i) {
			var cV = new Vec2(c.getPosition().x, c.getPosition().y);
			var projPt = ViewerHelper.calcProjectedPointOnLine(femV1, femV2, cV);
			var projLen = MathL.Distance(projPt, cV);

			if (closestProjLen == null || closestProjLen > projLen) {
				closestProjLen = projLen;
				closestProjPt = projPt;
				centerV = cV;
				circleGroup = c.parent;
			}


		});

		var centerPt = ViewerHelper.TranslatePointCoords(centerV, circleGroup, group)
		centerV = new Vec2(centerPt.x, centerPt.y);
		closestProjPt = ViewerHelper.calcProjectedPointOnLine(femV1, femV2, centerV);
		closestProjLen = MathL.Distance(closestProjPt, centerV);



		var line = group.findOne('.femOffsetLine');
		if (line == null) {
			var line = ViewerHelper.addConnectingLine(group, 'femOffsetLine');
		}
		line.setPoints([centerV.x, centerV.y, closestProjPt.x, closestProjPt.y]);
		var lineMidPoint = ViewerHelper.calculateLineCenterPoint(line);

		connectingLine.setPoints([closestProjPt.x, closestProjPt.y, femLinePts[2], femLinePts[3]]);
		connectingLineHitRegion.setPoints([closestProjPt.x, closestProjPt.y, femLinePts[2], femLinePts[3]]);

		//offset label
		var offsetLabel = group.findOne('.femOffsetLabel');
		if (offsetLabel == null) {
			offsetLabel = ViewerHelper.addLabel(group, 'femOffsetLabel', CorToolViewer.ColorPink, line);
		}

		var labelValue = viewer.Pixels2MM(closestProjLen);

		circleGroup.setAttr('femOffset', labelValue);

		offsetLabel.setAttr('labelPrefix', 'Femoral Offset: ');
		offsetLabel.setAttr('pixelLength', closestProjLen);
		offsetLabel.setAttr('labelPostfix', '');
		offsetLabel.setAttr('editableLabel', true);
		offsetLabel.setAttr('doubleClickFunc', CorToolViewer.makeFemOffsetLabelEditable)
		//offsetLabel.getText().setText('Femoral Offset: ' + labelValue.toFixed(1) + 'mm');
		//offset label position optimize height
		var circle = circleGroup.findOne('.circle');
		var radius = circle.radius();
		var optimizeH = radius + offsetLabel.getTag().height() + 10;
		//offset label position optimize width
		var imageWidth = viewer.GetImageWidth();
		var labelRightCornerX = lineMidPoint.x + offsetLabel.getTag().width();
		var optimizeW = lineMidPoint.x;
		//console.log("offset label tag width = ", offsetLabel.getTag().width());
		if (imageWidth < labelRightCornerX) {
			optimizeW = lineMidPoint.x + (imageWidth - labelRightCornerX - 20);
		}
		//CorToolViewer.makeFemOffsetLabelEditable(offsetLabel);
		ViewerHelper.moveLabel(offsetLabel, { x: optimizeW, y: closestProjPt.y - optimizeH }); //300





	}

	static makeFemOffsetLabelEditable = function (label) {//same as BasicToolsViewer.labelDoubleClickFunc
		var textNode = label.children[1];
		var group = label.parent;
		BasicToolsViewer.addEditLabelText(group, label.children[0], textNode);
	}

	static GetCORLLDAngleToXAxis = function (viewer) {
		var hasLLD = viewer.IsShapeExists(CorToolViewer.CORLLDGroupName);
		var angle = null;

		if (hasLLD) {
			var lldGroup = viewer.shapeslayer.findOne('.' + CorToolViewer.CORLLDGroupName);
			var p1X = lldGroup.find('.tearDrop1')[0].getX();
			var p1Y = lldGroup.find('.tearDrop1')[0].getY();
			var p2X = lldGroup.find('.tearDrop2')[0].getX();
			var p2Y = lldGroup.find('.tearDrop2')[0].getY();

			if (p1X < p2X) {
				angle = MathL.CalcAngle(new PointF(p2X, p2Y), new PointF(p1X + 100, p1Y), new PointF(p1X, p1Y));
			}
			else {
				angle = MathL.CalcAngle(new PointF(p1X, p1Y), new PointF(p2X + 100, p2Y), new PointF(p2X, p2Y));
			}
		}

		return angle;
	}

	static GetAdditionalAnchorsInTheGroup(TheGroup: any, SegmentGroup: any, shapeslayer: any, attachedAnchors: any): any {

		var hasAdditionalAnchorsGroupId = TheGroup.id();

		ViewerHelper.traverseContainer(shapeslayer, function (child: any) {
			if (child.getAttr('shapeType') == 'Anchor') {
				if (hasAdditionalAnchorsGroupId == child.parent.id() && TheGroup.name() == child.parent.name()) {

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



	getReport = function (container) {
		if (container.isVisible()) {
			var corReport = new DTOMeasurmentToolInfo();
			corReport.ToolName = "COR Tool"
			corReport.ToolValues = [];
			var lesser1 = container.findOne('.corLesser1');
			var lesser2 = container.findOne('.corLesser2');
			var lesser1Key = lesser1.getX() > lesser2.getX() ? 'Left Leg' : 'Right Leg';
			var lesser2Key = lesser1.getX() > lesser2.getX() ? 'Right Leg' : 'Left Leg';
			var lesser1connectingLabel = container.findOne('.lesser1connectingLabel');
			var lesser2connectingLabel = container.findOne('.lesser2connectingLabel');
			var leg1 = new KeyValuePair(lesser1Key, lesser1connectingLabel.getText().textArr[0].text);
			var leg2 = new KeyValuePair(lesser2Key, lesser2connectingLabel.getText().textArr[0].text);

			var label = container.findOne(".corTearDropLineLabel");
			var lldTxt = label.getText().textArr[0].text;
			var lld = new KeyValuePair('LLD', lldTxt)
			var leftOffsetGroup = container.findOne('#Left');
			var leftLbl = leftOffsetGroup.findOne(".femOffsetLabel");
			var leftLblTxt = leftLbl.getText().text()
			var rightOffsetGroup = container.findOne('#Right');
			var rightLbl = rightOffsetGroup.findOne(".femOffsetLabel");
			var rightLblTxt = rightLbl.getText().text();

			var leftLegOffset = new KeyValuePair('Left Side', leftLblTxt);
			var rightLegOffset = new KeyValuePair('Right Side', rightLblTxt);

			var masterGroup = container.findOne('.masterCORGroup');
			var lineLbl = masterGroup.findOne('.lineLabel');
			var crcDiaTxt = lineLbl.getText().text();
			var dia = new KeyValuePair('Diameter', crcDiaTxt);
			corReport.ToolValues = [leg1, leg2, lld, dia, leftLegOffset, rightLegOffset];

			return corReport;
		}
		return null;
	}

	getSWIP = function (container) {
		var imglayer = container.getStage().find('.imglayer')[0];

		var isHealthySideLeft = !container.getAttr('isLeftLeg');

		//lld
		var corLLDGroup = container.findOne('.' + CorToolViewer.CORLLDGroupName);
		var pTearDrop1GroupCoords = corLLDGroup.findOne('.tearDrop1');
		var pTearDrop2GroupCoords = corLLDGroup.findOne('.tearDrop2');
		var pLesser1GroupCoords = corLLDGroup.findOne('.corLesser1');
		var pLesser2GroupCoords = corLLDGroup.findOne('.corLesser2');

		var pTearDrop1ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pTearDrop1GroupCoords.getX(), y: pTearDrop1GroupCoords.getY() }, corLLDGroup, imglayer);
		var pTearDrop2ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pTearDrop2GroupCoords.getX(), y: pTearDrop2GroupCoords.getY() }, corLLDGroup, imglayer);
		var pLesser1ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pLesser1GroupCoords.getX(), y: pLesser1GroupCoords.getY() }, corLLDGroup, imglayer);
		var pLesser2ImageLayerCoords = ViewerHelper.TranslatePointCoords({ x: pLesser2GroupCoords.getX(), y: pLesser2GroupCoords.getY() }, corLLDGroup, imglayer);

		var labelText;
		var labelPositionImageCoords;
		var lldTearDropLineLabel = container.findOne(".corTearDropLineLabel");
		if (lldTearDropLineLabel) {
			labelText = lldTearDropLineLabel.getText().text();
			var labelPositionContainerCoords = lldTearDropLineLabel.getPosition();
			labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
		}

		var lldTearDropLineLabelTool = {
			name: '.corTearDropLineLabel',
			text: labelText,
			position: labelPositionImageCoords
		}

		var lldTearDrop1PerpendicularlineLabel = container.findOne('.lesser1connectingLabel');
		if (lldTearDrop1PerpendicularlineLabel) {
			labelText = lldTearDrop1PerpendicularlineLabel.getText().text();
			var labelPositionContainerCoords = lldTearDrop1PerpendicularlineLabel.getPosition();
			labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
		}

		var lldTearDrop1PerpendicularlineLabelTool = {
			name: '.lesser1connectingLabel',
			text: labelText,
			position: labelPositionImageCoords
		}

		var lldTearDrop2PerpendicularlineLabel = container.findOne('.lesser2connectingLabel');
		if (lldTearDrop2PerpendicularlineLabel) {
			labelText = lldTearDrop2PerpendicularlineLabel.getText().text();
			var labelPositionContainerCoords = lldTearDrop2PerpendicularlineLabel.getPosition();
			labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
		}

		var lldTearDrop2PerpendicularlineLabelTool = {
			name: '.lesser2connectingLabel',
			text: labelText,
			position: labelPositionImageCoords
		}

		var corLLDTool = {
			tearDrop1: pTearDrop1ImageLayerCoords,
			tearDrop2: pTearDrop2ImageLayerCoords,
			pLesser1: pLesser1ImageLayerCoords,
			pLesser2: pLesser2ImageLayerCoords,
			tearDroplineLabel: lldTearDropLineLabelTool,
			tearDrop1PerpendicularlineLabel: lldTearDrop1PerpendicularlineLabelTool,
			tearDrop2PerpendicularlineLabel: lldTearDrop2PerpendicularlineLabelTool
		}
		//end lld

		//femAxisGroups
		var corCenterPointFinderRight;
		var corCenterPointFinderLeft;

		var femAxisGroups = container.find('.femAxisGroup');
		femAxisGroups.forEach(function (femAxisGroup) {
			var side = femAxisGroup.getAttr('id');
			var femAxisLine = femAxisGroup.findOne('.femurAxisLine');
			var femAxisLinePoints = femAxisLine.getPoints();
			var femAxisLineP1ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(femAxisLinePoints[0], femAxisLinePoints[1]), femAxisGroup, imglayer);
			var femAxisLineP2ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(femAxisLinePoints[2], femAxisLinePoints[3]), femAxisGroup, imglayer);

			var femOffsetLine = femAxisGroup.findOne('.femOffsetLine');
			var femOffsetLinePoints = femOffsetLine.getPoints();
			var femOffsetLineP1ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(femOffsetLinePoints[0], femOffsetLinePoints[1]), femAxisGroup, imglayer);
			var femOffsetLineP2ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(femOffsetLinePoints[2], femOffsetLinePoints[3]), femAxisGroup, imglayer);

			var lowerCenterPointFinderLine = femAxisGroup.findOne('.lowerCenterPointFinderLine');
			var lowerCenterPointFinderLinePoints = lowerCenterPointFinderLine.getPoints();
			var lowerCenterPointFinderLineP1ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(lowerCenterPointFinderLinePoints[0], lowerCenterPointFinderLinePoints[1]), femAxisGroup, imglayer);
			var lowerCenterPointFinderLineP2ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(lowerCenterPointFinderLinePoints[2], lowerCenterPointFinderLinePoints[3]), femAxisGroup, imglayer);

			var upperCenterPointFinderLine = femAxisGroup.findOne('.upperCenterPointFinderLine');
			var upperCenterPointFinderLinePoints = upperCenterPointFinderLine.getPoints();
			var upperCenterPointFinderLineP1ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(upperCenterPointFinderLinePoints[0], upperCenterPointFinderLinePoints[1]), femAxisGroup, imglayer);
			var upperCenterPointFinderLineP2ImageCoords = ViewerHelper.TranslatePointCoords(new PointF(upperCenterPointFinderLinePoints[2], upperCenterPointFinderLinePoints[3]), femAxisGroup, imglayer);

			var labelText;
			var labelPositionImageCoords;
			var femOffsetLabel = femAxisGroup.findOne('.femOffsetLabel');
			if (femOffsetLabel) {
				labelText = femOffsetLabel.getText().text();
				var labelPositionGroupCoords = femOffsetLabel.getPosition();
				labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionGroupCoords, femAxisGroup, imglayer);
			}

			var femoralOffsetLabelTool = {
				name: '.femOffsetLabel',
				text: labelText,
				position: labelPositionImageCoords
			}

			var corCenterPointFinder = {
				femurAxisLineP1: femAxisLineP1ImageCoords,
				femurAxisLineP2: femAxisLineP2ImageCoords,
				lowerCenterPointFinderLineP1: lowerCenterPointFinderLineP1ImageCoords,
				lowerCenterPointFinderLineP2: lowerCenterPointFinderLineP2ImageCoords,
				upperCenterPointFinderLineP1: upperCenterPointFinderLineP1ImageCoords,
				upperCenterPointFinderLineP2: upperCenterPointFinderLineP2ImageCoords,
				femurOffsetLineP1: femOffsetLineP1ImageCoords,
				femurOffsetLineP2: femOffsetLineP2ImageCoords,
				femoralOffsetLabel: femoralOffsetLabelTool
			}

			if (side.toUpperCase() == 'RIGHT')
				corCenterPointFinderRight = corCenterPointFinder;
			else
				corCenterPointFinderLeft = corCenterPointFinder;
		});
		//end femAxisGroups

		//centers of rotation
		//primary
		var primaryCORGroup = container.findOne('.masterCORGroup');
		var connectingLine = primaryCORGroup.find('.connectingLine')[0];
		if (connectingLine) {
			var p1GroupCoords = { x: connectingLine.getPoints()[0], y: connectingLine.getPoints()[1] };
			var p2GroupCoords = { x: connectingLine.getPoints()[2], y: connectingLine.getPoints()[3] };
			var p1ImageLayerCoords = ViewerHelper.TranslatePointCoords(p1GroupCoords, primaryCORGroup, imglayer);
			var p2ImageLayerCoords = ViewerHelper.TranslatePointCoords(p2GroupCoords, primaryCORGroup, imglayer);
		}

		var lineLabel = primaryCORGroup.find('.lineLabel')[0];
		var primaryCORCenterOfRotationLabelTool = null;
		var labelText;
		var labelPositionImageCoords;
		if (lineLabel) {
			labelText = lineLabel.getText().text();
			var labelPositionContainerCoords = lineLabel.getPosition();
			labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, primaryCORGroup, imglayer);
			primaryCORCenterOfRotationLabelTool = {
				name: '.lineLabel',
				text: labelText,
				position: labelPositionImageCoords
			}
		}

		var primaryCORCenterOfRotation = {
			circleP1: p1ImageLayerCoords,
			circleP2: p2ImageLayerCoords,
			label: primaryCORCenterOfRotationLabelTool
		}

		//secondary
		var secondaryCORGroup = container.findOne('.secondaryCORGroup');
		var connectingLine = secondaryCORGroup.find('.connectingLine')[0];
		if (connectingLine) {
			var p1GroupCoords = { x: connectingLine.getPoints()[0], y: connectingLine.getPoints()[1] };
			var p2GroupCoords = { x: connectingLine.getPoints()[2], y: connectingLine.getPoints()[3] };
			var p1ImageLayerCoords = ViewerHelper.TranslatePointCoords(p1GroupCoords, secondaryCORGroup, imglayer);
			var p2ImageLayerCoords = ViewerHelper.TranslatePointCoords(p2GroupCoords, secondaryCORGroup, imglayer);
		}

		lineLabel = secondaryCORGroup.find('.lineLabel')[0];
		var secondaryCORCenterOfRotationLabelTool = null;

		if (lineLabel) {
			labelText = lineLabel.getText().text();
			var labelPositionContainerCoords = lineLabel.getPosition();
			labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, secondaryCORGroup, imglayer);
			secondaryCORCenterOfRotationLabelTool = {
				name: '.lineLabel',
				text: labelText,
				position: labelPositionImageCoords
			}
		}

		var secondaryCORCenterOfRotation = {
			circleP1: p1ImageLayerCoords,
			circleP2: p2ImageLayerCoords,
			label: secondaryCORCenterOfRotationLabelTool
		}
		//end centers of rotation

		var corToolData = {
			shapeType: 'CORTool',
			shapeName: CorToolViewer.CORGroupName,
			isVisible: container.isVisible(),
			isHealthySideLeft: isHealthySideLeft,
			corToolLLD: corLLDTool,
			corCenterPointFinderLineRight: corCenterPointFinderRight,
			corCenterPointFinderLineLeft: corCenterPointFinderLeft,
			centerOfRotationPrimary: primaryCORCenterOfRotation,
			centerOfRotationSecondary: secondaryCORCenterOfRotation
		}

		return corToolData;
	}

	SetCORToolFromSWIP(corSWIPItem: any) {
		var _this = this;
		var sCORData = JSON.stringify(corSWIPItem);
		var corSwipData: CorSWIPData = JSON.parse(sCORData);

		function onBeforeDeleteChildFunction(child: any) {
			var stage = child.getStage();
			var templatesLayer = stage.findOne('.segmentAndTemplatelayer');
			var inclinationLabel = templatesLayer.findOne('.inclinationLabel');
			if (inclinationLabel) ViewerHelper.removeLabel(_this.viewer, 'inclinationLabel', true);

			var container = child.getParent();
			container.destroy();
		}

		var corGroup = new Konva.Group({
			draggable: true,
			name: CorToolViewer.CORGroupName,
			isLeftLeg: _this.viewer.imageOrientation.IsLeftBodyPart,
			getReport: this.getReport,
			getSWIP: this.getSWIP,
			onBeforeDeleteChildFunction: onBeforeDeleteChildFunction
			//femOffset: null,
		})

		_this.viewer.shapeslayer.add(corGroup);

		//lld 
		var lldTool: DTOLldTool = new DTOLldTool();
		lldTool.LeftTearDrop = corSwipData.corToolLLD.tearDrop1;
		lldTool.RightTearDrop = corSwipData.corToolLLD.tearDrop2;
		lldTool.LeftLesserTrochanter = corSwipData.corToolLLD.pLesser1;
		lldTool.RightLesserTrochanter = corSwipData.corToolLLD.pLesser2;
		this.SetCorLldTool(_this.viewer, corGroup, lldTool);

		BasicToolsViewer.UpdateLabelOnSwip(corGroup, corSwipData.corToolLLD.tearDroplineLabel);
		BasicToolsViewer.UpdateLabelOnSwip(corGroup, corSwipData.corToolLLD.tearDrop1PerpendicularlineLabel);
		BasicToolsViewer.UpdateLabelOnSwip(corGroup, corSwipData.corToolLLD.tearDrop2PerpendicularlineLabel);

		//center of rotation
		this.SetMasterCenterOfRotationGroupOnSWIP(_this.viewer, corGroup, corSwipData.centerOfRotationPrimary);

		//femAxisGroups
		var femurLeftAnatomicalAxisGroup = this.SetFemurAnatomicalAxisFromSWIP(_this.viewer, corGroup, corSwipData.corCenterPointFinderLineLeft, true);
		var femurRightAnatomicalAxisGroup = this.SetFemurAnatomicalAxisFromSWIP(_this.viewer, corGroup, corSwipData.corCenterPointFinderLineRight, false);

		BasicToolsViewer.UpdateLabelOnSwip(femurLeftAnatomicalAxisGroup, corSwipData.corCenterPointFinderLineLeft.femoralOffsetLabel);
		BasicToolsViewer.UpdateLabelOnSwip(femurRightAnatomicalAxisGroup, corSwipData.corCenterPointFinderLineRight.femoralOffsetLabel);

		var primaryCORGroup = corGroup.findOne('.masterCORGroup');
		//var secondaryCORGroup = corGroup.findOne('.secondaryCORGroup');

		BasicToolsViewer.UpdateLabelOnSwip(primaryCORGroup, corSwipData.centerOfRotationPrimary.label);
		//the second label was removed from tool
		//BasicToolsViewer.UpdateLabelOnSwip(secondaryCORGroup, corSwipData.centerOfRotationSecondary.label);

		_this.viewer.shapeslayer.drawScene();
	}

	private SetFemurAnatomicalAxisFromSWIP(viewer: any, corGroup: any, corCenterPointFinder: CorCenterPointFinder, isLeftBodyPart: boolean) {
		var group = this.CreateFemurAnatomocalAxisGroup(viewer, corGroup, isLeftBodyPart);

		this.SetCenterPointFinderLines(viewer, group, corCenterPointFinder.lowerCenterPointFinderLineP1, corCenterPointFinder.lowerCenterPointFinderLineP2,
			corCenterPointFinder.upperCenterPointFinderLineP1, corCenterPointFinder.upperCenterPointFinderLineP2);

		viewer.shapeslayer.drawScene();

		return group;
	}

	GetCupLocationForTreatedSide  ():any {

		let cupLocation = new DTOCupLocationDetails();
		let shapeslayer = this.viewer.getShapeslayer();
		let corToolGroup = shapeslayer.findOne('.' + CorToolViewer.CORGroupName);

		if (corToolGroup) { // && corToolGroup.isVisible()
			let secondaryCORGroup = corToolGroup.findOne('.secondaryCORGroup');
			let circle = secondaryCORGroup.findOne('.circle');
			let radiusPxl = circle.getRadius();
			let pointInGroup = circle.getPosition();

			cupLocation.Location = ViewerHelper.TranslatePointCoords(pointInGroup, secondaryCORGroup, this.viewer.segmentAndTemplatelayer)
			cupLocation.Radius = this.viewer.Pixels2MM(radiusPxl);
			cupLocation.Angle = null; //get from auto data
		}
		return cupLocation;
	}

	GetStemLocationForTreatedSide(): DTOStemLocationDetails {

		var stemLocation = new DTOStemLocationDetails();
		var shapeslayer = this.viewer.getShapeslayer();
		var corToolGroup = shapeslayer.findOne('.' + CorToolViewer.CORGroupName);
		if (corToolGroup) {

			var side = corToolGroup.getAttr('isLeftLeg') ? "Left" : "Right";

			var femAxisGroup = corToolGroup.findOne('#' + side);
			var femAxisLine = femAxisGroup.findOne('.femurAxisLine');
			var points = femAxisLine.getPoints();
			var vec1 = new Vec2(points[0], points[1]);
			var vec2 = new Vec2(points[2], points[3]);
			var axisVec = vec1.subV(vec2);
			var yVec = new Vec2(0, 100);
			if (axisVec.dot(yVec) < 0) {
				axisVec = axisVec.mulS(-1);//make it point down		
			}
			var startVecG = vec1.y < vec2.y ? vec1 : vec2;
			var startPoint = ViewerHelper.TranslatePointCoords(startVecG, femAxisGroup, this.viewer.segmentAndTemplatelayer);
			var angleObj = MathL.CalcAngle(yVec, axisVec, { x: 0, y: 0 })
			stemLocation.Location = startPoint;
			stemLocation.Angle = angleObj.angleDegree;
			stemLocation.Width = null;
		}
		return stemLocation;
	}


	//*** connect functions fem axis group and line finders
	static ConnectLowerFinderLine = function (group, viewer) {

		var a1 = group.findOne('.lcpf1');
		var lcpf1V = new Vec2(a1.getX(), a1.getY());
		var a2 = group.findOne('.lcpf2');
		var lcpf2V = new Vec2(a2.getX(), a2.getY());
		var lowerCenterPointFinderLine = group.findOne('.lowerCenterPointFinderLine');
		var lowerCenterPointFinderLineHitRegion = group.findOne('.lowerCenterPointFinderLineHitRegion');
		lowerCenterPointFinderLine.setPoints([lcpf1V.x, lcpf1V.y, lcpf2V.x, lcpf2V.y]);
		lowerCenterPointFinderLineHitRegion.setPoints([lcpf1V.x, lcpf1V.y, lcpf2V.x, lcpf2V.y]);
		CorToolViewer.ConnectFemAxisPoints(group.getParent(), viewer);
	}
	static ConnectUpperFinderLine = function (group, viewer) {

		var a1 = group.findOne('.ucpf1');
		var ucpf1V = new Vec2(a1.getX(), a1.getY());
		var a2 = group.findOne('.ucpf2');
		var ucpf2V = new Vec2(a2.getX(), a2.getY());
		var upperCenterPointFinderLine = group.findOne('.upperCenterPointFinderLine');
		var upperCenterPointFinderLineHitRegion = group.findOne('.upperCenterPointFinderLineHitRegion');
		upperCenterPointFinderLine.setPoints([ucpf1V.x, ucpf1V.y, ucpf2V.x, ucpf2V.y]);
		upperCenterPointFinderLineHitRegion.setPoints([ucpf1V.x, ucpf1V.y, ucpf2V.x, ucpf2V.y]);
		CorToolViewer.ConnectFemAxisPoints(group.getParent(), viewer);
	}

	static ConnectFemAxisPoints(group, viewer: Viewer) {

		var layer = group.getLayer();

		var connectingLine = group.findOne('.' + CorToolViewer.FemurAxisLine);
		var connectingLineHitRegion = group.findOne('.' + CorToolViewer.FemurAxisLine + 'HitRegion');
		//find center point
		var lowerCenterPointFinderLine = group.findOne('.lowerCenterPointFinderLine');
		var lPts = lowerCenterPointFinderLine.getPoints();
		var lPt1 = new PointF(lPts[0], lPts[1]);
		var lPt2 = new PointF(lPts[2], lPts[3]);
		var lowerCenterPoint = ViewerHelper.TranslatePointCoords(MathL.GetMiddlePt(lPt1, lPt2), lowerCenterPointFinderLine, group);
		//find center point
		var upperCenterPointFinderLine = group.findOne('.upperCenterPointFinderLine');
		var uPts = upperCenterPointFinderLine.getPoints();
		var uPt1 = new PointF(uPts[0], uPts[1]);
		var uPt2 = new PointF(uPts[2], uPts[3]);
		var upperCenterPoint = ViewerHelper.TranslatePointCoords(MathL.GetMiddlePt(uPt1, uPt2), upperCenterPointFinderLine, group);
		//find dir vec and edge point
		var vec = new Vec2(lowerCenterPoint.x - upperCenterPoint.x, lowerCenterPoint.y - upperCenterPoint.y);
		//make dir point down
		if (vec.dot(new Vec2(0, 100)) < 0) vec = vec.mulS(-1);

		var dicomimg = group.getStage().findOne('.dicomimg');
		var stage = group.getStage();
		var imageStartPt = ViewerHelper.TranslatePointCoords(new PointF(dicomimg.getX(), dicomimg.getY()), stage, group);
		var imageSizeVector = ViewerHelper.TranslateVectorCoords(new PointF(dicomimg.getWidth(), dicomimg.getHeight()), dicomimg, group);
		var endPoint = MathL.calcIntersectionWithRect(upperCenterPoint, vec, new RectangleF(imageStartPt.x, imageStartPt.y, imageSizeVector.x, imageSizeVector.y));
		//calc proj of center of rotation to femaxis

		var corGroup = group.parent;
		var circlesArr = corGroup.find('.circle');
		var closestProjLen = null;
		var closestProjPt = null;
		var centerV = null;
		var circleGroup;
		circlesArr.forEach(function (c, i) {

			var cV = new Vec2(c.getPosition().x, c.getPosition().y);
			var projPt = ViewerHelper.calcProjectedPointOnLine(new Vec2(lowerCenterPoint.x, lowerCenterPoint.y), new Vec2(upperCenterPoint.x, upperCenterPoint.y), cV);
			var projLen = MathL.Distance(projPt, cV);

			if (closestProjLen == null || closestProjLen > projLen) {
				closestProjLen = projLen;
				closestProjPt = projPt;
				centerV = cV;
				circleGroup = c.parent;
			}

		});

		var centerPt = ViewerHelper.TranslatePointCoords(centerV, circleGroup, group)
		centerV = new Vec2(centerPt.x, centerPt.y);
		closestProjPt = ViewerHelper.calcProjectedPointOnLine(new Vec2(lowerCenterPoint.x, lowerCenterPoint.y), new Vec2(upperCenterPoint.x, upperCenterPoint.y), centerV);

		///////
		if (closestProjPt != null && endPoint != null) {
			if (connectingLine == null) {
				connectingLine = ViewerHelper.addConnectingLine(group, "connectingLine");
				connectingLineHitRegion = group.findOne('.connectingLineHitRegion');
			}
			connectingLine.setPoints([closestProjPt.x, closestProjPt.y, endPoint.x, endPoint.y]);
			connectingLineHitRegion.setPoints([closestProjPt.x, closestProjPt.y, endPoint.x, endPoint.y]);
			connectingLine.setZIndex(1);
			connectingLineHitRegion.setZIndex(0);
		}

		CorToolViewer.connectFemOffsetLineLabel(group, viewer);



		layer.batchDraw();
	}//end ConnectFemAxisPoints


	///////////////////////////////////////////////OLD//////////////////////////
	static OLDconnectOtherCORCircle(group) {
		var p1Crc = group.find('.p1')[0];
		var p2Crc = group.find('.p2')[0];
		var p1 = new Vec2(p1Crc.getX(), p1Crc.getY());
		var p2 = new Vec2(p2Crc.getX(), p2Crc.getY());
		var centerPt = MathL.GetMiddlePt(p1, p2);
		var center = new Vec2(centerPt.x, centerPt.y);
		var radius = MathL.Distance(center, p1);
		var corGroup = group.getParent();
		var corLLDGroup = corGroup.find('.' + CorToolViewer.CORLLDGroupName)[0];
		var tearDrop1Crc = corGroup.find('.tearDrop1')[0];
		var tearDrop2Crc = corGroup.find('.tearDrop2')[0];
		var tearDrop1 = new Vec2(tearDrop1Crc.getX(), tearDrop1Crc.getY());
		var tearDrop2 = new Vec2(tearDrop2Crc.getX(), tearDrop2Crc.getY());
		var lldVec = MathL.SubtractPoints(tearDrop1, tearDrop2);
		if (lldVec.x < 0) {
			lldVec.mulS(-1);//make sure it points right
		}
		var projOnLLD = ViewerHelper.calcProjectedPointOnLine(tearDrop1, tearDrop2, center);

		var closestTearDrop = (MathL.Distance(center, tearDrop1) < MathL.Distance(center, tearDrop2)) ? tearDrop1 : tearDrop2;
		var oppositeTearDrop = (MathL.Distance(center, tearDrop1) < MathL.Distance(center, tearDrop2)) ? tearDrop2 : tearDrop1;
		var toCenterVec = MathL.SubtractPoints(center, closestTearDrop);
		//make sure it points up
		if (toCenterVec.y > 0) {
			toCenterVec = toCenterVec.mulS(-1)
		}
		//calculate offset to next second teardrop
		var offsetTdToTd = MathL.Distance(tearDrop1, tearDrop2);
		// calculate offset on lld line
		var offsetOnLLd = MathL.Distance(closestTearDrop, projOnLLD);
		//is normal from center to lld in between to tearddrops?
		var tearDropsShareSide = MathL.doPointsShareSide(center, projOnLLD, tearDrop1, tearDrop2); //yes = 1 no = -1
		// mirror center ;axis is normal to lld
		var NlldVec = lldVec.normalize();
		if (tearDropsShareSide > 0) {
			var oppositeCenter = center.addV(NlldVec.mulS(offsetOnLLd * 2 + offsetTdToTd));
		} else {
			var oppositeCenter = center.addV(NlldVec.mulS(offsetTdToTd - offsetOnLLd * 2));
		}
		//test
		var otherCircle = corGroup.find('.otherCircle')[0];
		if (otherCircle == null) {
			otherCircle = new Konva.Circle({
				stroke: 'red',
				strokeWidth: 2,
				originalColor: 'red',
				name: 'otherCircle',
				shapeType: "circleTool",
				draggable: true,
				x: oppositeCenter.x,
				y: oppositeCenter.y,
				radius: radius,
			});
			corGroup.add(otherCircle);
		} else {
			otherCircle.setX(oppositeCenter.x);
			otherCircle.setY(oppositeCenter.y);
			otherCircle.setRadius(radius);
		}
		otherCircle.fillEnabled(false);//males click event propagate
		corGroup.getLayer().batchDraw();//draw();
	}//old

}//end CorToolViewer
