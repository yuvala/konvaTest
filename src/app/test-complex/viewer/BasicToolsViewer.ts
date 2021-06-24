//// <reference path="../Declaretions.ts" />

'use strict';

import { Viewer } from "./Viewer";

//declare var ResizeObserver;

interface IBasicToolsViewer {

	Ruler(shapeName: string, strokeColor:string, dragendCallback:Function): void;
	Circle(shapeName: string, strokeColor:string, dragendCallback:Function): void;
	SetAngleTool(shapeName: string, strokeColor:string): void;
	AngleTool(shapeName: string, strokeColor:string): void;
	SetCircleByCenter(radius: number, centerX: number, centerY: number, shapeName: string, strokecolor?: string, dragendCallback?): void;
	SetCircle(radius: number, p1: PointF, p2: PointF, shapeName: string, strokecolor?: string, dragendCallback?, count?: number): void;
	SetRuler(x1: number, y1: number, x2: number, y2: number, shapeName: string, strokecolor?: string, dragendCallback?): void;


	//SWIP functions
	SetRulerFromSWIP(rulerSwipItem: any): void;
	SetCircleFromSWIP(circleSwipItem: any): void;
	SetAngleToolFromSWIP(angleSwipItem: any): void;
}

class BasicToolsViewer implements IBasicToolsViewer {

	private viewer;
	//static RulerGroupName = 'RulerGroup';
	//static AngleGroupName = 'AngleGroup';
	//static CircleGroupName ='CircleGroup';
	// Constructor



	constructor(viewer: Viewer) {
		this.viewer = viewer;
		console.log('xxxxx ');
	}

	//static isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream'];
	static isIos = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform) || (/Mac/.test(navigator.userAgent) && "ontouchend" in document);

	static isIE = /MSIE|Trident\//.test(window.navigator.userAgent);

	static checkIfIE = function () {
		var rv = 0; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer') {
			var ua = navigator.userAgent,
				re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
			if (re.exec(ua) !== null) {
				rv = parseFloat(RegExp.$1);
			}
		}
		// Trident is the ie version
		else if (navigator.appName == "Netscape" && navigator.appVersion.indexOf('Trident') > 0) {
			/// in IE 11 the navigator.appVersion says 'trident'
			/// in Edge the navigator.appVersion does not say trident
			if (navigator.appVersion.indexOf('Trident') === -1) rv = 12;
			else rv = 11;
		}
		return rv;
	}
	//static isIE = BasicToolsViewer.checkIfIE();
	static addEditLabelText = function (label, tag, textNode, specialSeparatorStr?: string[]) {

		event.preventDefault();


		if (!document.getElementById("edit-label-textare")) {
			var stage = label.getStage();
			var layer = label.getLayer();
			textNode.setAttr('editableLabel', true);
			// create textarea over canvas with absolute position
			// at first lets find position of text node relative to the stage:
			var textPosition = textNode.getAbsolutePosition();
			// then lets find position of stage container on the page:
			var stageBox = stage.container().getBoundingClientRect();

			// so position of textarea will be the sum of positions above:
			var areaPosition = {
				x: stageBox.left + textPosition.x,
				y: stageBox.top + textPosition.y - 5
			};
			// create textarea and style it
			var textarea = document.createElement('textarea');

			textarea.id = "edit-label-textare";
			//	textarea.setAttribute('resize', 'vertical');
			//$('#edit-label-textare').resizable({handles:"se"});
			document.body.appendChild(textarea);
			var degreeText: string;
			var freeText: string;
			var fontSize: number;

			if (specialSeparatorStr && specialSeparatorStr.length > 0) {
				for (var i = 0; i < specialSeparatorStr.length; i++) {

					if (textNode._partialText.indexOf(specialSeparatorStr[i]) > 0) {
						degreeText = textNode._partialText.substr(0, textNode._partialText.indexOf(specialSeparatorStr[i]) + specialSeparatorStr[i].length + 1);
					}
				}

			} else {
				// if there is additional text - cut the degrees/mm out

				// handle mm 
				if (textNode._partialText.indexOf('mm') > 0) {
					degreeText = textNode._partialText.substr(0, textNode._partialText.indexOf('mm') + 3);
				}
				// handle degrees
				else if (textNode._partialText.indexOf(' ') > 0) {
					degreeText = textNode._partialText.substr(0, textNode._partialText.indexOf(' '));
				} else {
					degreeText = textNode._partialText;
				}
			}
			freeText = textNode._partialText.replace(degreeText, '').trim();

			// removing degree from free text and saving it

			textarea.value = freeText;
			textarea.style.position = 'absolute';
			textarea.style.top = areaPosition.y + 'px';
			textarea.style.left = areaPosition.x + 'px';
			textarea.classList.add("texttool-area");
			textarea.style.color = "#FFF";
			textarea.style.borderColor = "#FFF";
			textarea.style.width = textNode.width();
			textarea.style.fontSize = textNode.getAttr('originalFontSize') + 'px';
			//	TextAreaHelper.resize(textarea);
			textarea.focus();
			//check if works iPad;
			//@ts-igore
			//if (!BasicToolsViewer.isIE) {
			//	var resizeObserver = new ResizeObserver(entries => {
			//		var fontSize;
			//		entries.forEach(entry => {
			//			if (entry.contentBoxSize) {
			//				// Checking for chrome as using a non-standard array
			//				if (entry.contentBoxSize[0]) {
			//					fontSize = Math.min(1, entry.contentBoxSize[0].inlineSize / 200) + 'rem';
			//					//pElem.style.fontSize = Math.max(1, entry.contentBoxSize[0].inlineSize / 600) + 'rem';
			//				} else {
			//					fontSize = Math.min(1, entry.contentBoxSize.inlineSize / 200) + 'rem';
			//					//pElem.style.fontSize = Math.max(1, entry.contentBoxSize.inlineSize / 600) + 'rem';
			//				}
			//			} else {
			//				fontSize = Math.min(1, entry.contentRect.width / 200) + 'rem';
			//				//pElem.style.fontSize = Math.max(1, entry.contentRect.width / 600) + 'rem';
			//			}
			//		}
			//		)
			//		console.log(entries);
			//		console.log('Size changed :', fontSize);

			//	})
			//
			//	resizeObserver.observe(textarea);
			//}

			console.log('outside', this.viewer);
			var closeTextarea = function (e) {
				//@ts-ignore
				//if (!BasicToolsViewer.isIE) resizeObserver.unobserve(textarea);
				//
				if (isTextareOpen && !(event.type == "keydown" && e.keyCode != 13)) {
					event.preventDefault();
					isTextareOpen = false;
					if (textarea) {
						textNode.text(degreeText + ' ' + textarea.value);
						if (fontSize) {
							//textNode.setFontSize(fontSize);
							textNode.setAttr('originalFontSize', fontSize);
						}
						layer.draw();
						document.body.removeChild(textarea);

					}
				}

			}
			var closeTextareaOnIpad = function (e) {
				//console.log('closeTextareaOnIpad')
				if (e.target.id != 'edit-label-textare') {
					closeTextarea(e);
				}
			}
			var isTextareOpen = false;
			setTimeout(function () {
				isTextareOpen = true;
			}, 300)

			BasicToolsViewer.detectResize('edit-label-textare', 250, function (delta) {
				fontSize = BasicToolsViewer.changeFontSize('edit-label-textare', delta);
			});

			textarea.addEventListener('focusout', function (e) { closeTextarea(e) });
			textarea.addEventListener('blur', function (e) { closeTextarea(e) });
			textarea.addEventListener('keydown', function (e) { closeTextarea(e) });
			document.body.addEventListener('click', function (e) { closeTextareaOnIpad(e) });
			document.body.addEventListener('tap', function (e) { closeTextareaOnIpad(e) });
		}

		console.log(textarea);
		console.log($('#edit-label-textare'));

		//label.on('click tap',function() {
		//	console.log('label click or tap')
		//	openLabelTextare();
		//});
		//console.log(label);




	}
	//may be move to some utilities
	static changeFontSize(elId: string, delta: number): number {
		var el = document.getElementById(elId);
		var initialFontSize = parseFloat(el.style.fontSize.replace('px', ''))
		var fontSizeFloat = (initialFontSize + delta / 4);
		//var initialHeight = (el.style.height).replace("px", "");
		//console.log("Style H: ",initialHeight);
		//var fontSize = parseInt(initialHeight)/4;
		//console.log("Font Size to set: ", fontSize);
		//debugger
		if (fontSizeFloat < 14) fontSizeFloat = 14;
		el.style.fontSize = fontSizeFloat + "px";
		return fontSizeFloat;
	}
	//may be move to some utilities
	static detectResize = function (elId: string, interval: number, callback: any): any { //callback receives delta of current height minus previouse;
		var el = document.getElementById(elId);
		if (el) {
			var initialHeight = el.clientHeight;
			var thisHeight = el.clientHeight;
			var check = null;
			el.addEventListener('mousedown', function (e) {
				//console.log(e);
				startCheck();
			});
			el.addEventListener('keydown', function (e) {
				//console.log(e);
				startCheck();
			});
			el.addEventListener('mouseup', function (e) {
				//console.log(e);
				stopCheck();
			});
			el.addEventListener('keyup', function (e) {
				//console.log(e);
				stopCheck();
			});
			var startCheck = function () {
				if (!check) {
					check = setInterval(function () {
						thisHeight = el.clientHeight;
						//console.log("Initial height: ", initialHeight);
						document.addEventListener('mouseup', function (e) {
							stopCheck();
						}, false);
						if (thisHeight && initialHeight !== thisHeight) {
							var delta = thisHeight - initialHeight;
							console.log("IE check:");
							console.log(delta);
							initialHeight = thisHeight;
							callback(delta);
						} else {
							console.log("IE thisHeight:", thisHeight);
							console.log("IE initialHeight:", initialHeight);
						}

					}, interval)
				}
			}
			var stopCheck = function () {
				clearInterval(check);
				check = null;
			}
		}
		return null;
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
		return textNode;
	}

	Ruler = function (shapeName: string, strokeColor, dragendCallback) {

		var group = this.CreateRulerGroup(shapeName);
		this.viewer.SetViewerMouseState('ruler');
		BasicToolsViewer.SetDrawLineByDrag(this.viewer, group, '#ed145b', BasicToolsViewer.connectPoints, dragendCallback);
	}

	SetRuler = function (x1: number, y1: number, x2: number, y2: number, shapeName: string, strokecolor?: string, dragendCallback?) {

		this.PrepareRuler(x1, y1, x2, y2, shapeName, strokecolor, dragendCallback);
		this.viewer.shapeslayer.draw();
	}

	SetRulerFromSWIP = function (rulerSwipItem: any) {
		var sRulerData = JSON.stringify(rulerSwipItem);
		var rulerSwipData: RulerSWIPData = JSON.parse(sRulerData);

		var group = this.PrepareRuler(rulerSwipData.p1.x, rulerSwipData.p1.y, rulerSwipData.p2.x, rulerSwipData.p2.y, rulerSwipData.shapeName);
		BasicToolsViewer.UpdateLabelOnSwip(group, rulerSwipData.label);

		BasicToolsViewer.RefreshLayerOnSwip(this.viewer, group);
	}

	PrepareRuler = function (x1: number, y1: number, x2: number, y2: number, shapeName: string, strokecolor?: string, dragendCallback?) {
		if (this.viewer.stage == null) {
			this.viewer.InitStage();
		}
		var group = this.CreateRulerGroup(shapeName);
		if (strokecolor == null) strokecolor = 'red';

		var anchor = Viewer.addAnchor(group, x1, y1, "p1", BasicToolsViewer.connectPoints, null, dragendCallback);
		Viewer.addAnchor(group, x2, y2, "p2", BasicToolsViewer.connectPoints, null, dragendCallback);
		BasicToolsViewer.connectPoints(group, strokecolor);
		this.viewer.SetCurrentSelected(anchor);

		return group;
	}

	CreateRulerGroup = function (shapeName: string) {
		function getReport(container) {
			var connectingLine = container.find('.connectingLine')[0];
			if (connectingLine) {
				var pixelLength = ViewerHelper.calculateLineLength(connectingLine)
				var mmLength = pixelLength * container.getAttr('mmPerPixel');
				var lineLabel = container.find('.lineLabel')[0];
				if (lineLabel) {
					return { Key: 'Ruler', Value: lineLabel.getText().text() };
				} else {
					return { Key: 'Ruler', Value: Math.round(mmLength * 10) / 10 + ' mm' };
				}
			}
			return null;
		}

		function getSWIP(container): any {
			var connectingLine = container.find('.connectingLine')[0];
			if (connectingLine) {
				var imglayer = container.getStage().find('.imglayer')[0];
				var p1ContainerCoords = { x: connectingLine.getPoints()[0], y: connectingLine.getPoints()[1] };
				var p2ContainerCoords = { x: connectingLine.getPoints()[2], y: connectingLine.getPoints()[3] };
				var p1ImageLayerCoords = ViewerHelper.TranslatePointCoords(p1ContainerCoords, container, imglayer);
				var p2ImageLayerCoords = ViewerHelper.TranslatePointCoords(p2ContainerCoords, container, imglayer);
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
					shapeType: 'Ruler',
					shapeName: container.getName(),
					isVisible: container.isVisible(),
					p1: p1ImageLayerCoords,
					p2: p2ImageLayerCoords,
					label: toolLabel
				}

				return toolData;
			}
			else {
				return null;
			}
		}

		var group = new Konva.Group({
			name: shapeName,
			draggable: true,
			getReport: getReport,
			getSWIP: getSWIP,
			mmPerPixel: this.viewer.MMPerPixel
		});

		this.viewer.shapeslayer.add(group);

		return group;
	}

	Circle = function (shapeName: string, strokeColor, dragendCallback) {
		debugger;
		var group = this.CreateCircleGroup(shapeName);

		this.viewer.SetViewerMouseState('circle');
		BasicToolsViewer.SetDrawCircleByDrag(this.viewer, group, '#ed145b', BasicToolsViewer.connectPointsToCircleDiameter, dragendCallback);
	}

	SetCircle = function (radius: number, p1: PointF, p2: PointF, shapeName: string, strokecolor?: string, dragendCallback?, count?: number) {
		console.log('SetCircle');
		this.PrepareCircle(radius, p1, p2, shapeName, strokecolor, dragendCallback, count);

		this.viewer.shapeslayer.draw();
	}

	SetCircleByCenter = function (radius: number, centerX: number, centerY: number, shapeName: string, strokecolor?: string, dragendCallback?) {
		console.log('SetCircleByCenter');
		var p1 = new PointF(centerX - radius, centerY);
		var p2 = new PointF(centerX + radius, centerY);
		this.SetCircle(radius, p1, p2, shapeName, strokecolor, dragendCallback);
		//console.log('ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss');
	}

	PrepareCircle = function (radius: number, p1: PointF, p2: PointF, shapeName: string, strokecolor?: string, dragendCallback?, count?: number) {
		console.log('PrepareCircle');
		var _this = this;
		if (this.viewer.stage == null) {
			this.InitStage();
		}
		if (strokecolor == null) strokecolor = 'red';

		if (count == undefined)
			count = 0;
		/*
				// to prevent circle to apear before image 
				if (_this.viewer.img == undefined && count < 10) {
					count++;
					var timeout = setTimeout(function () { _this.SetCircle(radius, p1, p2, shapeName, strokecolor, dragendCallback, count); }, 100);
					return;
				}
		*/
		var group = this.CreateCircleGroup(shapeName);

		var anchor = Viewer.addAnchor(group, p1.x, p1.y, "p1", BasicToolsViewer.connectPointsToCircleDiameter, null, dragendCallback);
		Viewer.addAnchor(group, p2.x, p2.y, "p2", BasicToolsViewer.connectPointsToCircleDiameter, null, dragendCallback);
		BasicToolsViewer.connectPointsToCircleDiameter(group, strokecolor);

		return group;
	}

	SetCircleFromSWIP = function (circleSwipItem: any) {
		console.log('SetCircleFromSWIP');
		var sCirculeData = JSON.stringify(circleSwipItem);
		var circleSwipData: CircleSWIPData = JSON.parse(sCirculeData);

		var p1 = new PointF(circleSwipData.center.x - circleSwipData.radius, circleSwipData.center.y);
		var p2 = new PointF(circleSwipData.center.x + circleSwipData.radius, circleSwipData.center.y);
		var group = this.PrepareCircle(circleSwipData.radius, p1, p2, circleSwipData.shapeName);
		BasicToolsViewer.UpdateLabelOnSwip(group, circleSwipData.label);

		BasicToolsViewer.RefreshLayerOnSwip(this.viewer, group);
	}

	CreateCircleGroup = function (shapeName: string) {
		console.log('CreateCircleGroup');
		function getReport(container) {

			var connectingLine = container.find('.connectingLine')[0];
			if (connectingLine) {
				var pixelLength = ViewerHelper.calculateLineLength(connectingLine);

				var mmLength = pixelLength * container.getAttr('mmPerPixel');
				var lineLabel = container.find('.lineLabel')[0];
				if (lineLabel) {
					return { Key: 'Circle Diameter', Value: lineLabel.getText().text() };
				} else {
					return { Key: 'Circle Diameter', Value: Math.round(mmLength * 10) / 10 + ' mm' };
				}

			}
			return null;
		}

		function getSWIP(container): any {
			var imglayer = container.getStage().find('.imglayer')[0];
			var connectingLine = container.find('.connectingLine')[0];
			if (connectingLine) {
				var pixelLength = ViewerHelper.calculateLineLength(connectingLine);
				var mmPerPixel = container.getAttr('mmPerPixel');
				var mmLength = pixelLength * mmPerPixel;
				var p1ContainerCoords = { x: connectingLine.getPoints()[0], y: connectingLine.getPoints()[1] };
				var p2ContainerCoords = { x: connectingLine.getPoints()[2], y: connectingLine.getPoints()[3] };
				var p1ImageLayerCoords = ViewerHelper.TranslatePointCoords(p1ContainerCoords, container, imglayer);
				var p2ImageLayerCoords = ViewerHelper.TranslatePointCoords(p2ContainerCoords, container, imglayer);
				var pCenterImageLayerCoords = MathL.GetMiddlePt(p1ImageLayerCoords, p2ImageLayerCoords);
				var radius = ViewerHelper.getDistance(p1ImageLayerCoords, p2ImageLayerCoords) / 2;

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
					shapeType: 'Circle',
					shapeName: container.getName(),
					isVisible: container.isVisible(),
					radius: radius,
					center: pCenterImageLayerCoords,
					label: toolLabel
				}

				return toolData;
			}
			else {
				return null;
			}
		}

		var group = new Konva.Group({
			name: shapeName,
			draggable: true,
			getReport: getReport,
			getSWIP: getSWIP,
			mmPerPixel: this.viewer.MMPerPixel
		});

		this.viewer.shapeslayer.add(group);

		return group;
	}

	SetCalibrationBall = function (radius: number, centerX: number, centerY: number, shapeName: string, strokecolor?: string, dragendCallback?) {
		var _this = this;

		var p1 = new PointF(centerX - radius, centerY);
		var p2 = new PointF(centerX + radius, centerY)

		if (this.viewer.stage == null) {
			this.InitStage();
		}

		if (strokecolor == null) strokecolor = 'red';

		var group = new Konva.Group({
			name: shapeName,
			draggable: false
		});
		this.viewer.shapeslayer.add(group);

		var circle = new Konva.Circle({
			stroke: strokecolor,
			strokeWidth: 2,
			originalColor: strokecolor,
			name: 'circle',
			shapeType: "circleTool",
			draggable: false,
			x: centerX,
			y: centerY,
			radius: (p2.x - p1.x) / 2,

		});
		group.add(circle);

		var connectingLine = new Konva.Line({
			stroke: strokecolor,
			strokeWidth: 2,
			lineCap: 'round',
			lineJoin: 'round',
			name: 'connectingLine',
			points: [p1.x, p1.y, p2.x, p2.y]
		});
		group.add(connectingLine);
		this.viewer.shapeslayer.draw();
	}

	SetAngleTool = function (shapeName: string, strokeColor) {
		if (strokeColor == null) strokeColor = 'red';

		var group = this.CreateAngleToolGroup(shapeName);

		var angleP1 = { x: 100, y: 100 };
		var angleP2 = { x: 200, y: 200 };
		var angleVertex = { x: 300, y: 100 };

		var anchor = Viewer.addAnchor(group, angleP1.x, angleP1.y, "p1", BasicToolsViewer.connectAngleTool);
		Viewer.addAnchor(group, angleP2.x, angleP2.y, "p2", BasicToolsViewer.connectAngleTool);
		Viewer.addAnchor(group, angleVertex.x, angleVertex.y, "p3", BasicToolsViewer.connectAngleTool);

		BasicToolsViewer.connectAngleTool(group, strokeColor);
		this.viewer.SetCurrentSelected(anchor);
	}

	AngleTool = function (shapeName: string, strokeColor) {

		var group = this.CreateAngleToolGroup(shapeName);
		this.viewer.SetViewerMouseState('angle');
		BasicToolsViewer.SetDrawAngleToolByClick(this.viewer, group, this.viewer.originalImageWidth, this.viewer.originalImageHeight, strokeColor, BasicToolsViewer.connectAngleTool);
	}

	CreateAngleToolGroup = function (shapeName: string) {
		function getReport(container) {
			if (!container.isVisible()) return null;
			var lineLabel = container.find('.lineLabel')[0];
			if (lineLabel) {
				var angleValue = lineLabel.getText().text();

				return new KeyValuePair('Angle', angleValue);
			}
			return null;
		}

		function getSWIP(container): any {

			var imglayer = container.getStage().find('.imglayer')[0];

			var p1 = container.findOne('.p1');
			var p2 = container.findOne('.p2');
			var p3 = container.findOne('.p3');
			if (!(p1 || p2 || p3)) {
				return null;
			}
			var p1ContainerCoords = { x: p1.x(), y: p1.y() };
			var p2ContainerCoords = { x: p2.x(), y: p2.y() };
			var p3ContainerCoords = { x: p3.x(), y: p3.y() };
			var p1ImageLayerCoords = ViewerHelper.TranslatePointCoords(p1ContainerCoords, container, imglayer);
			var p2ImageLayerCoords = ViewerHelper.TranslatePointCoords(p2ContainerCoords, container, imglayer);
			var p3ImageLayerCoords = ViewerHelper.TranslatePointCoords(p3ContainerCoords, container, imglayer);

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
				shapeType: 'AngleTool',
				shapeName: container.getName(),
				isVisible: container.isVisible(),
				p1: p1ImageLayerCoords,
				p2: p2ImageLayerCoords,
				pVertex: p3ImageLayerCoords,
				label: toolLabel
			}

			return toolData;
		}

		var group = new Konva.Group({
			name: shapeName,
			draggable: true,
			getReport: getReport,
			getSWIP: getSWIP
		});

		this.viewer.shapeslayer.add(group);

		return group;
	}

	SetAngleToolFromSWIP = function (angleSwipItem: any) {
		var sAngleToolData = JSON.stringify(angleSwipItem);
		var angleToolSwipData: AngleToolSWIPData = JSON.parse(sAngleToolData);

		var strokeColor = 'red';

		var group = this.CreateAngleToolGroup(angleToolSwipData.shapeName);

		var angleP1 = angleToolSwipData.p1;
		var angleP2 = angleToolSwipData.p2;
		var angleVertex = angleToolSwipData.pVertex;

		var anchor = Viewer.addAnchor(group, angleP1.x, angleP1.y, "p1", BasicToolsViewer.connectAngleTool);
		Viewer.addAnchor(group, angleP2.x, angleP2.y, "p2", BasicToolsViewer.connectAngleTool);
		Viewer.addAnchor(group, angleVertex.x, angleVertex.y, "p3", BasicToolsViewer.connectAngleTool);

		BasicToolsViewer.connectAngleTool(group, strokeColor);

		BasicToolsViewer.UpdateLabelOnSwip(group, angleToolSwipData.label);

		this.viewer.SetCurrentSelected(anchor);

		BasicToolsViewer.RefreshLayerOnSwip(this.viewer, group);
	}

	static SetDrawLineByDrag = function (viewer, group, strokeColor, connectFunction, dragendCallback) {
		var stage = group.getStage();
		var isStarted = false;
		var moveStarted = false;
		var startPoint = null;

		var connectingLine;

		//    _this.Pan(false);
		//       _this.SetMousePanEnabled(false);
		stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
		stage.getLayers().on("mousedown touchstart", function (e) {
			if (isStarted) {
				isStarted = false;
				viewer.shapeslayer.drawScene();
			}
			else {
				moveStarted = false;
				var scale = viewer.stage.getScale().x;
				var scaledLStroke = 5 / scale;

				connectingLine = new Konva.Line({
					stroke: strokeColor,
					strokeWidth: scaledLStroke > 5 ? 5 : scaledLStroke,
					lineCap: 'round',
					lineJoin: 'round',
					name: 'userline'
				});

				viewer.shapeslayer.add(connectingLine);
				//startPoint = { x: e.evt.layerX, y: e.evt.layerY };
				startPoint = ViewerHelper.getOffset(e.evt);
				var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, startPoint);
				connectingLine.setPoints([imgcoords.x, imgcoords.y, imgcoords.x, imgcoords.y]);
				isStarted = true;
			}
		});

		stage.getLayers().on("mousemove touchmove", function (e) {
			if (isStarted) {
				//var layerCoords = { x: e.evt.layerX, y: e.evt.layerY };
				var layerCoords = ViewerHelper.getOffset(e.evt);
				if (!moveStarted && MathL.distanceSqr(layerCoords, startPoint) > 50) {
					moveStarted = true;
				}
				if (moveStarted) {
					var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, layerCoords);
					connectingLine.getPoints()[2] = imgcoords.x;
					connectingLine.getPoints()[3] = imgcoords.y;
				}
				isStarted = true;
				viewer.shapeslayer.drawScene();
			}
		});

		stage.getLayers().on("mouseup touchend", function (e) {
			isStarted = false;
			var p1 = { x: connectingLine.getPoints()[0], y: connectingLine.getPoints()[1] };
			var p2 = { x: connectingLine.getPoints()[2], y: connectingLine.getPoints()[3] };
			if (!moveStarted) {
				var scale = stage.getScale().x;
				p2 = { x: connectingLine.getPoints()[0] + 150 / scale, y: connectingLine.getPoints()[1] };
			}
			// connectingLine.remove();
			connectingLine.destroy();
			var anchor = Viewer.addAnchor(group, p1.x, p1.y, "p1", connectFunction, null, dragendCallback);
			Viewer.addAnchor(group, p2.x, p2.y, "p2", connectFunction, null, dragendCallback);
			connectFunction(group, strokeColor);

			viewer.SetCurrentSelected(anchor);
			//        _this.shapeslayer.drawScene();
			stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
			//       viewer.SetDeActivateViewerMouseState();

			e.cancelBubble = true;
			if (dragendCallback != null) {
				dragendCallback();
			}
		});



	}

	static SetDrawAngleToolByClick = function (viewer, group, imageWidth, imageHeight, strokeColor, connectFunction) {

		var stage = group.getStage();

		stage.getLayers().on("mousedown touchstart", function (e) {
			//var layerCoords = { x: e.evt.layerX, y: e.evt.layerY };
			var layerCoords = ViewerHelper.getOffset(e.evt);
			var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, layerCoords);
			onSetDrawPointStart(imgcoords.x, imgcoords.y);
		});

		function onSetDrawPointStart(x, y) {
			var stageWidth = stage.getWidth();
			var stageHeight = stage.getHeight();
			var screenStartOnImgCoords = MathL.TranslateScreenPointToImagePoint(viewer.img, new PointF(0, 0));
			var screenEndOnImgCoords = MathL.TranslateScreenPointToImagePoint(viewer.img, new PointF(stageWidth, stageHeight));
			var imageRect = RectangleF.CreateFromPoints(screenStartOnImgCoords, screenEndOnImgCoords).Intersect(RectangleF.CreateFromPoints(new PointF(0, 0), new PointF(imageWidth, imageHeight)));

			var toolLegsOffset = Math.min(imageRect.width, imageRect.height) / 8;
			var anchor2 = Viewer.addAnchor(group, x, y, "p2", connectFunction);
			var anchor1x = x, anchor3x;
			if (x + toolLegsOffset > imageRect.Right) {
				anchor3x = x - toolLegsOffset;
			} else {
				anchor3x = x + toolLegsOffset;
			}
			var yDir = (y - toolLegsOffset * 1.5 < imageRect.Top) ? 1 : -1;
			var anchor1y = y + yDir * toolLegsOffset * 1.5;
			var anchor3y = y + yDir * toolLegsOffset;
			Viewer.addAnchor(group, anchor1x, anchor1y, "p1", connectFunction);
			Viewer.addAnchor(group, anchor3x, anchor3y, "p3", connectFunction);
			connectFunction(group, strokeColor);
			viewer.SetCurrentSelected(anchor2);
			stage.getLayers().off("mousedown");
			stage.getLayers().off("touchstart");
			viewer.SetDeActivateViewerMouseState();
			viewer.shapeslayer.drawScene();
		}

	}

	static SetDrawLine = function (viewer, group, strokeColor, connectFunction) {
		var stage = group.getStage();

		stage.getLayers().on("mousedown touchstart", function (e) {
			// var layerCoords = { x: e.evt.layerX, y: e.evt.layerY };
			var layerCoords = ViewerHelper.getOffset(e.evt);
			var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, layerCoords);
			onSetDrawLinStart(imgcoords.x, imgcoords.y);
		});

		function onSetDrawLinStart(x, y) {
			var p1 = group.find('.p1')[0];
			var p2 = group.find('.p2')[0];
			if (p1 == null) {
				Viewer.addAnchor(group, x, y, "p1", connectFunction);
			}
			else if (p2 == null) {
				Viewer.addAnchor(group, x, y, "p2", connectFunction);
				connectFunction(group, strokeColor);
				stage.getLayers().off("mousedown");
				stage.getLayers().off('touchstart');
				viewer.SetDeActivateViewerMouseState();
			}
			else {
				return false;
			}
		}
	}
	static connectAngleTool = function (group, strokeColor) {
		var layer = group.getLayer();
		var p1 = group.find('.p1')[0];
		var p2 = group.find('.p2')[0];
		var p3 = group.find('.p3')[0];

		var connectingLine1 = group.find('.connectingLine1')[0];
		var connectingLine2 = group.find('.connectingLine2')[0];
		var arc = group.find('.arc')[0];
		var connectingLine1HitRegion = group.find('.connectingLine1HitRegion')[0];
		var connectingLine2HitRegion = group.find('.connectingLine2HitRegion')[0];
		var connectinglineToLabel = group.find(".connectinglineToLabel")[0];
		var lineLabel = group.find('.lineLabel')[0];
		var textNode = group.find('Text')[0];
		if (arc == null) {
			connectingLine1 = ViewerHelper.addConnectingLine(group, "connectingLine1");
			connectingLine2 = ViewerHelper.addConnectingLine(group, "connectingLine2");

			connectingLine1HitRegion = group.find('.connectingLine1HitRegion')[0];
			connectingLine2HitRegion = group.find('.connectingLine2HitRegion')[0];
			lineLabel = ViewerHelper.addLabel(group, 'lineLabel', connectingLine1.getAttr('originalColor'), connectingLine1);
			lineLabel.setAttr('doubleClickFunc', BasicToolsViewer.labelDoubleClickFunc);
			textNode = group.find('Text')[0];


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


		arc.setX(p2.getX() / 2);
		arc.setY(p2.getY() / 2);
		var angleData = MathL.CalcAngle(ViewerHelper.GetObjectLocation(p1), ViewerHelper.GetObjectLocation(p3), ViewerHelper.GetObjectLocation(p2));
		arc.getAttrs().startAngle = angleData.theta1;
		arc.getAttrs().endAngle = angleData.theta2;
		var angleDataText = Math.round(angleData.absAngleDegree) + "\u00B0";

		if (textNode.textArr[0].text == "" || textNode['_partialText'].indexOf(' ') < 0) {
			textNode.setText(angleDataText);
		} else {
			if (textNode['_partialText'].indexOf(' ') > 0) {
				var oldDegreeText = textNode._partialText.substr(0, textNode._partialText.indexOf(' '));
				textNode['_partialText'] = textNode._partialText.replace(oldDegreeText, angleDataText);
				textNode.setText(textNode['_partialText'])

			}
		}

		connectingLine1.setPoints([p1.getX(), p1.getY(), p2.getX(), p2.getY()]);
		connectingLine1HitRegion.setPoints([p1.getX(), p1.getY(), p2.getX(), p2.getY()]);
		connectingLine2.setPoints([p2.getX(), p2.getY(), p3.getX(), p3.getY()]);
		connectingLine2HitRegion.setPoints([p2.getX(), p2.getY(), p3.getX(), p3.getY()]);

		var length1 = ViewerHelper.calculateLineLength(connectingLine1);
		var length2 = ViewerHelper.calculateLineLength(connectingLine2);
		arc.getAttrs().radius = Math.min(length1, length2) * 0.7;

		var midPoint = ViewerHelper.calculateLineCenterPoint(connectingLine1);
		ViewerHelper.moveLabel(lineLabel, midPoint);

		//var label = lineLabel.children[0];
		//var textNode = lineLabel.children[1];
		//textNode.on('click touch tap', () => {
		//	BasicToolsViewer.addEditLabelText(lineLabel, label.children[0], textNode);
		//})
		//lineLabel.children[1] = BasicToolsViewer.handleEditableLabel(lineLabel, angleDataText);
		// shapeLines.lineLabel.find('Text')[0].setText(textNode['_partialText']);

		group.moveToBottom();
		connectingLine2.moveToBottom(); //konva shifts all children nodes in group and places this to 0
		connectingLine1.moveToBottom();
		var connectingLine = group.findOne('.connectingLine');
		if (connectingLine) connectingLine.moveToBottom();

		if (connectinglineToLabel && lineLabel) {
			lineLabel.setZIndex(12); //konva max Z index
		}

		arc.moveToBottom();

		layer.batchDraw();
	};

	static connectPointsToCircleDiameter = function (group, strokeColor) {
		BasicToolsViewer.connectPoints(group, strokeColor);
		var layer = group.getLayer();
		var circle = group.find('.circle')[0];
		var connectingLine = group.find('.connectingLine')[0];

		if (circle == null) {
			var connectingLine = group.find('.connectingLine')[0];
			circle = new Konva.Circle({
				stroke: connectingLine.getAttr('originalColor'),
				originalColor: connectingLine.getAttr('originalColor'),
				name: 'circle',
				shapeType: "circleTool",
				fillEnabled: false,//makes click event propagate
			});
			group.add(circle);
		}
		var lineLength = ViewerHelper.calculateLineLength(connectingLine);
		circle.setRadius(lineLength / 2);

		var midPoint = ViewerHelper.calculateLineCenterPoint(connectingLine);
		circle.setX(midPoint.x);
		circle.setY(midPoint.y);

		var connectingLineHitRegion = group.find('.connectingLineHitRegion')[0];
		connectingLine.setZIndex(2);
		connectingLineHitRegion.setZIndex(1);
		circle.moveToBottom();
		layer.batchDraw();
	};

	static connectPoints = function (group, strokeColor) {
		var layer = group.getLayer();
		var p1 = group.find('.p1')[0];
		var p2 = group.find('.p2')[0];
		var connectingLine = group.find('.connectingLine')[0];
		var connectingLineHitRegion = group.find('.connectingLineHitRegion')[0];
		var lineLabel = group.find(".lineLabel")[0];


		var name = group.getAttr('name')

		if (p1 != null && p2 != null) {
			if (connectingLine == null) {

				connectingLine = ViewerHelper.addConnectingLine(group, "connectingLine");
				connectingLineHitRegion = group.find('.connectingLineHitRegion')[0];
				if (name != 'c' && name != 'a' && name != 'secondaryCORGroup') {
					lineLabel = ViewerHelper.addLabel(group, 'lineLabel', connectingLine.getAttr('originalColor'), connectingLine);
					lineLabel.setAttr('doubleClickFunc', BasicToolsViewer.labelDoubleClickFunc);
				}
			}
			connectingLine.setPoints([p1.getX(), p1.getY(), p2.getX(), p2.getY()]);
			connectingLineHitRegion.setPoints([p1.getX(), p1.getY(), p2.getX(), p2.getY()]);
			connectingLine.setZIndex(1);
			connectingLineHitRegion.setZIndex(0);

		}
		// set label 

		if (p1 != null && p2 != null && name != 'c' && name != 'a') {
			var midPoint = ViewerHelper.calculateLineCenterPoint(connectingLine);
			if (lineLabel != null) {
				ViewerHelper.moveLabel(lineLabel, midPoint);
				lineLabel.setAttr('pixelLength', ViewerHelper.calculateLineLength(connectingLine));
				var label = lineLabel.children[0];
				var textNode = lineLabel.children[1];
				//textNode.on('click touch tap', () => {
				//	BasicToolsViewer.addEditLabelText(lineLabel, label.children[0], textNode);
				//});

			}
		}

		layer.batchDraw();

	};

	static SetDrawCircleByDrag = function (viewer, group, strokeColor, connectFunction, dragendCallback) {

		var stage = group.getStage();
		var isStarted = false;
		var moveStarted = false;
		var startPoint = null;

		var connectingLine;
		var connectingCircle;

		//     _this.Pan(false);
		//      _this.SetMousePanEnabled(false);

		stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
		stage.getLayers().on("mousedown touchstart", function (e) {
			if (isStarted) {
				isStarted = false;
				viewer.shapeslayer.drawScene();
			}
			else {
				e.evt.cancelBubble = true;
				e.evt.stopPropagation();

				moveStarted = false;
				var scale = viewer.stage.getScale().x;
				var scaledLStroke = 5 / scale;
				connectingLine = new Konva.Line({
					stroke: strokeColor,
					strokeWidth: scaledLStroke > 5 ? 5 : scaledLStroke,
					lineCap: 'round',
					lineJoin: 'round',
					name: 'userline'
				});

				connectingCircle = new Konva.Circle({
					stroke: strokeColor,
					strokeWidth: scaledLStroke > 5 ? 5 : scaledLStroke,
					name: 'usercircle'
				});

				viewer.shapeslayer.add(connectingLine);
				viewer.shapeslayer.add(connectingCircle);
				//startPoint = { x: e.evt.layerX, y: e.evt.layerY };
				startPoint = ViewerHelper.getOffset(e.evt);
				var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, startPoint);
				connectingLine.setPoints([imgcoords.x, imgcoords.y, imgcoords.x, imgcoords.y]);

				isStarted = true;
			}
		});

		stage.getLayers().on("mousemove touchmove", function (e) {
			if (isStarted) {
				e.evt.cancelBubble = true;
				e.evt.stopPropagation();
				//var layerCoords = { x: e.evt.layerX, y: e.evt.layerY };
				var layerCoords = ViewerHelper.getOffset(e.evt);
				if (!moveStarted && MathL.distanceSqr(layerCoords, startPoint) > 150) {
					moveStarted = true;
				}
				if (moveStarted) {
					var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, layerCoords);
					connectingLine.getPoints()[2] = imgcoords.x;
					connectingLine.getPoints()[3] = imgcoords.y;

					var centerimgcoords = ViewerHelper.calculateLineCenterPoint(connectingLine);
					connectingCircle.setX(centerimgcoords.x);
					connectingCircle.setY(centerimgcoords.y);
					connectingCircle.setRadius(ViewerHelper.calculateLineLength(connectingLine) / 2);
				}
				isStarted = true;
				viewer.shapeslayer.drawScene();
			}
		});

		stage.getLayers().on("mouseup touchend", function (e) {
			isStarted = false;
			var p1 = { x: connectingLine.getPoints()[0], y: connectingLine.getPoints()[1] };
			var p2 = { x: connectingLine.getPoints()[2], y: connectingLine.getPoints()[3] };
			if (!moveStarted) {
				var scale = stage.getScale().x;
				p2 = { x: connectingLine.getPoints()[0] + 150 / scale, y: connectingLine.getPoints()[1] };
			}
			connectingLine.destroy();
			connectingCircle.destroy();
			var anchor = Viewer.addAnchor(group, p1.x, p1.y, "p1", connectFunction, null, dragendCallback);
			Viewer.addAnchor(group, p2.x, p2.y, "p2", connectFunction, null, dragendCallback);
			connectFunction(group, strokeColor);

			viewer.SetCurrentSelected(anchor);
			stage.getLayers().off('mousedown');
			stage.getLayers().off('touchstart');
			stage.getLayers().off('mousemove mouseup touchend');
			//              viewer.SetDeActivateViewerMouseState();
			viewer.shapeslayer.drawScene();
			e.evt.cancelBubble = true;
			e.evt.stopPropagation();
			if (dragendCallback != null) {
				dragendCallback();
			}

		});
	}

	static labelDoubleClickFunc = function (label) {
		var textNode = label.children[1];
		var group = label.parent;
		BasicToolsViewer.addEditLabelText(group, label.children[0], textNode);
	}


	static UpdateLabelOnSwip = function (group, label: BasicLabel) {
		var lineLabel = group.find(label.name)[0];
		if (lineLabel) {
			lineLabel.find('Text')[0].setText(label.text);
			var textNode = lineLabel.children[1];
			textNode.setAttr('editableLabel', true);
			ViewerHelper.moveLabel(lineLabel, label.position);
			lineLabel.setAttr('dragged', true);
		}
	}

	static UpdateLabelOnSwipDirect = function (lineLabel, label: BasicLabel, editable = false) {
		if (label) {
			lineLabel.find('Text')[0].setText(label.text);
			var textNode = lineLabel.children[1];
			textNode.setAttr('editableLabel', editable);
			ViewerHelper.moveLabel(lineLabel, label.position);
			lineLabel.setAttr('dragged', true);
		}
	}

	static RefreshLayerOnSwip = function (viewer, group) {
		var layer = group.getLayer();
		layer.batchDraw();
		viewer.shapeslayer.draw();
	}
}