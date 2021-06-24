//// <reference path="../Declaretions.ts" />

'use strict';


interface IinterLinelToolViewer {

	SetInterlineAngle(shapeName: string, strokeColor: any): void;
	getReport(container: any): any;

}


class InterLineViewer implements IinterLinelToolViewer {

	private viewer;
	public setDrawData;
	constructor(viewer: IViewer) {
		this.viewer = viewer;
	}
	static viewer;

	// helping  functions start
	 buildShape = function (shapeName) {

		// create group and sub groups
		var group = this.createGroup(shapeName, true)
		//var bottomGroup = this.createGroup("bottomGroup",false);
		//var upperGroup = this.createGroup("upperGroup", false);
		//var middleGroup = this.createGroup("middleGroup", false);

		// add Connecting Lines and label
		 ViewerHelper.addConnectingLine(group, 'bottomLine');
		 ViewerHelper.addConnectingLine(group, 'upperLine');
		 var interLine = ViewerHelper.addConnectingLine(group, 'interLine');
		 ViewerHelper.addLabelWithDirection(group, 'lineLabel', '#ed145b', interLine, 'left', 14, 0.8, null, null, 'white');
	
		// add groups to shape layer
		this.addGroupsToShapeLayer([group]);
		//, upperGroup, middleGroup, bottomGroup
		// group = this.connnetSubGroupToGroup(group, [bottomGroup, upperGroup, middleGroup]);

		return group;

	}
	makeLabelEditable = function (group) { 
		var label = group.find(".lineLabel")[0];
		label.setAttr('doubleClickFunc', InterLineViewer.labelDoubleClickFunc)
	}
	static labelDoubleClickFunc = function (label) {
		var group = label.parent;
		var textNode = label.children[1];
		BasicToolsViewer.addEditLabelText(group, label.children[0], textNode)
	}

	 createGroup = function (groupName, isGetReport) { 
		var group = new Konva.Group({
			name: groupName,
			draggable: true
		});
		 var report = this.getReport;
		 if (isGetReport) {
	
			 group.setAttr('getReport', this.getReport);
         }

         var getSWIP = function (container) {

			 var imglayer = container.getStage().find('.imglayer')[0];
			 var l1p1 = container.find('.l1p1')[0];
			 var l1p2 = container.find('.l1p2')[0];
			 var l2p1 = container.find('.l2p1')[0];
			 var l2p2 = container.find('.l2p2')[0];
			 if (!(l1p1 || l1p2 || l2p1 || l2p2)) {
				 return null;
			 }
			 var line1P1_imageLayerCoords = ViewerHelper.TranslatePointCoords({ x: l1p1.getX(), y: l1p1.getY() }, container, imglayer);
			 var line1P2_imageLayerCoords = ViewerHelper.TranslatePointCoords({ x: l1p2.getX(), y: l1p2.getY() }, container, imglayer);
			 var line2P1_imageLayerCoords = ViewerHelper.TranslatePointCoords({ x: l2p1.getX(), y: l2p1.getY() }, container, imglayer);
			 var line2P2_imageLayerCoords = ViewerHelper.TranslatePointCoords({ x: l2p2.getX(), y: l2p2.getY() }, container, imglayer);

             var lineLabel = container.find('.lineLabel')[0];
             var labelText;
             var labelPositionImageCoords;
             if (lineLabel) {
                 labelText = lineLabel.getText().text();
                 var labelPositionContainerCoords = lineLabel.getPosition();
                 labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);
             }

             var toolLabel = {
                 name: '.lineLabel',
                 text: labelText,
                 position: labelPositionImageCoords
             }

             var toolData = {
                 shapeType: 'InterlineAngle',
                 shapeName: container.getName(),
                 isVisible: container.isVisible(),
				 Line1P1: line1P1_imageLayerCoords,
				 Line1P2: line1P2_imageLayerCoords,
				 Line2P1: line2P1_imageLayerCoords,
				 Line2P2: line2P2_imageLayerCoords,
                 label: toolLabel
             }

             return toolData;
         }

         group.setAttr('getSWIP', getSWIP);

		return group
	}
	getReport = function (container) {
		if (!container.isVisible()) return null;
		var lineLabel = container.find('.lineLabel')[0];
		if (lineLabel) {
			var angleValue = lineLabel.getText().text();
			return new KeyValuePair('Interline Angle', angleValue);
		}
		return null;
	}
	 addGroupsToShapeLayer = function(groups) { 
		 var _this = this  ;
		var groups = groups.map(group => { 
			_this.viewer.shapeslayer.add(group)
			return group
		})
	}
	 connnetSubGroupToGroup = function (group, arrayOfSubs) { 
		arrayOfSubs.map(sub => { 
			group.add(sub);
		})
		return group;
	}
	connectInterlineAngleTool = function (group, strokeColor) {
		// get  elements
		var layer = group.getLayer();
		var l1p1 = group.find('.l1p1')[0];
		var l1p2 = group.find('.l1p2')[0];
		var l2p1 = group.find('.l2p1')[0];
		var l2p2 = group.find('.l2p2')[0];
		var upperLine = group.find('.upperLine')[0];
		var bottomLine = group.find('.bottomLine')[0];
		var interLine = group.find('.interLine')[0];
		var upperLineHitRegion = group.find('.upperLineHitRegion')[0];
		var bottomLineHitRegion = group.find('.bottomLineHitRegion')[0];
		var lineLabel = group.find('.lineLabel')[0];
		var angleData = MathL.CalcInterLineAngle(ViewerHelper.GetObjectLocation(l1p1), ViewerHelper.GetObjectLocation(l1p2), ViewerHelper.GetObjectLocation(l2p1), ViewerHelper.GetObjectLocation(l2p2));
		var angleDataText = Math.round(angleData.absAngleDegree) + "\u00B0";

		// set elements
		bottomLine.setPoints([l1p1.getX(), l1p1.getY(), l1p2.getX(), l1p2.getY()]);
		bottomLineHitRegion.setPoints([l1p1.getX(), l1p1.getY(), l1p2.getX(), l1p2.getY()]);
		upperLine.setPoints([l2p1.getX(), l2p1.getY(), l2p2.getX(), l2p2.getY()]);
		upperLineHitRegion.setPoints([l2p1.getX(), l2p1.getY(), l2p2.getX(), l2p2.getY()]);
		interLine.setPoints([(l1p1.getX() + l1p2.getX()) / 2, (l1p1.getY() + l1p2.getY()) / 2, (l2p1.getX() + l2p2.getX()) / 2, (l2p1.getY() + l2p2.getY()) / 2]);
		var length1 = ViewerHelper.calculateLineLength(upperLine);
		var length2 = ViewerHelper.calculateLineLength(bottomLine);
		var midPoint = ViewerHelper.calculateLineCenterPoint(interLine);
		ViewerHelper.moveLabel(lineLabel, midPoint);

		 // handleEditableLabel - make editable comment separated from degree text
		 var textNode = InterLineViewer.handleEditableLabel(group.find('.lineLabel')[0], angleDataText)
		var shapeLines = {
			interLine: interLine,
			bottomLineHitRegion: bottomLineHitRegion,
			bottomLine: bottomLine,
			upperLineHitRegion: upperLineHitRegion,
			upperLine: upperLine,
			lineLabel: lineLabel
		}
		InterLineViewer.drawShape(layer, shapeLines, textNode);
	}
	
	 static handleEditableLabel = function (label, angleDataText) { 
		var textNode = label.children[1];
		if (!textNode._partialText) {
			textNode['_partialText'] = angleDataText;
		}
		else {
			if (textNode._partialText.indexOf(' ') > 0) {
				var oldDegreeText = textNode._partialText.substr(0, textNode._partialText.indexOf(' '));
				textNode['_partialText'] = textNode._partialText.replace(oldDegreeText, angleDataText)
			} else {
				textNode['_partialText'] = angleDataText;
			}
		}
		return textNode
	}
	 static drawShape = function (layer, shapeLines, textNode) { 
		shapeLines.lineLabel.find('Text')[0].setText(textNode['_partialText']);
		shapeLines.upperLine.setZIndex(0);
		shapeLines.upperLineHitRegion.setZIndex(1);
		shapeLines.bottomLine.setZIndex(0);
		shapeLines.bottomLineHitRegion.setZIndex(1);
		shapeLines.interLine.setZIndex(0);
		layer.batchDraw();
	}
	 static createAnchors = function (x, y, drawData, toolLegsOffset, imageRect) { 
		// connectFunction will be  used only  in event listenr
		 var anchor1 = Viewer.addAnchor(drawData.group, x, y, "l1p1", drawData.connectFunction, null , null, null);

		var anchor2x;
		if (x + toolLegsOffset > imageRect.Right) {
			anchor2x = x - toolLegsOffset;
		} else {
			anchor2x = x + toolLegsOffset;
		}
		 var anchor2 = Viewer.addAnchor(drawData.group, anchor2x, y, "l1p2", drawData.connectFunction, null, null, null); // connectFunction anchor  adding
		var anchor3y;
		if (y - toolLegsOffset < 0) {
			anchor3y = y + toolLegsOffset;
		} else {
			anchor3y = y - toolLegsOffset;
		}

		 var anchor3 = Viewer.addAnchor(drawData.group, x, anchor3y, "l2p1", drawData.connectFunction, null, null, null);
		var anchor4x = anchor2x;
		var anchor4y = anchor3y;
		 var anchor4 = Viewer.addAnchor(drawData.group, anchor4x, anchor4y, "l2p2", drawData.connectFunction, null, null, null);
		var anchors = {
			anchor1: anchor1,
			anchor2: anchor2,
			anchor3: anchor3,
			anchor4: anchor4
		}
		 return anchors
}
	static onSetDrawPointStart = function (x, y, setDrawData) {
		// strat drawing to tool
		 var stageWidth = setDrawData.stage.getWidth();
		 var stageHeight = setDrawData.stage.getHeight();
		 var screenStartOnImgCoords = MathL.TranslateScreenPointToImagePoint(setDrawData.viewer.img, new PointF(0, 0));
		 var screenEndOnImgCoords = MathL.TranslateScreenPointToImagePoint(setDrawData.viewer.img, new PointF(stageWidth, stageHeight));
		 var imageRect = RectangleF.CreateFromPoints(screenStartOnImgCoords, screenEndOnImgCoords).Intersect(RectangleF.CreateFromPoints(new PointF(0, 0), new PointF(setDrawData.imageWidth, setDrawData.imageHeight)));

		var toolLegsOffset = Math.min(imageRect.width, imageRect.height) / 8;
		 var anchors = InterLineViewer.createAnchors(x, y, setDrawData, toolLegsOffset, imageRect);
		 setDrawData.connectFunction(setDrawData.group, setDrawData.strokeColor);
		 setDrawData.viewer.SetCurrentSelected(anchors.anchor2);
		 setDrawData.stage.getLayers().off("mousedown");
		 setDrawData.stage.getLayers().off("touchstart");
		 setDrawData.viewer.SetDeActivateViewerMouseState();
		 setDrawData.viewer.shapeslayer.drawScene();
	}
	
	// helping  functions end
	public SetInterlineAngle = function (shapeName: string, strokeColor) {
		// init params
		var group = this.buildShape(shapeName);
		this.makeLabelEditable(group);
		this.viewer.SetViewerMouseState('interlineAngle');
		this.setDrawData = {
			imageWidth: this.viewer.originalImageWidth,
			imageHeight: this.viewer.originalImageHeight,
			strokeColor: strokeColor,
			group: group,
			stage: group.getStage(),
			connectFunction: this.connectInterlineAngleTool,
			viewer: this.viewer
		}
		InterLineViewer.viewer = this.viewer;
		var _this = this;
		// listen to event
		this.setDrawData.stage.getLayers().on("mousedown touchstart", function (e) {
			var layerCoords = ViewerHelper.getOffset(e.evt);
			var imgcoords = MathL.TranslateScreenPointToImagePoint(_this.setDrawData.viewer.imglayer, layerCoords);
			InterLineViewer.onSetDrawPointStart(imgcoords.x, imgcoords.y, _this.setDrawData);
        });       
	}
	
    SetInterlineAngleFromSWIP = function (interlineAngleSwipItem: any) {
        var sInterLineToolData = JSON.stringify(interlineAngleSwipItem); 
        var interLineToolSWIPData: InterLineSWIPData = JSON.parse(sInterLineToolData);

        var group = this.buildShape(interLineToolSWIPData.shapeName);
        this.makeLabelEditable(group);

        var strokecolor = 'red';
        var anchor = Viewer.addAnchor(group, interLineToolSWIPData.Line1P1.x, interLineToolSWIPData.Line1P1.y, "l1p1", this.connectInterlineAngleTool);
        Viewer.addAnchor(group, interLineToolSWIPData.Line1P2.x, interLineToolSWIPData.Line1P2.y, "l1p2", this.connectInterlineAngleTool);
		Viewer.addAnchor(group, interLineToolSWIPData.Line2P1.x, interLineToolSWIPData.Line2P1.y, "l2p1", this.connectInterlineAngleTool);
		Viewer.addAnchor(group, interLineToolSWIPData.Line2P2.x, interLineToolSWIPData.Line2P2.y, "l2p2", this.connectInterlineAngleTool);

        this.connectInterlineAngleTool(group, strokecolor);

        BasicToolsViewer.UpdateLabelOnSwip(group, interLineToolSWIPData.label);

        this.viewer.SetCurrentSelected(anchor);

        BasicToolsViewer.RefreshLayerOnSwip(this.viewer, group);
    }

}