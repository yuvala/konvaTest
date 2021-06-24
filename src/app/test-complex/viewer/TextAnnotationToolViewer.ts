//// <reference path="../Declaretions.ts" />

'use strict';

interface ITextAnnotationToolViewer {

	TextTool(shapeName: string, strokeColor: any): void;

    SetTextToolFromSWIP(textToolSwipItem: any): void;
}

// *** comment code is because we do not need label dgree (for now) ***

class TextAnnotationToolViewer implements ITextAnnotationToolViewer {

	private viewer;
	constructor(viewer: IViewer) {
		this.viewer = viewer;
	}

    TextTool = function (shapeName: string, strokeColor) {
        var group = this.CreateTextToolGroup(shapeName);
		this.viewer.SetViewerMouseState('text');
		this.viewer.SetCurrentSelected(null);
		TextAnnotationToolViewer.SetDrawTextToolByClick(this.viewer, group, '#F6CC0C');

	}

	static toggelDebounce = true;

	static SetDrawTextToolByClick = function (viewer, group, strokeColor) {
		var _this = this;
		var stage = group.getStage();
		var ua = window.navigator.userAgent;
		var msie = /MSIE|Trident\//.test(ua);
		var windows = ua.indexOf("Windows");

		stage.getLayers().on("mousedown", function (e) {
			var layerCoords = { x: e.evt.layerX, y: e.evt.layerY };
			viewer.SetDeActivateViewerMouseState();

			if (BasicToolsViewer.isIos || BasicToolsViewer.isIE) {
				var dragBox = document.getElementsByClassName('dragbox')[0];
				dragBox['style'].display = "block";
			}
			TextAnnotationToolViewer.onSetDrawTextStart(viewer, group, layerCoords.x, layerCoords.y);
			//  stage.getLayers();
			stage.getLayers().off("mousedown")
			.on("mousedown", function (e) {
				var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
				var textareaElement = $(dialog).find('textarea');
				TextAnnotationToolViewer.SaveText(viewer, group, dialog, textareaElement);
			});
			if (viewer.ViewerSibiling.getShapeslayer()) {
				viewer.ViewerSibiling.getShapeslayer().getStage().getLayers().off("mousedown")
					.on("mousedown", function (e) {
						if (viewer.IsSelected) {
							var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
							var textareaElement = $(dialog).find('textarea');
							TextAnnotationToolViewer.SaveText(viewer, group, dialog, textareaElement);
							viewer.ViewerSibiling.getShapeslayer().getStage().getLayers().off("mousedown");
						}
					});
			}
		});

		stage.getLayers().on("touchstart", function (e) {
			var touchstartlayerCoords = ViewerHelper.getOffset(e.evt);
			viewer.SetDeActivateViewerMouseState();
			TextAnnotationToolViewer.onSetDrawTextStart(viewer, group, touchstartlayerCoords.x, touchstartlayerCoords.y);

			if (BasicToolsViewer.isIos || BasicToolsViewer.isIE) {
				var dragBox = document.getElementsByClassName('dragbox')[0];
				dragBox['style'].display = "block";
			}

			stage.getLayers().off("touchend");
			stage.getLayers().off("mousedown touchstart");
			stage.getLayers().on("mousedown touchstart", function (e) {
				var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
				var textareaElement = $(dialog.find('textarea')[0]);
				TextAnnotationToolViewer.SaveText(viewer, group, dialog, textareaElement);
				stage.getLayers().off("mousedown touchstart");
			});
		});


	}

	static editAnnotationText = function (label, viewer) {
		// get variables
		var stage = label.getStage();
		var layer = label.getLayer();
		var tag = label.children[0]
		var textNode = label.children[1];
		var group = label.parent;
		var imgLayer = group.getLayer();
		var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
		var editAnnotationTextareaElement = $(dialog.find('textarea')[0]);
		var textareaWrapper = $(dialog.find('textarea-wrapper')[0]);
		var isTextareOpen = false;
		// set  textarea
		TextAnnotationToolViewer.setEditTextToolCss(label, viewer,'edit');
		TextAnnotationToolViewer.setNewTextValue(textNode, editAnnotationTextareaElement);

	   // listen close events
		var closeTextareaOnEnterClick = function (event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				if (TextAnnotationToolViewer.toggelDebounce) {
					TextAnnotationToolViewer.toggelDebounce = false;
					setTimeout(function () {
						console.log("edit event", event);
						var group = label.parent;
						TextAnnotationToolViewer.closeTextareaOnEnterClick(event, group, viewer);
						TextAnnotationToolViewer.toggelDebounce = true;
					}, 100)

				}
			}
		}
		var closeTextarea = function () {
			TextAnnotationToolViewer.closeTextarea(label, viewer);
		}

		var closeTextareaOnIpad = function (e) {
			if (isTextareOpen == true) { 
				if (isTextareOpen && e.target.id != 'texttool-dialog-textarea') {
					TextAnnotationToolViewer.closeTextarea(label, viewer);
					isTextareOpen = false;
				}
			}
		
		}
		// for Ipad  event click 
		setTimeout(function () {
			isTextareOpen = true;
		}, 100)
		
	

		if (BasicToolsViewer.isIos) {
			document.body.addEventListener('click', closeTextareaOnIpad);
			document.body.addEventListener('tap', closeTextareaOnIpad);
		} else {
			//document.body.addEventListener('click', closeTextareaOnEnterClick);
			editAnnotationTextareaElement.focusout(closeTextarea);
			editAnnotationTextareaElement.blur(closeTextarea);
			editAnnotationTextareaElement.on('keyup', closeTextareaOnEnterClick);
			editAnnotationTextareaElement.on('keydown', function (event) {
				if (event.keyCode == 13) {
					event.preventDefault();
				}
			});
		}

	}

	static setEditTextToolCss = function (data, viewer, state) {
		var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
		var editAnnotationTextareaElement = $(dialog.find('textarea')[0]);
		var textareaWrapper = $(dialog.find('textarea-wrapper')[0]);
		if (state == 'init') {
			var postion = data
			var paddingTop = (dialog.innerHeight() - dialog.height()) / 2;
			var paddingLeft = (dialog.innerWidth() - dialog.width()) / 2;
			dialog.css({
				display: 'flex',
				top: postion.y - paddingTop - (dialog.height() / 2) - 20,
				left: postion.x - paddingLeft - 20,
				position: 'absolute'
			});
			dialog.show();
			var textareaElement = $(dialog.find('textarea')[0]);
			textareaElement.css({
				minHeight: "50px",
				height: "200px"
			})
			
		}
		if (state == 'edit') {
			var label = data;
			var group = data.parent;
			var textNode = label.children[1];
			var textareaPosition = MathL.TransformCoords(label.getPosition(), group.getAbsoluteTransform().m);

			// minus wrappers padding - 0.5 of the text area height, centering it
	
			editAnnotationTextareaElement.addClass("texttool-area");
			var linesWidthArray = textNode.textArr.map(line => {
				return line.width
			})
			dialog.css({
				left: textareaPosition.x - 20,
				top: textareaPosition.y - 20 - (textNode.attrs.originalFontSize * 2),
				display: 'block',
			})
			var maxLineWidth = Math.max.apply(Math, linesWidthArray);
			editAnnotationTextareaElement.css({
				color: "#F6CC0C",
				borderColor: "#F6CC0C",
				width: maxLineWidth - 200 > 0 ? (200 + (maxLineWidth - 200) / 4) + "px" : 200 + "px",
				height: textNode.attrs.originalFontSize * 4 + "px",
				minHeight: "50px",
				fontSize: textNode.attrs.originalFontSize + "px"
			});

			if (BasicToolsViewer.isIos) {
				var dragBox = <HTMLElement>document.getElementsByClassName('dragbox')[0];
				dragBox.style.display = "block";
			}
		}
	}

	static setNewTextValue = function (textNode, editAnnotationTextareaElement) {
		var copyText = '';
		for (var i = 0; i < textNode.textArr.length; i++) {
			copyText = copyText + textNode.textArr[i].text;
			if (i != textNode.textArr.length - 1) {
				copyText = copyText + '\n'
			}
		}
		editAnnotationTextareaElement.val(copyText);
		editAnnotationTextareaElement.focus();
	}
	// mnipult label to max size
	static breakLongText = function (textNode) { 
		var copyText = '';
		var tempArray = [];
		for (var i = 0; i < textNode.textArr.length; i++) {
			//if (textNode.textArr[i].width > 1800) { 
			if (textNode.textWidth > 450) {
				if (textNode.textArr[i].text.length > 25) {
					var lengthdivder = Math.round(textNode.textArr[i].text.length / 25);
					//var textDivder = textNode.textArr[i].text.length / lengthdivder;
					for (var j = 0; j <= lengthdivder; j++) {
						copyText = textNode.textArr[i].text.substring(25 * j, 25 * (j + 1));
						if (copyText) {
							tempArray.push(copyText);
						}
					}
					textNode.textArr[i].text = tempArray[0];
					for (var x = 1; x < tempArray.length; x++) {
						textNode.textArr.splice(i + x, 0, { text: tempArray[x], width: 580 });
					}
					i = i + tempArray.length
				}
			}
		}
		var newText = ''


		for (var y = 0; y < textNode.textArr.length; y++) {
			if (y != textNode.textArr.length - 1) {
				if (textNode.textArr[y].text.lastIndexOf(' ') != -1) {
					var breakText = textNode.textArr[y].text;
					var part1 = breakText.slice(0, breakText.lastIndexOf(' ') - 1);
					var part2 = breakText.slice(breakText.lastIndexOf(' ') + 1, breakText.length);
					breakText = part1 + '\n' + part2;
					newText = newText + breakText;
				} else { 
					newText = newText + textNode.textArr[y].text + '\n';
				}
			} else {
				newText = newText + textNode.textArr[y].text;
			}			
		}
		textNode.setText(newText)
		
	}
	
	static onSetDrawTextStart = function (viewer, group, x, y) {
		var stage = group.getStage();
		//var currentDialogs = $("#viewers-container").find('.texttool-dialog');
		//if (currentDialogs.length > 0) {

		//	console.log(currentDialogs);
		//	currentDialogs.hide();
		//}
		var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
		var textareaElement = $(dialog.find('textarea')[0]);
		var textarea = document.getElementById('texttool-dialog-textarea')
		TextAnnotationToolViewer.setEditTextToolCss({x:x,y:y}, viewer,'init')
		TextAnnotationToolViewer.resetTextareaElement(textareaElement);

		if (!BasicToolsViewer.isIos) {
			textareaElement.on('keydown', function (event) {
				if (event.keyCode == 13) {
					event.preventDefault();
				}
			})
			textareaElement.on('keyup', function (event) {
				var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
				var textareaElement = $(dialog).find('textarea');
				if (event.keyCode == 13) {
					event.preventDefault();
					if (TextAnnotationToolViewer.toggelDebounce) {
						TextAnnotationToolViewer.toggelDebounce = false;
						setTimeout(function () {
							TextAnnotationToolViewer.closeTextareaOnEnterClick(event, group, viewer);
							TextAnnotationToolViewer.toggelDebounce = true;
						}, 100)
					}
				}

			});
		}
		//setTimeout(function () {
		//	document.getElementById("texttool-dialog-textarea").focus();
		//	textareaElement.focus();
		//}, 0)

		textareaElement.val('');
		textareaElement.focus();
	}

	static SaveText = function (viewer, group, dialog, textareaElement) {
		var text = textareaElement.val();
		var stage = group.getStage();
		stage.getLayers().off("mousedown tap");
		dialog.find('button').click = null;

		if (text && text.trim() !== '') {
			var textElementScreenPosition = new PointF(dialog.position().left + 20, dialog.position().top + 20 + textareaElement[0].offsetHeight/2 );
			var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, textElementScreenPosition);
			var imgcoordsFar = new PointF(imgcoords.x , imgcoords.y  );
			if (!group.find('.p1')[0]) {
				var anchor = Viewer.addAnchor(group, imgcoords.x, imgcoords.y, "p1", TextAnnotationToolViewer.connectTextTool, null, null, true);
				var textTool = ViewerHelper.CreateCircleWithCrossShape(stage, new PointF(anchor.getX(), anchor.getY()), '#F6CC0C', 'textTool', 5, true, '#F6CC0C');
			}

			TextAnnotationToolViewer.connectTextTool(group, "");
			var label = group.find('.lineLabel')[0];
			var textLabel = label.find('Text')[0];
			//dialog.hide();
			textLabel.wrap('word');
			var fontSize = Number(textareaElement[0].style.fontSize.replace("px", ''));
			textLabel.setAttr('originalFontSize', fontSize);
			label.attrs.fontSize = fontSize;
			textLabel.setAttr('originalPadding', fontSize / 4);
			textLabel.setAttr('hidePixelLength', true);
			//var textWidth = textLabel.textArr.width();
			//if (textWidth > 830) {
			//	textLabel.width(830);
			//}
			// var label = ViewerHelper.addLabel(group, 'userLabel', '#ed145b', connectingLine, 14, 0.75);
			textLabel.setText(text.trim());
			ViewerHelper.moveLabel(label, imgcoordsFar);
			//dblclick dbltap
			//label.on('click touch tap', (e) => {
			label.on('dblclick dbltap', (e) => {
				TextAnnotationToolViewer.editAnnotationText(label, viewer);
			});

			TextAnnotationToolViewer.breakLongText(textLabel);
			group.add(label);
			//viewer.SetCurrentSelected(anchor);
			var textAnnotationgroupArray = viewer.shapeslayer.children.find(".textAnnotationgroup");
			//TextAnnotationToolViewer.setMaxSize(textAnnotationgroupArray);
			viewer.shapeslayer.drawScene();
		}
		textareaElement.unbind();
		// viewer.SetDeActivateViewerMouseState();
		TextAnnotationToolViewer.resetTextareaElement(textareaElement);
		dialog.hide();
	}
	static setMaxSize = function (textAnnotationgroupArray) { 
		for (var i = 0; i < textAnnotationgroupArray.length; i++) { 
			var label = textAnnotationgroupArray[i].find('.lineLabel')[0];
			var tag = label.children[0];
			var text = label.children[1];
			if (tag.attrs.width > 730) { 
				tag.attrs.width = 730;
				text.textWidth = tag.attrs.width;
			}


		}
	}
	static connectTextTool = function (group, strokeColor, viewer?) {

		var layer = group.getLayer();
		var stage = group.getStage();


		var p1 = group.find('.p1')[0]; // * transpernt Anchor
		var textTool = group.find('.textTool')[0];
		var lineLabel = group.find('.lineLabel')[0];

		if (textTool == null) {
			textTool = ViewerHelper.CreateCircleWithCrossShape(stage, new PointF(p1.getX(), p1.getY()), '#F6CC0C', 'textTool', 5, true, '#F6CC0C');
			lineLabel = ViewerHelper.addLabel(group, 'lineLabel', '#000', null, 14, 0.15, null, textTool, '#F6CC0C');
			group.add(textTool);
			//textTool.moveToTop();
		}

		textTool.setX(p1.getX());
		textTool.setY(p1.getY());
		layer.batchDraw();


	};

	static resetTextareaElement = function (textareaElement) {
		textareaElement.val('');
		textareaElement.css({ fontSize: "25px" });
		textareaElement.css({ fontSize: "25px" });
		textareaElement.css({ width: "200px", height: "100px" });
		textareaElement.parent().css({ width: "auto", height: "fit-content" });
		
	}
	static getCaret = function (el) {
		if (el.selectionStart) {
			return el.selectionStart;
		} else if (window.getSelection()) {
			el.focus();
			//var r = window.getSelection().createRange();
			if (el && el.createRange) {
				var r = el.createRange()
				if (r == null) {
					return 0;
				}
				return 0;
			}
			if (el.createTextRange) {
				var re = el.createTextRange(), rc = re.duplicate();
				re.moveToBookmark(r.getBookmark());
				rc.setEndPoint('EndToStart', re);
				return rc.text.length;
			}
			return 0;
		}
		return 0;
	}
	static closeTextareaOnEnterClick = function (event, group, viewer) {
		
		if (event.keyCode == 13) {
			var content = event.target.value.trim();
			var caret = TextAnnotationToolViewer.getCaret(event.target);
			if (event.altKey) { // if alt enter start new line
				if (event.target.value[caret] == " ") {
					event.target.value = content.substring(0, caret) + "\n" + content.substring(caret + 1, content.length);
				} else { 
					event.target.value = content.substring(0, caret) + "\n" + content.substring(caret , content.length);
				}
				event.target.selectionEnd = caret + 1;
			
			} else {
				var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
				var textareaElement = $(dialog).find('textarea');
				TextAnnotationToolViewer.SaveText(viewer, group, dialog, textareaElement);
			}
		}
	}
	static closeTextarea = function (label, viewer) {
		var layer = label.parent.getLayer();
		var textNode = label.children[1];
		var dialog = TextAnnotationToolViewer.GetTextToolDialog(viewer.ViewerElementID);
		var editAnnotationTextareaElement = $(dialog.find('textarea')[0]);

		editAnnotationTextareaElement.unbind();
		if (editAnnotationTextareaElement.val().trim() === '') {
			dialog.hide();
			//viewer.SetDeActivateViewerMouseState();
		} else {
			textNode.setText(editAnnotationTextareaElement.val().trim());
			textNode.textWidth = Number(editAnnotationTextareaElement.width());
			textNode.wrap('word');
			var fontSize = Number(editAnnotationTextareaElement.css('fontSize').replace("px", ''));
			textNode.setAttr('originalFontSize', fontSize);
			label.attrs.fontSize = fontSize;
			label.setAttr('originalPadding', fontSize / 4);
			label.setAttr('hidePixelLength', true);
			var textLabel = label.find('Text')[0];
			var textWidth = textLabel.width();
	
			TextAnnotationToolViewer.breakLongText(textLabel);
			label.hide();
			label.draw();
			TextAnnotationToolViewer.resetTextareaElement(editAnnotationTextareaElement);
			dialog.hide();
			viewer.shapeslayer.drawScene();
		}
	}
	static GetTextToolDialog = function (ViewerElementID) {
		var dialog = $("#" + ViewerElementID).parent().find('.texttool-dialog');
		console.log("GetTextToolDialog");
		console.log(dialog);
		return dialog;
    }

	CreateTextToolGroup = function (shapeName: string) {
		function getSWIP(container) {
			var imglayer = container.getStage().find('.imglayer')[0];
			var label = container.find('.lineLabel')[0];
			if (!label) {
				return null;
			}
			var textLabel = label.find('Text')[0];
			var fontSize = label.attrs.fontSize;
			var textNode = label.children[1];
			var text = textLabel.getText();
			var anchorP1 = container.find('.p1')[0];
			if (!anchorP1) {
				return null;
			}
			var p1ContainerCoords = { x: anchorP1.getAttr('x'), y: anchorP1.getAttr('y') };
			var p1ImageLayerCoords = ViewerHelper.TranslatePointCoords(p1ContainerCoords, container, imglayer);

			var shapeName = '';
			if (container.getName()) {
				shapeName = container.getName().replace('group', '');
			}
			var labelPositionContainerCoords = label.getPosition();
			var labelPositionImageCoords = ViewerHelper.TranslatePointCoords(labelPositionContainerCoords, container, imglayer);

			var toolData = {
				shapeType: 'TextTool',
				shapeName: shapeName,
				isVisible: container.isVisible(),
				text: text,
				fontSize: fontSize,
				lineLabelAnchor: p1ImageLayerCoords,
				position: labelPositionImageCoords
			}

			return toolData;
		}

		var group = new Konva.Group({
			name: shapeName + 'group',
			draggable: true,
			getSWIP: getSWIP
		});
		this.viewer.shapeslayer.add(group);
		return group;
    }

    SetTextToolFromSWIP(textToolSwipItem: any) {
        var sTextToolData = JSON.stringify(textToolSwipItem);
        var textToolSwipData: TextToolSWIPData = JSON.parse(sTextToolData);

        var group = this.CreateTextToolGroup(textToolSwipData.shapeName);
		var viewer = this.viewer;

        var fontSize = textToolSwipData.fontSize;
        var anchor = Viewer.addAnchor(group, textToolSwipData.lineLabelAnchor.x, textToolSwipData.lineLabelAnchor.y, "p1", TextAnnotationToolViewer.connectTextTool, null, null, true);
		TextAnnotationToolViewer.connectTextTool(group, "");
		var label = group.find('.lineLabel')[0];
		var textLabel = label.find('Text')[0];
        textLabel.wrap('word');
        textLabel.setAttr('originalFontSize', fontSize);
		label.attrs.fontSize = fontSize;
		textLabel.setAttr('originalPadding', fontSize / 4);
        textLabel.setAttr('hidePixelLength', true);
        textLabel.setText(textToolSwipData.text);
        ViewerHelper.moveLabel(label, textToolSwipData.position);
		label.on('click touch tap', (e) => {
			e.evt.preventDefault();
			TextAnnotationToolViewer.editAnnotationText(label, viewer);
		});
		group.add(label);
		viewer.SetCurrentSelected(anchor);
		viewer.SetDeActivateViewerMouseState();
		viewer.shapeslayer.drawScene();
	}
}