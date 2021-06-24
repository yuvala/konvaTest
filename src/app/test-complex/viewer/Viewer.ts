//// <reference path="../Models/ImageDataModels.ts" />

import Konva from "konva";
import { ViewerHelper } from "./ViewerHelper";

//// <reference path="../Declaretions.ts" />

//declare var Hammer: any;

// class ViewerDecoratorType {
//     static None = 0;
//     static BasicTools = 1;
//     static Knee = 2;
//     static AutoHip = 3;
//     // DMF add procedure these do not correspond TC procedure codes
//     static UpperLimb = 4;
//     static FootAndAnkle = 5;
//     //end

// }
interface IViewer {
    ViewerElementID: string;
    ViewerIndex: number;
    ViewerSibilig?: IViewer;
    SetMMPerPixel(scaling: number, imageOrientation: ImageOrientation/*, oversizeValue: number, prefixText:string,isCenterLayout: boolean*/): void;
    Init($window: any, logger: ILog, $rootScope: any): void;

    SetImageUrl(imageUrl: string, originalWidth: number, originalHeight: number, baseWLWindow: any, baseWLLevel: any, imageLoadedCallback: Function, imageErrorLoadedCallback: Function): void;
    SetWLImageDataUrl(wlImageDataUrl: string, wlImageDataLoadedCallback: Function, OnWindowLevelsChangeCallback: (wlWindow: number, wlLevel: number) => void): void;
    SetOneTouchPan(enabled: boolean): void;
    WindowLevel(onNewImageLoadedWithWLStarted: any, onNewImageLoadedWithWLFinished: any, photometricInterpretation: any): void;
    GetWLWindow(): number;
    GetWLLevel(): number;
    FitImage(): void;
    setElementSize(): void;

    Zoom(): void;
    Rotate(): void;

    SetIsSelected(value: boolean): void;
    GetViewerMouseState(): any;
    SetDeActivateViewerMouseState(): void;

    Invert(): void;

    ResetImage(): void;

    RemoveShape(shape: any, stopRecurseFlag?: boolean): void;
    RemoveSelectedShape(): boolean;
    GetSelectedShapeType(): any;
    ToggleShowShapeByName(name: string, isAutoHip: boolean): void;
    SetShowShapeByName(shapeName: string, show: boolean): void;
    RemoveShapeByName(name: string, stopRecurseFlag?: boolean): void;
    RemoveShapeById(name: string, shapeId: string, stopRecurseFlag?: boolean): void;
    IsShapeExists(shapeName: string): boolean;
    IsImageExist(): boolean
    GetImageWidth(): number;
    GetImageHeight(): number;
    GetLineLength(name: string): number;
    GetLinePoints(name: string): LinePoints;

    GetSavedOverlaysAsImageData(addedTextOnImage: string, isPrint?: boolean): any;
    //local images burn original/resized with planning info and texts combined
    GetOriginalandOverlaysImageData(addedTextOnImage: string, originalImageBase64: string, imageSize: any, $q, isPrint?: boolean): any;
    GetImageUrl(): any;

    GetImageBase64(): any;
    ClearBase64Img(): void;


    ClearAll(): void;
    ClearImage(): void;
    ClearPlanning(): void;
    Cleanup(): void;
    SetCurrentSelected(shape: any): void;
    SetGroupSelected(shape: string): void;

    EventShapeRemoved: string;

    moveObjectToTop(shape: any): void;
    traverseStageOnClick(container: any, excludeContainer: any): void;

    SetViewerSibiling(viewerSibiling: IViewer): void;

    getViewerId(): string;

    getShapeslayer(): any;
    getSegmentAndTemplatelayer(): any;
    removeTextAnnotationDialogs(viewer: any): void;
}


export class Viewer implements IViewer {
    public EventShapeRemoved = "EventShapeRemoved";

    private ViewerId: any;
    private viewer: any;
    private panZoom: any;
    private viewerMouseState: any;
    private rotate: any;
    private imglayer: any;
    private shapeslayer: any;
    private segmentAndTemplatelayer: any;
    private wlLayer: any;
    private stage: any;

    private lastDist = 0;
    private startScale = 1;

    private img: any;
    private $window: any;
    private imageObj: any;
    private postImageOperationsQueue: any[] | undefined;

    private resizedBase64Img: any;


    private MMPerPixel: number | null | undefined;
    private mouseWheelZoomEnabled: any;

    private originalImageWidth: any;
    private originalImageHeight: any;
    private actualImageWidth: any;
    private actualImageHeight: any;

    private baseImageUrl: any;
    private defaultWLWindow: any;
    private defaultWLLevel: any;
    private currentWLWindow = 25;
    private currentWLLevel = 4350;

    private wlImageDataObj: any;
    private wlImageScaleFactor = 2;
    private OnWindowLevelsChangeCallback: any;

    private imageOrientation: any;
    private hammer: any;
    //   public CurrentImage: DcmImage;

    private myListeners = null;
    private IsSelected: any;
    private ViewerSibiling: any;


    constructor(public ViewerElementID: string, public ViewerIndex: number) {
        this.ViewerId = Math.floor(Math.random() * 10000);
    }


    SetIsSelected(value: boolean) {
        this.IsSelected = value;
    }

    //Init($window: any, logger: ILog, $rootScope) {
    Init($window: any, logger: ILog, $rootScope: any) {
        let id = this.ViewerElementID;
        Konva.pixelRatio = 1;
        this.MMPerPixel = null;
        this.$window = window;
        $('#' + id).on('contextmenu', function (e: any) {
            return false;
        });
        //    this.logger = logger;
        //this.$rootScope = $rootScope;
        this.hammer = new Hammer(document.getElementById(this.ViewerElementID));
        console.log("new viewer was initiated");
    }
    //for report service
    getShapeslayer() {
        return this.shapeslayer;
    }
    getSegmentAndTemplatelayer() {
        return this.segmentAndTemplatelayer
    }

    public getViewerId(): string {
        return this.ViewerId;
    }
    SetViewerSibiling(viewerSibiling: IViewer): void {
        this.ViewerSibiling = viewerSibiling;
    }
    GetWLWindow() {
        return (<number>this.currentWLWindow);
    }

    GetWLLevel() {
        return (<number>this.currentWLLevel);
    }

    SafeAddEventlistener(element: any, type: any, listener: any, useCaption: any) {
        if (this.myListeners == null) {
            this.myListeners = [];
        }
        this.myListeners.push({ element: element, type: type, listener: listener, useCaption: useCaption });
        element.addEventListener(type, listener, useCaption);
    }

    SafeRemoveEventlistener(element: any, type: any, useCaption?: any) {
        if (this.myListeners) {
            this.myListeners.forEach((l: any) => {
                if (l.type == type)
                    l.element.removeEventListener(l.type, l.listener, l.useCaption)
            });
        }
    }
    RemoveListeners() {
        if (this.myListeners) {
            this.myListeners.forEach((l: any) => {
                l.element.removeEventListener(l.type, l.listener, l.useCaption)
            });
        }
    }

    ClearAll() {
        let _this = this;
        _this.ClearPlanning();
        _this.ClearBase64Img();
        _this.ClearImage()
        Konva.shapes = {};
        Konva.names = {};
        Konva.stages = [];
        //_this.stage = null;
        //if (_this.stage)
        //_this.stage.destroy();

    }

    ClearImage(): void {
        var _this = this;
        if (_this.imglayer) {

            var shapes = _this.imglayer.getChildren()
            while (shapes.length > 0)
                this.RemoveShape(shapes[0], true);
        }
        _this.img = null;

    }

    ClearPlanning(): void {
        let _this = this;
        this.removeTextAnnotationDialogs(_this);

        if (!_this.shapeslayer)
            return;

        var shapes = _this.shapeslayer.getChildren();
        while (shapes.length > 0)
            this.RemoveShape(shapes[0], true);

        if (this.segmentAndTemplatelayer != null) {
            var segmentPolygon = this.segmentAndTemplatelayer.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];//kinetic get()
            if (segmentPolygon != null) {
                segmentPolygon.setFillPatternImage(null);

            }
        }


        var shapes = _this.segmentAndTemplatelayer.getChildren();
        while (shapes.length > 0)
            this.RemoveShape(shapes[0], true);
    }

    removeTextAnnotationDialogs(viewer: any) {
        // var dialog = $('#' + viewer.ViewerElementID).parent().find('.texttool-dialog');
        var el = document.querySelector(`#${viewer.ViewerElementID}`);
        var dialog = el?.querySelector('.texttool-dialog');
        if (dialog) {
            //var editAnnotationTextareaElement = $(dialog.find('textarea')[0]);
            var editAnnotationTextareaElement = dialog.querySelector('textarea');
            TextAnnotationToolViewer.resetTextareaElement(editAnnotationTextareaElement);
            //dialog.hide();
        }
    }


    Cleanup() {
        var _this = this;

        if (this.segmentAndTemplatelayer != null) {
            var segmentPolygon = this.segmentAndTemplatelayer.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
            if (segmentPolygon != null) {
                segmentPolygon.setFillPatternImage(null);

            }
        }
        //if (this.imageObj != null)
        //{
        //    _this.blankgif = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
        //    this.imageObj.src = _this.blankgif;
        //}
        //if(this.wlImageDataObj != null)
        //{
        //    _this.blankgif = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
        //    this.wlImageDataObj.src = _this.blankgif;
        //}
        //setTimeout(function () { _this.shapeslayer.destroy(); _this.segmentAndTemplatelayer.destroy(); _this.imglayer.destroy(); _this.stage = null; console.log('destroyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy stage') }, 3);
        ////    this.stage.destroy();
        if (this.stage != null) {
            this.stage.off('click tap dragstart dragmove');

        }

        //   Kinetic.Util.clear();

        // this.stage.destroy();

        Konva.shapes = {};
        Konva.names = {};
        Konva.stages = [];

        //if (Kinetic.shapes != null && Kinetic.names['dicomimg']!=null)
        //{
        //    Kinetic.shapes[Kinetic.names['dicomimg'][0].colorKey] = null;
        //    Kinetic.names['dicomimg'] = null;
        //    Kinetic.names['segmentAndTemplatelayer'] = null;
        //    Kinetic.names['wlLayer'] = null;
        //    Kinetic.names['shapeslayer'] = null;
        //    Kinetic.names['wllayer'] = null;
        //    Kinetic.names['imgLayer'] = null;
        //    Kinetic.names['imglayer'] = null;
        //    Kinetic.shapes = [];
        //    Kinetic.names = [];
        //    Kinetic.stages = [];
        //    console.log('Finish viewer cleanup');
        //}
        if (this.hammer) {
            this.hammer.off('doubletap');
            this.hammer.off('tap');
            delete this.hammer;
        }


        this.RemoveListeners();
        delete this.myListeners;

        if (this.stage != null)
            this.stage.draw();
    }

    SetMMPerPixel(scaling: number, imageOrientation: ImageOrientation/*, oversizeValue: number, prefixText: string, isCenterLayout: boolean*/) {
        var _this = this;
        _this.MMPerPixel = scaling;
        _this.stage.batchDraw();
        _this.imageOrientation = imageOrientation;
        //var oversizeValuelabel = this.imglayer.get('.oversizeValuelabel')[0];
        //if (oversizeValuelabel == null) {
        //    oversizeValuelabel = ViewerHelper.addLabel(_this.imglayer, 'oversizeValuelabel', 'blue');

        //}
        // oversizeValuelabel.get('Text')[0].setText(prefixText + " Oversize: " + Math.round(oversizeValue) + "%");
        // oversizeValuelabel.moveToTop();

        //var dicomimg = this.imglayer.get('.dicomimg')[0];
        //if (dicomimg == null)
        //{
        //    _this.postImageOperationsQueue.push(function () { _this.SetMMPerPixel(scaling, oversizeValue, prefixText, isCenterLayout) });
        //    return;
        //}
        //if (isCenterLayout == true)
        //{
        //    oversizeValuelabel.setX((dicomimg.getWidth() - oversizeValuelabel.getWidth()) / 2);
        //    oversizeValuelabel.setY((dicomimg.getHeight() - oversizeValuelabel.getHeight()) / 2);
        //}
        //else
        //{
        //    oversizeValuelabel.setX(dicomimg.getWidth() - oversizeValuelabel.getWidth());
        //    oversizeValuelabel.setY(dicomimg.getHeight() - oversizeValuelabel.getHeight());
        //}
        // this.imglayer.draw();
    }

    MM2Pixels(mm: number) {
        return mm / this.MMPerPixel;
    }

    Pixels2MM(pixels: number) {
        return pixels * this.MMPerPixel;
    }

    Pan(enabled?: boolean) {

        if (enabled == null) {
            enabled = !this.stage.getDraggable();
        }
        this.stage.setDraggable(enabled);


    }

    Rotate = function () {

    }

    WindowLevel(onNewImageLoadedWithWLStarted, onNewImageLoadedWithWLFinished, photometricInterpretation) {
        var _this = this;
        this.SetViewerMouseState('windowing');
        function WLDragendCallback() {
            if (onNewImageLoadedWithWLStarted) {
                onNewImageLoadedWithWLStarted();
            }
            _this.SetCurrentImageWithWL(onNewImageLoadedWithWLFinished);
        }

        this.SetDoWindowingByDrag(WLDragendCallback, photometricInterpretation);
        //Roni : fill me in with your wisdom
    }

    Zoom() {
        var _this = this;
        this.SetViewerMouseState('zoom');

        this.SetZoomByDrag();

    }

    GetViewerMouseState() {
        return this.viewerMouseState;
    }

    SetViewerMouseState(state: string) {
        this.SetDeActivateViewerMouseState();
        this.viewerMouseState = state;
        if (this.viewerMouseState == 'text') {
            this.SetMouseDefaultStateDisabled(true, true);
        }
        else {
            this.SetMouseDefaultStateDisabled(false, false);
        }

    }

    SetDeActivateViewerMouseState() {
        if (this.stage != null) {
            this.stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
            if (this.viewerMouseState == 'text') {
                var dialog = TextAnnotationToolViewer.GetTextToolDialog(this.ViewerElementID);
                dialog.hide();
            }
            else if (this.viewerMouseState == 'pan') {
                this.Pan(false);
            }
            this.viewerMouseState = null;
            this.SetMouseDefaultState();

        }
        //    this.Pan(true);
    }

    Invert = function () {

    }

    ResetImage(): void {
        this.stage.destroy();
        this.stage.removeChildren();
        this.stage = null;
        var el = document.getElementById(this.ViewerElementID);
        if (el) {
            el.innerHTML = '';
        }
    }

    GetSelectedShapeType() {
        var selectedshapeType = null;
        ViewerHelper.traverseContainer(this.shapeslayer, function (container: any) {
            if (container.getAttr('selected') == true) {
                selectedshapeType = container.getAttr('shapeType');
                return true;
            }
        });
        if (selectedshapeType != null) {
            return selectedshapeType;
        }
        ViewerHelper.traverseContainer(this.segmentAndTemplatelayer, function (container: any) {
            if (container.getAttr('selected') == true) {
                selectedshapeType = container.getAttr('shapeType');
                return true;
            }
        });

        return selectedshapeType;


    }

    RemoveSelectedShape(): any {
        var isRemoved = false;
        var _this = this;
        var selectedContainer;
        ViewerHelper.traverseContainer(this.shapeslayer, function (container) {
            if (container.getAttr('selected') === true) {
                selectedContainer = container;

                return true;
            }
        });
        if (selectedContainer != null) {
            _this.RemoveShape(selectedContainer);

            return true;
        }

        ViewerHelper.traverseContainer(this.segmentAndTemplatelayer, function (container) {
            if (container.getAttr('selected') === true) {
                selectedContainer = container;

                return true;
            }
        });
        if (selectedContainer != null) {
            _this.RemoveShape(selectedContainer);

            return true;
        } else {

        }
    }

    RemoveShape(shape: any, stopRecurseFlag?: boolean) {
        var _this = this;
        var layer = shape.getLayer();
        var shapeName = shape.getName();
        var shapeType = shape.getAttr('shapeType');
        if (shapeType && shapeType === 'templateItemPartGroup' && arguments.callee.caller.toString().indexOf('return _this.RemoveShape') < 0) {
            setTimeout(() => { $("#SearchTemplatesInput").click(); }, 200);
        }
        var shapeParent = shape.getParent();
        var isImplant = (layer == _this.segmentAndTemplatelayer && shapeType == 'templateItemPartGroup');

        var onBeforeDeleteFunction = shape.getAttr('onBeforeDeleteFunction');
        if (onBeforeDeleteFunction != null) {
            onBeforeDeleteFunction(shape);
        }
        if (shape.parent != undefined) {
            var onBeforeDeleteChildFunction = shape.parent.getAttr('onBeforeDeleteChildFunction');
            if (onBeforeDeleteChildFunction != null) {
                onBeforeDeleteChildFunction(shape);
            }
        }

        if (shapeName == SegmentViewer.DraggableSegmentGroupName) {
            var blackPoly = _this.segmentAndTemplatelayer.find('.' + SegmentViewer.BlackPolygonShapeName)[0];
            if (blackPoly)
                blackPoly.destroy();

        }
        if (isImplant) {
            var isTemplateMasterMovement = shape.getAttr('isTemplateMasterMovement');
            if (isTemplateMasterMovement) {
                var rotatecenter_permanent = shapeParent.find('.rotatecenter_permanent')[0];
                if (rotatecenter_permanent != null) {
                    rotatecenter_permanent.destroy();
                }
            }
            if (shape.parent.getAttr('shapeType') == "Cups" && shape.find('.attachmentPoint').length > 0) {

                var inclinationLabel = _this.segmentAndTemplatelayer.find('.inclinationLabel')[0];
                if (inclinationLabel != null) {
                    ViewerHelper.removeLabel(_this, 'inclinationLabel', true);
                }
            }
        }

        if (isImplant && !stopRecurseFlag && this.ViewerSibiling)
            this.ViewerSibiling.RemoveShapeByName(shapeName, true /*to prevent endless loop*/);
        if (shapeName == "lldGroup") {

            var inclinationLabel = _this.segmentAndTemplatelayer.find('.inclinationLabel')[0];
            if (inclinationLabel != null) {
                ViewerHelper.removeLabel(_this, 'inclinationLabel', true);
            }
        }

        shape.destroy();
        //this.$rootScope.$broadcast(_this.EventShapeRemoved, shapeName);
        var onAfterDeleteFunction = shape.getAttr('onAfterDeleteFunction');
        if (onAfterDeleteFunction != null && !stopRecurseFlag /* no need to run on after twice*/) {
            onAfterDeleteFunction(shapeName);
        }
        if (isImplant) {
            var templateGroup = shapeParent;
            var templatePartGroups = templateGroup.children.filter(g => g.getAttr('shapeType') == 'templateItemPartGroup');
            if (templatePartGroups.length == 0) {
                templateGroup.destroy();
            }
            HipToolsViewer.recalcOffsetLabel(_this);
        }
        if (layer != null) {
            layer.draw();
        }
    }

    ToggleShowShapeByName(shapeName: string, isAutoHip: boolean) {

        var _this = this;
        var isVisible = false;
        if (this.stage != null) {
            var shapes = this.stage.find('.' + shapeName)
            var shape;
            if (shapes[0] != null) {

                //if (isAutoHip===true)
                //    shape = shapes[0].getParent();
                //else
                shape = shapes[0];

                if (shape != null) {
                    var show = shape.isVisible();
                    shape.setVisible(!show);

                    shape.getLayer().draw();
                    isVisible = !show;
                }
            }

        }
        return isVisible;
    }

    SetShowShapeByName(shapeName: string, show: boolean): void {
        var _this = this;
        if (this.stage != null) {
            var shapes = this.stage.find('.' + shapeName);
            if (shapes[0] != null) {

                shapes.forEach(s => s.setVisible(show));
                shapes[0].getLayer().draw();
            }
        }
    }


    RemoveShapeByName(shapeName: string, stopRecurseFlag?: boolean) {
        var _this = this;
        if (this.stage != null) {
            var shapes = this.stage.find('.' + shapeName);
            shapes.forEach((s: any) => _this.RemoveShape(s, stopRecurseFlag));
        }
    }

    RemoveShapeById(shapeName: string, shapeId: string, stopRecurseFlag?: boolean) {
        var _this = this;
        if (this.stage != null) {
            var shapes = this.stage.find('.' + shapeName);
            var shape = shapes.find('#' + shapeId)[0];
            _this.RemoveShape(shape, stopRecurseFlag);
        }
    }

    IsShapeExists(shapeName: string) {
        return this.stage != null && this.stage.find('.' + shapeName)[0] != null;
    }

    IsImageExist() {
        return this.img != undefined;
    }

    GetLineLength(name: string): any {
        if (this.stage != null) {
            var group = this.stage.find('.' + name)[0];
            if (group != null) {
                var connectingLine = group.find('.connectingLine')[0];
                return ViewerHelper.calculateLineLength(connectingLine);
            }
        }
        return 0;
    }

    GetLinePoints(name: string): any {
        if (this.stage != null) {
            var group = this.stage.find('.' + name)[0];
            if (group != null) {
                var connectingLine = group.find('.connectingLine')[0];
                if (connectingLine != null) {

                    var startAnchor = group.find('.p1')[0];
                    var endAnchor = group.find('.p2')[0];
                    var center = ViewerHelper.calculateLineCenterPoint(connectingLine);
                    var linePoints = new LinePoints();
                    linePoints.CenterPoint = center;
                    linePoints.StartPoint = new PointF(startAnchor.getX(), startAnchor.getY());
                    linePoints.EndPoint = new PointF(endAnchor.getX(), endAnchor.getY());
                    return linePoints;

                }
            }
        }
        return null;
    }

    GetImageWidth() {
        return (<number>this.actualImageWidth);
    }

    GetImageHeight() {
        return (<number>this.actualImageHeight);
    }

    GetImageUrl() {
        return this.imageObj.src;
    }

    GetImageBase64() {
        return this.resizedBase64Img;
    }
    // TODO:implement
    ClearBase64Img(): void {
        this.resizedBase64Img = null;
    }



    SetImageUrl(imageUrl: string, originalWidth: any, originalHeight: any, baseWLWindow: any, baseWLLevel: any, imageLoadedCallback:Function, imageErrorLoadedCallback: Function, isLocal?: any) {

        if (this.stage == null) {
            this.InitStage();
        }
        this.postImageOperationsQueue = [];
        var _this = this;


        _this.imageObj = new Image();
        _this.imageObj.onerror = function () {
            if (imageErrorLoadedCallback != null) {
                imageErrorLoadedCallback();
            }
        }
        _this.imageObj.onload = function () {

            if (_this == null || _this.imageObj == undefined) {
                return;
            }
            _this.imageObj.onload = null;
            if (_this.imglayer.find('.dicomimg')[0] != null) {
                return;
            }
            _this.img = new Konva.Image({
                x: 0,
                y: 0,
                image: _this.imageObj,
                name: 'dicomimg'
            });
            //TODO: Fix save local TFS 34911
            _this.resizedBase64Img = _this.img.toDataURL("image/jpeg");

            _this.img.scale({ x: _this.originalImageWidth / _this.actualImageWidth, y: _this.originalImageHeight / _this.actualImageHeight });

            //save img for possible local save
            //TODO: ORIGINAL
            //_this.resizedBase64Img = _this.img.toDataURL("image/jpeg");

            // add the shape to the layer
            _this.imglayer.add(_this.img);
            //debugging
            //_this.imglayer.cache({
            //    drawBorder: true
            //});
            //end debugging
            _this.imglayer.moveToBottom();

            _this.FitImage();


            (_this.postImageOperationsQueue || []).forEach(o => o());
            _this.postImageOperationsQueue = [];

            if (imageLoadedCallback != null) {
                imageLoadedCallback();
            }

            if (_this.OnWindowLevelsChangeCallback != null) {
                _this.OnWindowLevelsChangeCallback(_this.currentWLWindow, _this.currentWLLevel);
            }

        };

        _this.originalImageWidth = originalWidth;
        _this.originalImageHeight = originalHeight;

        //if (isLocal) {
        //    _this.actualImageWidth = originalWidth;
        //    _this.actualImageHeight = originalHeight;
        //}
        //else {
        var realSize = _this.CalcImageSizeToDownload(originalWidth, originalHeight);
        _this.actualImageWidth = realSize.width;
        _this.actualImageHeight = realSize.height;
        //      }

        _this.currentWLWindow = baseWLWindow;
        _this.currentWLLevel = baseWLLevel;

        _this.defaultWLWindow = baseWLWindow;
        _this.defaultWLLevel = baseWLLevel;
        //DMF: local images check if its string64
        if (imageUrl.substring(0, 5) == 'data:') {
            //TODO: resize local image according to realSize.width and realSize.height !!!!
            //  ResizeLocalImage(imgBase64: string, finalWidth: number, finalHeight: number, orientation ?: number)
            //TODO: check whats with orientation
            if (realSize.width == originalWidth && realSize.height == originalHeight) {
                _this.baseImageUrl = imageUrl;
                //////////////////////////
                //_this.imageObj.crossOrigin = "use-credentials";
                //console.log('Viewer - loading image src: ' + _this.baseImageUrl);
                _this.imageObj.src = _this.baseImageUrl;
            } else {
                //callback 
                this.ResizeLocalImage(imageUrl, realSize.width, realSize.height, function (result: any) {
                    _this.baseImageUrl = result;
                    /////////////////////////////
                    //_this.imageObj.crossOrigin = "use-credentials";
                    _this.imageObj.src = _this.baseImageUrl;
                    /*
                    var win = window.open('');
                    var html = "<img src = '" + imageUrl + "' alt ='' style ="+"border: 1px solid red"+"/ >"
                        + "<img src = '" + result + "' alt ='' style =" + "border: 1px solid blue" +" / >"
                    win.document.write(html);
                    */
                })
            }

        } else {
            //end
            _this.baseImageUrl = imageUrl + '&width=' + realSize.width + '&height=' + realSize.height;
            //////////////////////////////
            _this.imageObj.crossOrigin = "use-credentials";
            //console.log('Viewer - loading image src: ' + _this.baseImageUrl);
            _this.imageObj.src = _this.baseImageUrl;
        }
        //////////////////////////////
        //_this.imageObj.crossOrigin = "use-credentials";
        ////console.log('Viewer - loading image src: ' + _this.baseImageUrl);
        //_this.imageObj.src = _this.baseImageUrl;
    }

    SetCurrentImageWithWL(imageLoadedCallback: Function, resetWindowing = false) {
        var _this = this;
        var requestedLevel = _this.currentWLLevel;
        var requestedWindow = _this.currentWLWindow;
        var wlParametersString = '&wlLevel=' + requestedLevel + '&wlWindow=' + requestedWindow;
        if (resetWindowing) {
            requestedLevel = _this.defaultWLLevel;
            requestedWindow = _this.defaultWLWindow;
            wlParametersString = '';
        }
        _this.img.setAttr('image', null);
        _this.imageObj = new Image();
        _this.imageObj.onload = function () {
            _this.img.setAttr('image', _this.imageObj);

            _this.img.scale({ x: _this.originalImageWidth / _this.actualImageWidth, y: _this.originalImageHeight / _this.actualImageHeight });
            _this.stage.draw();
            _this.currentWLWindow = requestedWindow;
            _this.currentWLLevel = requestedLevel;
            if (_this.IsSegmentExists()) {
                var segmentPolygon = _this.segmentAndTemplatelayer.find('.' + SegmentViewer.SegmentPolygonShapeName)[0];
                segmentPolygon.clearCache().offset({ x: 0, y: 0 });
                segmentPolygon.setFillPatternImage(null);
                segmentPolygon.setFillPatternImage(_this.imageObj);

                var draggableSegmentGroup = _this.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0];
                //  SegmentViewer.CacheSegment(draggableSegmentGroup)
                _this.segmentAndTemplatelayer.draw();

                //var cacheData = {
                //    x: segmentPolygon.cache().getX(),
                //    y: segmentPolygon.cache().getY(),
                //    height: segmentPolygon.cache().getHeight(),
                //    width: segmentPolygon.cache().getWidth(),
                //    points: segmentPolygon.cache().getPoints()
                //}
                //var cacheOffset = segmentPolygon.cache().getOffset();

                //        segmentPolygon.cache().setFillPatternImage(_this.imageObj);




                //segmentPolygon.cache(cacheData).offset(cacheOffset);
                //segmentPolygon.drawHitFromCache();
                //_this.segmentAndTemplatelayer.draw();
            }
            if (imageLoadedCallback != null) {
                imageLoadedCallback();
            }
        };
        _this.imageObj.crossOrigin = "use-credentials";
        _this.imageObj.src = _this.baseImageUrl + wlParametersString;
    }

    IsSegmentExists() {
        return this.segmentAndTemplatelayer.find('.' + SegmentViewer.DraggableSegmentGroupName)[0] != null;
    }

    SetWLImageDataUrl(wlImageDataUrl: string, wlImageDataLoadedCallback: Function, OnWindowLevelsChangeCallback: (wlWindow: number, wlLevel: number) => void) {
        var _this = this;
        _this.wlImageDataObj = new Image();
        _this.wlImageDataObj.onload = function () {

            if (wlImageDataLoadedCallback != null) {
                wlImageDataLoadedCallback();
            }

        };


        _this.wlImageDataObj.crossOrigin = "use-credentials";
        var width = _this.actualImageWidth / _this.wlImageScaleFactor;
        var height = _this.actualImageHeight / _this.wlImageScaleFactor;
        _this.wlImageDataObj.src = wlImageDataUrl + '&width=' + width + '&height=' + height;
        _this.OnWindowLevelsChangeCallback = OnWindowLevelsChangeCallback;
    }

    CalcImageSizeToDownload(originalImageWidth: any, originalImageHeight: any) {
        var width = originalImageWidth;
        var height = originalImageHeight;
        var maxSize = 5 * 1024 * 1024;
        if (width * height > maxSize) {
            var scale = Math.sqrt(maxSize / (originalImageWidth * originalImageHeight));
            width = Math.floor(originalImageWidth * scale);
            height = Math.floor(originalImageHeight * scale);
            if (width * height > maxSize) {
                width -= 1;
                height -= 1;
            }
        }
        return { width: width, height: height };
    }

    FitImageByWidth() {
        var size = this.originalImageWidth
        var desiredSize = this.stage.getWidth();
        var scalefactor = desiredSize / size;
        this.stage.scale({ x: scalefactor, y: scalefactor });
        this.stage.draw();
    }

    setElementSize() {
        if (this.stage == undefined)
            return;

        var fixedHeight = Math.min(
            //   $(window).height(), // This is smaller on Desktop
            window.innerHeight, // This is smaller on Desktop
            window.innerHeight || Infinity // This is smaller on iOS7
        );

        this.stage.setHeight(fixedHeight - 44 - 6);

        // var width = $('#' + _this.ViewerElementID).width()
        //var width = $('.viewer-container').width();
        var width = document.querySelector('.viewer-container')?.clientWidth;
        this.stage.setWidth(width);
    }

    FitImage() {
        if (!this.stage)
            return;
        var width = this.originalImageWidth;
        var desiredWidth = this.stage.getWidth();
        var height = this.originalImageHeight;
        var desiredHeight = this.stage.getHeight();
        var scalefactorWidth = desiredWidth / width;
        var scalefactorHeight = desiredHeight / height;
        if (scalefactorWidth < scalefactorHeight) {

            this.stage.scale({ x: scalefactorWidth, y: scalefactorWidth });

            this.stage.setX(0);
            var y = (this.stage.getHeight() - this.stage.getScale().x * this.originalImageHeight) / 2;
            this.stage.setY(y);

        }
        else {
            this.stage.scale({ x: scalefactorHeight, y: scalefactorHeight });
            this.stage.setY(0);
            var x = (this.stage.getWidth() - this.stage.getScale().x * this.originalImageWidth) / 2;
            this.stage.setX(x);
        }

        this.stage.draw();
    }

    InitStage() {
        var _this = this;

        this.stage = new Konva.Stage({
            container: _this.ViewerElementID,
            draggable: false
        });

        this.imglayer = new Konva.Layer({
            name: 'imglayer',
        });
        this.shapeslayer = new Konva.Layer({
            name: 'shapeslayer',
        });

        this.segmentAndTemplatelayer = new Konva.Layer({
            name: 'segmentAndTemplatelayer',
        });

        this.wlLayer = new Konva.Layer({
            name: 'wlLayer',
        });

        var selectedShape;
        this.shapeslayer.on('beforeDraw', function () {
            if (_this.stage) {
                var scale = _this.stage.getScale().x;
                selectedShape = null
                traverseLayer(_this.shapeslayer);
            }



        });

        this.segmentAndTemplatelayer.on('beforeDraw', function () {
            if (_this.stage) {
                var scale = _this.stage.getScale().x;
                selectedShape = null
                traverseLayer(_this.segmentAndTemplatelayer);
            }


        });

        function traverseLayer(container) {
            if (!container.hasChildren()) {
                return;
            }
            var children = container.getChildren();
            //var scale = _this.stage.getScale().x;
            var enlargeShapesFactor = _this.stage.getAttr('enlargeShapesFactor') == null ? 1 : _this.stage.getAttr('enlargeShapesFactor');
            var isSelected = container.getAttr('selected') == null ? false : container.getAttr('selected');
            if (isSelected && container.getName() != SegmentViewer.DraggableSegmentGroupName) {
                container.moveToTop();
                container.moveToTop();
                //         selectedShape = container;
            }
            var filterBySelectedAttr = container.children.filter(c => {
                if (c.getAttr) {
                    return c.getAttr && c.getAttr('isTemplateMasterMovement') == true && c.getAttr('selected') == true
                }
            });

            if (!isSelected && filterBySelectedAttr[0] != null) {
                isSelected = true;
            }
            var disableDragging = container.getAttr('disableDragging') == null ? false : container.getAttr('disableDragging');
            var allowDragingSubAnchors = enableDragging || container.getAttr('allowDragingSubAnchors') == null ? false : container.getAttr('allowDragingSubAnchors');
            var enableDraggableIfNotSelected = container.getAttr('enableDraggableIfNotSelected') == null ? false : container.getAttr('enableDraggableIfNotSelected');
            var enableDragging = !disableDragging && (enableDraggableIfNotSelected || isSelected) && !_this.StartMultiTouchPanZoom;
            var enableDraggingSubAnchors = (!disableDragging || allowDragingSubAnchors) && (enableDraggableIfNotSelected || isSelected);
            container.setDraggable(enableDragging);
            var disableRotate = container.getAttr('disableRotate') == null ? false : container.getAttr('disableRotate')
            children.forEach(function (child:any) {
                var absTransform = child.getAbsoluteTransform().m;
                var scale = Math.sqrt(absTransform[0] * absTransform[0] + absTransform[1] * absTransform[1]) / enlargeShapesFactor;

                if (child.getAttr('shapeType') == 'Anchor') {
                    child.setAttr('radius', 6 / scale);
                    child.setAttr('strokeWidth', 2 / scale);
                    if (child.getAttr('transparentAnchor')) {
                        child.setAttr('stroke', 'transparent');
                    } else {
                        child.setAttr('stroke', isSelected ? '#ed145b' : 'transparent');
                    }

                    child.setVisible(isSelected && enableDraggingSubAnchors);

                }
                else if (child.getAttr('shapeType') == 'AnchorHitRegion') {
                    child.setAttr('radius', (Modernizr.touch ? 40 : 11) / scale);
                    child.setAttr('strokeWidth', 0.25 / scale);
                    child.setVisible(isSelected && enableDraggingSubAnchors);
                    child.setDraggable(enableDraggingSubAnchors);
                }
                else if (child.getAttr('shapeType') == 'connectingLine') {
                    var scaledStrokeSize = 2 / scale;
                    child.setAttr('strokeWidth', scaledStrokeSize);
                    child.setAttr('stroke', isSelected ? 'white' : child.getAttr('originalColor'));
                }
                else if (child.getName() == 'arc') {
                    child.setAttr('strokeWidth', 1 / scale);

                }
                else if (child.getAttr('shapeType') == 'connectingLineHitRegion') {
                    child.setAttr('strokeWidth', 36 / scale);
                    //       child.setAttr('stroke', isSelected ? 'white' : 'transparent');
                    //         child.setAttr('strokeWidth', 6 / scale);
                }
                else if (child.nodeType == 'Shape' && child.className == 'Text') {
                    var scaledfontSize = child.getAttr('originalFontSize') / scale;
                    var scaledPadding = child.getAttr('originalPadding') / scale;
                    var minFontSize = 6;

                    child.setAttr('fontSize', scaledfontSize < minFontSize ? minFontSize : scaledfontSize);
                    child.setAttr('fontSize', scaledfontSize);
                    child.setAttr('padding', scaledPadding < 2 ? 2 : scaledPadding);
                    var showPixelLength = child.getAttr('hidePixelLength') == null ? true : !child.getAttr('hidePixelLength');
                    var editableLabel = child.getAttr('editableLabel') == true ? true : false;
                    if (showPixelLength) {
                        var pixelLength = child.getAttr('pixelLength');
                        if (pixelLength == null) { pixelLength = child.getParent().getAttr('pixelLength'); }
                        if (_this.MMPerPixel != null && pixelLength != null) {
                            var labelPrefix = child.getAttr('labelPrefix');
                            if (labelPrefix == null) { labelPrefix = child.getParent().getAttr('labelPrefix'); }

                            var labelPostfix = child.getAttr('labelPostfix');
                            if (labelPostfix == null) { labelPostfix = child.getParent().getAttr('labelPostfix'); }
                            if (editableLabel) {
                                var labelText = child.getAttr('text');
                                var numberOfTrimChar = 3;

                                if (labelText.indexOf('longer') > 0) numberOfTrimChar = 9; //case lld label
                                if (labelText.indexOf('shorter') > 0) numberOfTrimChar = 10; //case lld label

                                var calculatedTxt = labelText.substr(0, labelText.indexOf('mm') + numberOfTrimChar);

                                var freetext = labelText.replace(calculatedTxt, '').trim();
                                child.setAttr('text', (labelPrefix == null ? '' : labelPrefix) + (pixelLength * _this.MMPerPixel).toFixed(1) + ' mm' + (labelPostfix == null ? ' ' : labelPostfix + ' ') + freetext);
                            } else {
                                child.setAttr('text', (labelPrefix == null ? '' : labelPrefix) + (pixelLength * _this.MMPerPixel).toFixed(1) + ' mm' + (labelPostfix == null ? '' : labelPostfix));
                            }
                        }
                    }
                    child.getParent().setVisible(child.getAttr('text') != '');
                }
                else if (child.getName() == 'rotatehandle') {
                    var scaledLength = 70 / scale;

                    child.setVisible(isSelected && !disableRotate);
                    var mastertemplateIsSelected = child.getParent().children.filter(c => c.getAttr('isTemplateMasterMovement') == true && c.getAttr('selected') == true)[0] != null;
                    if (mastertemplateIsSelected) {
                        child.setVisible(mastertemplateIsSelected && !disableRotate);
                    }
                    child.setAttr('width', 70 / scale);
                    child.setAttr('height', 70 / scale);
                }

                else if (child.getName() == 'boundingRect') {
                    child.setAttr('strokeWidth', 1 / scale);
                    child.setVisible(isSelected && !disableRotate);
                    var mastertemplateIsSelected = child.getParent().children.filter(c => c.getAttr('isTemplateMasterMovement') == true && c.getAttr('selected') == true)[0] != null;
                    if (mastertemplateIsSelected) {
                        child.setVisible(mastertemplateIsSelected && !disableRotate);
                    }

                }

                else if (child.getName() == 'rotatehandleHitRegion') {
                    child.setAttr('strokeWidth', 1 / scale);
                    child.setVisible(isSelected && !disableRotate);
                    var mastertemplateIsSelected = child.getParent().children.filter(c => c.getAttr('isTemplateMasterMovement') == true && c.getAttr('selected') == true)[0] != null;
                    if (mastertemplateIsSelected) {
                        child.setVisible(mastertemplateIsSelected && !disableRotate);
                    }
                    child.setAttr('radius', 35 / scale);
                }
                else if (child.getName() == 'rotatecenter') {
                    child.setAttr('strokeWidth', 1 / scale);
                    child.setVisible(isSelected && !disableRotate);
                    var mastertemplateIsSelected = child.getParent().children.filter(c => c.getAttr('isTemplateMasterMovement') == true && c.getAttr('selected') == true)[0] != null;
                    if (mastertemplateIsSelected) {
                        child.setVisible(mastertemplateIsSelected && !disableRotate);
                    }

                } else if (child.getAttr('shapeType') == SegmentViewer.SegmentPolygonShapeName) {
                    child.setAttr('strokeWidth', 1 / scale);
                    child.setAttr('stroke', isSelected ? '#000000' : child.getAttr('originalColor'));

                } else if (child.getAttr('shapeType') == 'circleTool') {
                    child.setAttr('strokeWidth', isSelected ? 2 / scale : 1 / scale);
                    child.setAttr('stroke', isSelected ? 'white' : child.getAttr('originalColor'));

                } else if (child.getName() == 'rotatecenter_permanent' || child.getName() == 'attachmentPoint') {
                    child.setAttr('stroke', isSelected ? '#ed145b' : child.getAttr('originalColor'));

                } else if (child.getName() == 'textTool') {
                    child.setAttr('stroke', isSelected ? '#fff' : child.getAttr('originalColor'));

                } else if (child.getName() == 'attachmentPoint') {
                    child.setAttr('strokeWidth', 1 / scale);
                    child.setAttr('radius', 7 / scale);
                }
                //else if (child.getName() == Viewer.DraggableSegmentGroupName) { 
                //    child.setDraggable(enableDragging);
                //}
                else if (child.getName() == 'connectinglineToLabel') {

                    var line = child.getAttr('line');
                    var point = child.getAttr('point');
                    var label = child.getAttr('label');

                    var isLabelRepositionNotAllowed = label.getAttr('dragged') == null ? false : label.getAttr('dragged');

                    if (line != null) {
                        var midPointA = ViewerHelper.calculateLineCenterPoint(line);
                        child.setStroke(line.getStroke());
                        child.setPoints([midPointA.x, midPointA.y, label.x(), label.y()]);

                    }
                    child.setVisible(line != null);
                    if (point != null) {

                        child.setStroke(point.getStroke());
                        child.setPoints([Math.round(point.x()), Math.round(point.y()), Math.round(label.x()), Math.round(label.y())]);
                        child.setVisible(true);
                    }
                }
                else if (child.getAttr('shapeType') == 'templateimgShape' && child.getImage() != null) {
                    var filterColor = child.getAttr('filterColor');
                    if (isSelected && filterColor != 'sel') {
                        child.filters(null);
                        child.setAttr('filterColor', 'sel');
                        child.green(177);
                        child.blue(50);
                        child.red(248);
                        child.filters([Konva.Filters.RGB]);

                        //child.cache();
                        child.drawHit();//Cache

                    } else if (!isSelected && filterColor != 'nosel') {
                        child.filters(null);
                        child.setAttr('filterColor', 'nosel');
                        child.green(158);
                        child.blue(226);
                        child.red(0);
                        child.filters([Konva.Filters.RGB]);
                        //child.cache();
                        child.drawHit();//drawHitFromCache
                    }
                }
                // if  grooup is  selected  select  all subGroup as  well 
                // Example in TibialSlop
                else if (child.attrs.selected && child.children.length) {
                    for (var i = 0; i < child.children.length; i++) {
                        if (child.children[i].name().indexOf('SubGroup') > 0) {
                            child.children[i].attrs.selected = true;
                        }
                    }
                }
                traverseLayer(child);
            });

        }
        this.stage.on('click tap', function (evt:any) {

            // get the shape that was clicked on
            var shape = evt.target; // y.g - migration to k5.1.1 evt.targetNode;
            var shapename = shape.getName();
            if (_this.viewerMouseState == 'circle' || _this.viewerMouseState == 'ruler') {
                _this.SetDeActivateViewerMouseState();
                return false;
            }
            _this.SetCurrentSelected(shape);

        });



        // add the layer to the stage
        this.stage.add(this.imglayer);
        this.stage.add(this.segmentAndTemplatelayer);
        this.stage.add(this.shapeslayer);
        this.stage.add(this.wlLayer);
        this.wlLayer.visible(false);

        var _stage = this.stage;
        _this.setElementSize();
        _this.SafeAddEventlistener(_this.$window, "resize", function () {
            if (Modernizr.touch) {
                if (navigator.userAgent.match(/iPad/i) != null) {

                }
            }
            else {
                resize();
            }
        }, false);

        _this.SafeAddEventlistener(_this.$window, "orientationchange", function () {
            if (_this.viewerMouseState == 'text') {
                _this.SetDeActivateViewerMouseState(); //Cause keyboard up is messing the right height of the window
            }
            resize();
        }, false);

        function resize() {
            _this.setElementSize();
            _this.FitImage();
        }


        this.SetMouseDefaultState();
        this.multiTouchZoomPanEnabled = true;
        this.InitMultiTouchZoomPan();

        this.SetOneTouchPan(true);
        //this.InitMouseWheelZoom();
        this.InitKeyboardStrokeZoom();
    }

    SetMouseDefaultState(): void {
        this.mouseWheelZoomEnabled = true;
        this.keyboardZoomEnabled = true;
        this.SetMousePanEnabled(true);
    }

    SetMouseDefaultStateDisabled(disableWheel?: boolean, disableKeyboard?: boolean) {

        if (disableWheel) {
            this.mouseWheelZoomEnabled = false;
        }
        if (disableKeyboard) {
            this.keyboardZoomEnabled = false;
        }

        this.SetMousePanEnabled(false);
    }
    SetGroupSelected(shapeName: string) {
        let shape = this.stage.find('.' + shapeName)[0];
        if (shape == null)
            return;

        let container = ViewerHelper.GetClosestContainer(shape);
        if (container != null && container.nodeType == "Group") {
            container.setAttr('selected', true);
            this.moveObjectToTop(container);
            this.traverseStageOnClick(this.stage, container);
            this.shapeslayer.draw();
            this.segmentAndTemplatelayer.draw();
            this.segmentAndTemplatelayer.drawScene(); //fix problen where rotate handle of template is not hidden  after a new one is selected
        }
    }

    SetCurrentSelected(shape: string) {
        let container = ViewerHelper.GetClosestContainer(shape);
        let isTemplateFlag = false;
        if (container != null && container.nodeType == "Group") {

            container.setAttr('selected', true);
            var onShapeSelectedFunction = container.getAttr('onShapeSelectedFunction');
            if (onShapeSelectedFunction != null) {
                onShapeSelectedFunction(container.getAttr('shapeType'), container.getName(), this.ViewerIndex);
                isTemplateFlag = true;
            }
            this.moveObjectToTop(container);

        }

        this.traverseStageOnClick(this.stage, container);
        this.shapeslayer.draw();
        this.segmentAndTemplatelayer.draw();
        this.segmentAndTemplatelayer.drawScene(); //fix problen where rotate handle of template is not hidden  after a new one is selected

        if (!isTemplateFlag && this.ViewerSibiling)
            this.ViewerSibiling.DeSelectAll();
    }

    DeSelectAll(): void {
        this.traverseStageOnClick(this.stage, null);
        if (this.shapelayer) {
            this.shapeslayer.draw();
        }
        if (this.segmentAndTemplatelayer) {
            this.segmentAndTemplatelayer.draw();
            this.segmentAndTemplatelayer.drawScene(); //fix problen where rotate handle of template is not hidden  after a new one is selected
        }
    }

    traverseStageOnClick(container: any, excludeContainer: any): void {
        var _this = this;
        if (!container) {
            return;
        }
        if (container != excludeContainer && container.nodeType == "Group") {
            var oldselected = container.getAttr('selected');
            container.setAttr('selected', false);
            if (oldselected) {
                var onShapeUnSelectedFunction = container.getAttr('onShapeUnSelectedFunction');
                if (onShapeUnSelectedFunction != null) {
                    onShapeUnSelectedFunction(container.getAttr('shapeType'), container.getName());
                }
            }
        }
        if (container.getChildren != null) {
            var children = container.getChildren();
            children.forEach(function (child: any) {
                _this.traverseStageOnClick(child, excludeContainer);
            });
        }
    }

    moveObjectToTop(shape: any): void {
        if (shape.nodeType != "Group") {
            return;
        }
        var mustStayBehind = shape.getAttr('mustStayBehind');
        if (!mustStayBehind) {
            shape.moveToTop();
            this.moveObjectToTop(shape.getParent())
        }
    }

    SetOneTouchPan() {
        var _this = this;
        if (Modernizr.touch) {
            this.SetViewerMouseState('pan');
            _this.Pan(true);

        }
    }

    SetMousePanEnabled(enabled: boolean) {
        var _this = this;
        //   if (Modernizr.touch)
        //       {
        _this.Pan(enabled);
        //      }
        //if (enabled)
        //{

        //    // pan by mouse dragging on stage
        //    _this.stage.on("dragstart dragmove", function (e) { _this.$window.draggingNode = true; });
        //    _this.stage.on("dragend", function (e) { _this.$window.draggingNode = false; });
        //    $("#" + this.ViewerElementID).on("mousedown", function (e) { 
        //        if (_this.$window.draggingNode) return false;
        //        if (e.which == 1) {
        //            _this.$window.draggingStart = { x: e.pageX, y: e.pageY, stageX: _this.stage.getX(), stageY: _this.stage.getY() };
        //            _this.$window.draggingStage = true;
        //        }
        //    });
        //    $("#" + this.ViewerElementID).on("mousemove", function (e) {
        //        if (_this.$window.draggingNode || !_this.$window.draggingStage) return false;
        //        _this.stage.setX(_this.$window.draggingStart.stageX + (e.pageX - _this.$window.draggingStart.x));
        //        _this.stage.setY(_this.$window.draggingStart.stageY + (e.pageY - _this.$window.draggingStart.y));
        //        _this.stage.batchDraw();
        //    });
        //    $("#" + this.ViewerElementID).on("mouseup", function (e) { _this.$window.draggingStage = false });
        //}
        //else {
        //    _this.stage.off("dragstart dragmove");
        //    _this.stage.off("dragend");
        //    $("#" + this.ViewerElementID).off("mousedown");
        //    $("#" + this.ViewerElementID).off("mousemove");
        //    $("#" + this.ViewerElementID).off("mouseup");
        //}
    }

    InitKeyboardStrokeZoom() {
        let _this = this;
        _this.zoomFactor = 0.1;
        let ctrlKey = 17, upArrowKey = 38, downArrowKey = 40;

        _this.SafeAddEventlistener(_this.$window, 'keydown', function (e) {
            if (!_this.keyboardZoomEnabled) {
                return;
            }


            var scale = _this.stage.getScale().x;

            var new_scale;
            if (e.ctrlKey || e.metaKey) { //metaKey for Mac
                if (!_this.IsSelected)
                    return;

                if (e.keyCode == upArrowKey) { //add +
                    new_scale = scale + scale * _this.zoomFactor;
                }
                else if (e.keyCode == downArrowKey) {
                    new_scale = scale - scale * _this.zoomFactor
                        ;
                }
                if (new_scale) {
                    e.stopPropagation();
                    _this.stage.getHeight()
                    _this.ZoomStageByFactor(new_scale, _this.stage.getWidth() / 2, _this.stage.getHeight() / 2);
                    return false;
                }
            };

        }, false);
    }

    InitMouseWheelZoom(viewerRef: any) {
        if (!viewerRef) { return };

        var _this = this;

        _this.min_scale = 0.1;
        //var content = _this.$window; // was _this.stage.getContent()

        _this.SafeAddEventlistener(viewerRef, 'wheel', function (e) {
            onmousewheel(e, e.wheelDelta / 120)
        });
        _this.SafeAddEventlistener(viewerRef, 'mousewheel', function (e) {
            onmousewheel(e, e.wheelDelta / 120)
        });

        //The DOMMouseScroll event is used in F
        _this.SafeAddEventlistener(viewerRef, 'DOMMouseScroll', function (e) { onmousewheel(e, e.detail) });


        // _this.SafeAddEventlistener(viewerRef, 'wheel', function (e) {
        //     onmousewheel(e, (e.wheelDelta % 120 === 0) ? e.wheelDelta / 40 : e.wheelDelta)
        // });

        function onmousewheel(e: any, delta: any) {
            if (!_this.mouseWheelZoomEnabled) {
                return;
            }

            if (!_this.IsSelected)
                return;
            if (!_this.stage)
                return;

            var scale = _this.stage.getScale().x;

            //prevent only the actual wheel movement
            //if (delta !== 0) {
            // e.preventDefault();
            //}
            var new_scale;
            //TODO: improve wheel scale ? priority: low
            if (delta > 0) {
                new_scale = scale + Math.abs(delta / 50);
            } else {
                new_scale = scale - Math.abs(delta / 50);
            }
            //var activeEl = document.getElementsByClassName("yelloborder")[0];

            //console.log(activeEl);
            console.log(new_scale);

            _this.ZoomStageByFactor(new_scale, e.layerX, e.layerY);


        }


        $('#' + this.ViewerElementID).on('dblclick', function () {
            if (!_this.mouseWheelZoomEnabled) {
                return;
            }
            if (_this.GetViewerMouseState() == "windowing") {
                var resetWindowing: boolean = true;
                _this.SetCurrentImageWithWL(null, resetWindowing);
            }
            _this.FitImage();

        });


    }

    ZoomStageByFactor(new_scale, mouseLocationX, mouseLocationY) {
        var _this = this;
        _this.min_scale = 0.1;
        if (new_scale > _this.min_scale) {

            var locationAbsCoords = new PointF(mouseLocationX, mouseLocationY);
            var locationImageCoords = MathL.TranslateScreenPointToImagePoint(_this.imglayer, locationAbsCoords);

            _this.stage.scale({ x: new_scale, y: new_scale });

            var NewlocationImageCoords = MathL.TranslateScreenPointToImagePoint(_this.imglayer, locationAbsCoords);
            ViewerHelper.MoveObjectPointToPoint(_this.stage, locationImageCoords, NewlocationImageCoords);

            _this.stage.batchDraw();
        }
    }

    InitMultiTouchZoomPan() {
        let _this = this;
        let _lastDist: number;
        let _lastCenterPoint: any;
        let _firstCenterPoint: any;
        let _zoomStarted: boolean;
        let _isPanning: boolean;

        let _MinDistanceChangeToStartZoom = 20;
        let _MinDistanceChangeToStartZoomWhilePanning = 70;
        let _MinMovementToStartPanMode = 50;


        this.stage.getContent().addEventListener('touchmove', function (evt) {

            if (!_this.multiTouchZoomPanEnabled) {

                return;
            }
            let touch1 = evt.touches[0];
            let touch2 = evt.touches[1];
            if (touch1 && touch2) {
                // Zoom

                /*         
                           // Yariv - this part is for 2 fingers swipe - cuurently featur needs fine tuning and postponed
                             var right1 = this.x1Start < touch1.pageX;
                           var right2 = this.x2Start < touch2.pageX;
                           var up1 = this.y1Start < touch1.pageY;
                           var up2 = this.y2Start < touch2.pageY;
           
                           if (right1 == right2 || up1 == up2) {
                               return;
                               //this is swipe
                           }
           
           
                           evt.stopPropagation();
              
               */

                var dist = ViewerHelper.getDistance({
                    x: touch1.clientX,
                    y: touch1.clientY
                }, {
                    x: touch2.clientX,
                    y: touch2.clientY
                });


                var centerPoint = new PointF((touch1.clientX + touch2.clientX) / 2,
                    (touch1.clientY + touch2.clientY) / 2);
                if (_this.ViewerIndex == 1) {
                    var screenWidth = window.innerWidth;// $(window).width();
                    var canvasWidth = document.getElementById(_this.ViewerElementID).parentElement.offsetWidth;
                    if (screenWidth != canvasWidth)
                        centerPoint.x -= canvasWidth;
                }


                if (!_lastDist) {
                    _lastDist = dist;
                    _lastCenterPoint = centerPoint;
                    _firstCenterPoint = centerPoint;
                    _zoomStarted = false;
                    _isPanning = false;
                }

                if (!_zoomStarted) {
                    if (_isPanning) {
                        if (dist - _lastDist > _MinDistanceChangeToStartZoomWhilePanning || _lastDist - dist > _MinDistanceChangeToStartZoomWhilePanning) {
                            _zoomStarted = true;
                        }
                    } else {
                        if (dist - _lastDist > _MinDistanceChangeToStartZoom || _lastDist - dist > _MinDistanceChangeToStartZoom) {
                            _zoomStarted = true;
                        } else {
                            var totalMoveDist = ViewerHelper.getDistance(_firstCenterPoint, centerPoint);
                            if (totalMoveDist > _MinMovementToStartPanMode) {
                                _isPanning = true;
                            }
                        }
                    }
                }

                var locationImageCoords = MathL.TranslateScreenPointToImagePoint(_this.imglayer, _lastCenterPoint);

                var scale = _this.stage.getScale().x * (((dist / _lastDist) - 1) / 2 + 1);
                if (_zoomStarted) {
                    if (scale > 0.2 && scale < 4) {
                        _this.stage.scale({ x: scale, y: scale });
                    }
                    _lastDist = dist;
                }
                var NewlocationImageCoords = MathL.TranslateScreenPointToImagePoint(_this.imglayer, centerPoint);

                ViewerHelper.MoveObjectPointToPoint(_this.stage, locationImageCoords, NewlocationImageCoords);

                _this.stage.batchDraw();
                _lastCenterPoint = centerPoint;


            }


        });


        this.stage.getContent().addEventListener('touchstart', function (evt) {
            var touch1 = evt.touches[0];
            var touch2 = evt.touches[1];

            if (touch1 && touch2) //Zoom
            {
                //console.log("____________________________________________ in viewer zoom ", evt);
                //evt.stopPropagation();
                //return false;

                this.x1Start = touch1.pageX;
                this.x2Start = touch2.pageX;
                this.y1Start = touch1.pageY;
                this.y2Start = touch2.pageY;

                _this.SetDeActivateViewerMouseState();
                _this.Pan(false);
                _this.SetCurrentSelected(null);
                _this.StartMultiTouchPanZoom = true;
            }
        });

        this.stage.getContent().addEventListener('touchend', function () {
            if (!_this.multiTouchZoomPanEnabled) {
                return;
            }
            _lastDist = 0;
            _zoomStarted = false;
            _isPanning = false;
            _this.Pan(true);
            _this.StartMultiTouchPanZoom = false;
        });


        _this.hammer.on('doubletap', function (event: any) {
            if (!_this.multiTouchZoomPanEnabled) {
                return;
            }
            if (_this.GetViewerMouseState() == "windowing") {
                var resetWindowing = true;
                _this.SetCurrentImageWithWL(null, resetWindowing);
            }
            _this.FitImage();
        });

        //_this.hammer.on('hold', function (event) {
        //    alert('hold');
        //});


    }

    static addAnchor(group: any, x: number, y: number, name: string, connectFunction: Function, connectFunctionParams?, dragendCallback?: Function, transparentAnchor?) {
        let stage = group.getStage();
        let layer = group.getLayer();
        let _this = this;
        let anchor: any = new Konva.Circle({
            x: x,
            y: y,
            stroke: "#fff",
            transparentAnchor: transparentAnchor,
            strokeWidth: 2,
            radius: 12,
            name: name,
            draggable: false,
            shapeType: 'Anchor',
            MoveAnchorFunc: MoveAnchor

        });

        let anchorHitRegion: any = new Konva.Circle({
            x: x,
            y: y,
            stroke: "transparent",
            strokeWidth: 5,
            radius: 42,
            name: name + 'HitRegion',
            draggable: true,
            shapeType: 'AnchorHitRegion'

        });

        function MoveAnchor(newLocation: PointF) {
            anchor.setX(newLocation.x);
            anchor.setY(newLocation.y);
            anchorHitRegion.setX(newLocation.x);
            anchorHitRegion.setY(newLocation.y);
            connectFunction(group, connectFunctionParams);
        }


        anchorHitRegion.on("dragmove", function () {
            anchor.setX(anchorHitRegion.getX());
            anchor.setY(anchorHitRegion.getY());
            connectFunction(group, connectFunctionParams);
        });
        anchorHitRegion.on("mousedown touchstart", function () {
            anchor.setX(anchorHitRegion.getX());
            anchor.setY(anchorHitRegion.getY());

            anchor.moveToTop();
            anchorHitRegion.moveToTop();
        });
        anchorHitRegion.on("dragend touchend", function () {
            anchor.setX(anchorHitRegion.getX());
            anchor.setY(anchorHitRegion.getY());

            layer.batchDraw();

            if (dragendCallback != null) {
                dragendCallback();
            }

        });
        // add hover styling
        anchorHitRegion.on("mouseover touchstart", function () {
            var layer = anchorHitRegion.getLayer();
            document.body.style.cursor = "pointer";
            anchor.setStrokeWidth(4);
            //         anchor.setStroke('yellow');

            anchorHitRegion.setStroke('white');
            if (layer) {
                layer.batchDraw();

            }

        });
        anchorHitRegion.on("mouseout touchend", function () {
            var layer = anchorHitRegion.getLayer();
            document.body.style.cursor = "default";
            anchor.setStrokeWidth(2);
            //          anchor.setStroke('lightgreen');
            anchorHitRegion.setStroke('transparent');
            if (layer) {
                layer.batchDraw();
            }
        });

        group.add(anchorHitRegion);
        group.add(anchor);
        anchor.moveToTop();
        anchorHitRegion.moveToTop();
        return anchor;
    }

    getCursorPosition(e: any, canvas: any) {
        let x;
        let y;
        if (e.pageX != undefined && e.pageY != undefined) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        return { x: x, y: y };
    }

    SetZoomByDrag  () {
        let _this = this;
        let isStarted = false;
        let startLocation: any = null;
        let lastLocation: any = null;
        let _MinDistanceChangeToStartZoom = 20;

        var stage = _this.stage;

        stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
        stage.getLayers().on("mousedown touchstart", function (e) {
            if (isStarted) {
                isStarted = false;
            }
            else {
                //lastLocation = startLocation = { x: e.evt.layerX, y: e.evt.layerY };
                lastLocation = startLocation = ViewerHelper.getOffset(e.evt);
                isStarted = true;
            }
        });

        stage.getLayers().on("mousemove touchmove", function (e: any) {
            if (isStarted) {
                var coor = ViewerHelper.getOffset(e.evt);
                DoZoom(coor.x, coor.y);
                //DoZoom(e.evt.layerX, e.evt.layerY);
            }
        });

        stage.getLayers().on('mouseup touchend', function (e: any) {
            isStarted = false;
            startLocation = null;
            lastLocation = null;
            //stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
            //_this.SetDeActivateViewerMouseState();

            e.cancelBubble = true;

        });

        function DoZoom(x:any, y:any) {
            if (startLocation == null || lastLocation == null || (x == lastLocation.x && y == lastLocation.y))
                return;
            var scale = _this.stage.getScale().x;
            var delta = y - lastLocation.y;
            var new_scale = scale * (1 + delta / 200);

            _this.ZoomStageByFactor(new_scale, startLocation.x, startLocation.y);
            lastLocation = { x: x, y: y };
        }
    }

    SetDoWindowingByDrag(dragendCallback: Function, photometricInterpretation:any) {
        var _this = this;

        var isStarted = false;
        var prevLocation:any;
        var screenRect:any;
        var canvasScaleFactor = 2;
        var wlTempCanvas:any = null;
        var isVisible = false;


        _this.stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
        _this.stage.getLayers().on("mousedown touchstart", function (e:any) {
            if (isStarted) {
                isStarted = false;
                // _this.shapeslayer.drawScene();
            }
            else {
                var coor = ViewerHelper.getOffset(e.evt);
                StartWindowing(coor.x, coor.y);
                //StartWindowing(e.evt.layerX, e.evt.layerY);
                isStarted = true;
            }
        });

        _this.stage.getLayers().on("mousemove touchmove", function (e:any) {
            if (isStarted) {
                var layerCoords = ViewerHelper.getOffset(e.evt);
                //var layerCoords = { x: e.evt.layerX, y: e.evt.layerY };

                isStarted = true;
                DoWindowing(layerCoords.x, layerCoords.y, photometricInterpretation, false);
                // DoWindowing(e.evt.layerX, e.evt.layerY, photometricInterpretation, false);
            }
        });

        _this.stage.getLayers().on("mouseup touchend", function (e:any) {
            isStarted = false;
            EndWindowing(dragendCallback);
            //      _this.stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
            _this.SetDeActivateViewerMouseState();
            e.cancelBubble = true;

        });

        function StartWindowing(x: any, y: any) {
            prevLocation = { x: x, y: y };

            var stageWidth = _this.stage.getWidth();
            var stageHeight = _this.stage.getHeight();

            var imageWidth = _this.imageObj.width;
            var imageHeight = _this.imageObj.height;

            var imgStartOnScreenCoords = MathL.TranslateImagePointToScreenPoint(_this.img, new PointF(0, 0));
            var imgEndOnScreenCoords = MathL.TranslateImagePointToScreenPoint(_this.img, new PointF(imageWidth, imageHeight));
            var screenStartOnImgCoords = MathL.TranslateScreenPointToImagePoint(_this.img, new PointF(0, 0));
            var screenEndOnImgCoords = MathL.TranslateScreenPointToImagePoint(_this.img, new PointF(stageWidth, stageHeight));

            var imageRect = RectangleF.CreateFromPoints(screenStartOnImgCoords, screenEndOnImgCoords).Intersect(RectangleF.CreateFromPoints(new PointF(0, 0), new PointF(imageWidth, imageHeight)));
            screenRect = RectangleF.CreateFromPoints(imgStartOnScreenCoords, imgEndOnScreenCoords).Intersect(RectangleF.CreateFromPoints(new PointF(0, 0), new PointF(stageWidth, stageHeight)));

            var canvasWidth = Math.floor(screenRect.width / canvasScaleFactor);
            var canvasHeight = Math.floor(screenRect.height / canvasScaleFactor);

            if (canvasWidth == 0 || canvasHeight == 0)
                return;     // empty WL canvas - no drawing needed

            wlTempCanvas = document.createElement('canvas');
            wlTempCanvas.setAttribute('width', canvasWidth+'');
            wlTempCanvas.setAttribute('height', canvasHeight+'');

            var dc = wlTempCanvas.getContext('2d');
            dc.mozImageSmoothingEnabled = false;
            dc.imageSmoothingEnabled = false;
            dc.msImageSmoothingEnabled = false;
            dc.imageSmoothingEnabled = false;

            var wlImageRect = new RectangleF(0, 0, _this.wlImageDataObj.width, _this.wlImageDataObj.height);
            var destWLImageRect = new RectangleF(imageRect.x / _this.wlImageScaleFactor, imageRect.y / _this.wlImageScaleFactor, imageRect.width / _this.wlImageScaleFactor, imageRect.height / _this.wlImageScaleFactor);
            destWLImageRect = destWLImageRect.Intersect(wlImageRect);

            dc.drawImage(_this.wlImageDataObj, destWLImageRect.x, destWLImageRect.y, destWLImageRect.width, destWLImageRect.height, 0, 0, canvasWidth, canvasHeight);

            screenRect = screenRect.Round();

            DoWindowing(x, y, photometricInterpretation, true);
            _this.wlLayer.visible(true);
            //_this.imglayer.visible(false);
            _this.shapeslayer.visible(false);
            _this.segmentAndTemplatelayer.visible(false);
            _this.stage.draw();
        }


        function EndWindowing(dragendCallback: Function) {
            prevLocation = null;
            //    wlTempCanvas = null;
            //   _this.wlLayer.visible(false);
            //   _this.imglayer.visible(true);
            _this.shapeslayer.visible(true);
            _this.segmentAndTemplatelayer.visible(true);
            //     _this.stage.draw();

            if (dragendCallback != null) {
                dragendCallback();
            }

        }

        function DoWindowing(x:any, y:any, photometricInterpretation:any, firstRun:any) {
            if (!firstRun && (prevLocation == null || wlTempCanvas == null || (x == prevLocation.x && y == prevLocation.y)))
                return;

            let dx = x - prevLocation.x;
            let dy = prevLocation.y - y;
            _this.currentWLWindow += Math.round((dx > 0) ? Math.max(dx, Math.min(dx * 5, Math.pow(1.1, dx))) : - Math.max(-dx, Math.min(-dx * 5, Math.pow(1.1, -dx))));
            _this.currentWLLevel += Math.round((dy > 0) ? Math.max(dy, Math.min(dy * 5, Math.pow(1.1, dy))) : - Math.max(-dy, Math.min(-dy * 5, Math.pow(1.1, -dy))));
            if (_this.currentWLWindow <= 0)
                _this.currentWLWindow = 1;

            if (_this.OnWindowLevelsChangeCallback != null) {
                _this.OnWindowLevelsChangeCallback(_this.currentWLWindow, _this.currentWLLevel);
            }
            let canvasWidth = wlTempCanvas.getAttribute('width');
            let canvasHeight = wlTempCanvas.getAttribute('height');

            let drawCanvas = document.createElement('canvas');
            drawCanvas.setAttribute('width', canvasWidth);
            drawCanvas.setAttribute('height', canvasHeight);

            DrawWindowedImage(drawCanvas, wlTempCanvas, canvasWidth, canvasHeight, photometricInterpretation);

            let dc = _this.wlLayer.getCanvas()._canvas.getContext('2d');
            dc.mozImageSmoothingEnabled = false;
            dc.imageSmoothingEnabled = false;
            dc.msImageSmoothingEnabled = false;
            dc.imageSmoothingEnabled = false;

            dc.drawImage(drawCanvas, screenRect.x, screenRect.y, screenRect.width, screenRect.height);

            prevLocation = { x: x, y: y };
            //_this.wlLayer.draw();
        }



        function DrawWindowedImage(destCanvas: any, wlTempCanvas: any, width: number, height: number, photometricInterpretation: any) {
            var destCtx = destCanvas.getContext('2d');
            var imageData = destCtx.getImageData(0, 0, width, height);
            var wlData = wlTempCanvas.getContext('2d').getImageData(0, 0, width, height);

            var s = 255 / _this.currentWLWindow;
            var o = 128 - _this.currentWLLevel * s;
            if (photometricInterpretation == 'MONOCHROME2') {
                for (var y = 0; y < height; y++) {
                    var pos = y * width * 4; // *4 for 4 bytes per pixel
                    for (var x = 0; x < width; x++) {
                        var hiBits = wlData.data[pos + 2];
                        var lowBits = wlData.data[pos + 1];
                        var grayVal = (hiBits << 8) + lowBits;
                        var grayValFinal = (grayVal * s + o);
                        //console.log('hiBits: ' +hiBits + ' lowBits: ' + lowBits + ' dicom val: ' + grayVal + ' view val: ' + grayValFinal);
                        imageData.data[pos++] = imageData.data[pos++] = imageData.data[pos++] = grayValFinal;
                        imageData.data[pos++] = 255;
                    }
                }
            }
            else {
                for (var y = 0; y < height; y++) {
                    var pos = y * width * 4; // *4 for 4 bytes per pixel
                    for (var x = 0; x < width; x++) {
                        var hiBits = wlData.data[pos + 2];
                        var lowBits = wlData.data[pos + 1];
                        var grayVal = (hiBits << 8) + lowBits;
                        var grayValFinal = 255 - (grayVal * s + o);
                        //console.log('hiBits: ' +hiBits + ' lowBits: ' + lowBits + ' dicom val: ' + grayVal + ' view val: ' + grayValFinal);
                        imageData.data[pos++] = imageData.data[pos++] = imageData.data[pos++] = grayValFinal;
                        imageData.data[pos++] = 255;
                    }
                }
            }
            // put pixel data on canvas
            destCtx.putImageData(imageData, 0, 0);
        }
    }

    GetSavedOverlaysAsImageData(addedTextOnImage: string, isPrint?: boolean) {
        let backroundColor, fontColor, reportlabel;
        let imageWidth;
        let imageHeight;
        let crossOrigin;
        let stageWidth:any;
        let stageHeight;
        let enlargeShapesFactor;
        let stageState;
        let drawContext:any;
        if (isPrint) {
            backroundColor = "#000000"
            fontColor = "#FFFFFF"
        }
        else {
            backroundColor = '#262426'
            fontColor = '#f8b133'
        }

        //DMF set color opacity of report label here  (group, labelname, backgroundcolor (#009ee2), line, originalFontSize= 14, opacity= 0.8 (0.4), label= null, point= null, color= 'white', pointerDirection = 'left')
        reportlabel = ViewerHelper.addLabel(this.segmentAndTemplatelayer, 'reportlabel', backroundColor, null, 14, 0.2, null, null, fontColor, null);
        reportlabel.find('Text')[0].setText(addedTextOnImage);
        reportlabel.moveToTop();
        imageWidth = this.imageObj.width;
        imageHeight = this.imageObj.height;
        crossOrigin = this.imageObj.crossOrigin;
        stageWidth = this.stage.getWidth();
        stageHeight = this.stage.getHeight();

        enlargeShapesFactor = Math.max(imageWidth / stageWidth, imageHeight / stageHeight);
        //DMF set label position according to patient side
        var xLoc = 10;
        if (this.imageOrientation.IsLeftBodyPart == false) {
            //DMF report label width should be translated to image pixels
            xLoc = imageWidth - reportlabel.getWidth() * enlargeShapesFactor - 10;
        }
        reportlabel.setX(xLoc);
        reportlabel.setY(10);
        // IE ERR HERE
        var drawCanvas = document.createElement('canvas');
        drawCanvas.setAttribute('width', imageWidth);
        drawCanvas.setAttribute('height', imageHeight);

        stageState = this.SaveStageState();
        this.stage.setAttr('enlargeShapesFactor', enlargeShapesFactor);
        this.stage.scale({ x: imageWidth / this.originalImageWidth, y: imageHeight / this.originalImageHeight });
        drawContext = drawCanvas.getContext('2d');

        for (var startX = 0; startX < imageWidth; startX += stageWidth) {
            for (var startY = 0; startY < imageHeight; startY += stageHeight) {
                this.stage.position({ x: -startX, y: -startY });
                this.segmentAndTemplatelayer.draw();
                this.shapeslayer.draw();
                drawContext.drawImage(this.segmentAndTemplatelayer.getCanvas()._canvas, startX, startY, stageWidth, stageHeight);
                drawContext.drawImage(this.shapeslayer.getCanvas()._canvas, startX, startY, stageWidth, stageHeight);
            }
        }

        this.RestoreStageState(stageState);
        reportlabel.destroy();
        this.stage.draw();

        // alert("creating Image");
        var newImage = null;
        try {
            newImage = drawCanvas.toDataURL('image/png', 1.0);
        }
        catch (e) {
            console.log('Error canvas to dataUrl: ', e);
            try {
                newImage = drawCanvas.toDataURL();
            }
            catch (e) {
                console.log(e);
            }

        }

        // var newImage = this.imageObj.toDataURL();

        // alert("ImageCreated");
        // window.open(newImage, "FullImage", "width=3200, height=3200");
        if (newImage) {
            return newImage.substr(22); // remove "data:image/png;base64,"
        }

        return newImage;


    }

    GetOriginalandOverlaysImageData(addedTextOnImage: string, originalImageBase64: string, imageSize: any, $q, isPrint?: boolean) {
        //"data:image/png;base64," removed!!!!
        //var _this = this;
        let overlaysBase64 = "data:image/png;base64," + this.GetSavedOverlaysAsImageData(addedTextOnImage, isPrint);
        let promises = [];
        let deferredFinal = $q.defer();
        //var canvas = document.createElement('canvas');
        //canvas.width = imageSize.width;
        //canvas.height = imageSize.height;
        //var ctx = canvas.getContext('2d');

        //var img1 = new Image();
        //var img2 = new Image();
        //img2.src = overlaysBase64;
        //img1.src = originalImageBase64;

        function loadImage(base64: string) {
            var deferred = $q.defer();
            var img = new Image();
            img.onload = function () {
                deferred.resolve(img);
            }
            img.src = base64;
            return deferred.promise;
        }


        promises.push(loadImage(originalImageBase64));
        promises.push(loadImage(overlaysBase64));

        //function getNewBase64(twoImgs) {
        //    var deferred = $q.defer();
        //    var canvas = document.createElement('canvas');
        //    canvas.width = imageSize.width;
        //    canvas.height = imageSize.height;
        //    var ctx = canvas.getContext('2d');
        //    ctx.drawImage(twoImgs[0], 0, 0);

        //    ctx.globalAlpha = 1;
        //    ctx.drawImage(twoImgs[1], 0, 0);

        //    var newBase64 = canvas.toDataURL('image/jpeg');
        //    deferred.resolve(newBase64);
        //    return deferred.promise;

        //}

        $q.all(promises)
            .then((values: any) => {

                var canvas: any = document.createElement('canvas');
                canvas.width = imageSize.width;
                canvas.height = imageSize.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(values[0], 0, 0);

                ctx.globalAlpha = 1;
                ctx.drawImage(values[1], 0, 0);

                var newBase64 = null;
                try {
                    newBase64 = canvas.toDataURL('image/jpeg');
                    deferredFinal.resolve(newBase64);
                } catch (e) {
                    console.log("Error canvas.toDataURL: ", e);
                    deferredFinal.reject(e);
                }

            }
            );
        return deferredFinal.promise;


        //ctx.drawImage(img1, 0, 0);

        //ctx.globalAlpha = 1;
        //ctx.drawImage(img2, 0, 0);

        //var newBase64 = canvas.toDataURL('image/jpeg');
        //return newBase64;

        /////////////////////////////
        //     var originalImg = loadImage(originalImageBase64, main);
        //      var overlaysImg = loadImage(overlaysBase64, main);
        //  var imagesLoaded = 0;

        /*
          function main() {
  
              imagesLoaded += 1;
              if (imagesLoaded == 2) {
                  // composite now
                  ctx.drawImage(originalImg, 0, 0);
  
                  ctx.globalAlpha = 1;
                  ctx.drawImage(overlaysImg, 0, 0);
                  var newBase64 = canvas.toDataURL('image/jpeg');
                  /*
                  alert("ImageCreated");
                  var win = window.open('');
                  var html = "<img src = '" + newBase64 + "' alt ='' / >"
                      + "<img src = '" + overlaysBase64 + "' alt ='' / >"
                  win.document.write(html);
                  
  
                 return newBase64;
      }
    
          }
  
          function loadImage(src, main) { 
              var img = new Image();
              img.onload = main;
              img.src = src;
              return img;
          }
           */
        ///////////////////////////

    }


    SaveStageState() {
        var state: any = {};
        state.scaleX = this.stage.getScale().x;
        state.scaleY = this.stage.getScale().y;
        state.x = this.stage.getX();
        state.y = this.stage.getY();
        return state;
    }

    RestoreStageState(state: any) {
        this.stage.setAttr('enlargeShapesFactor', 1);
        this.stage.scale({ x: state.scaleX, y: state.scaleY });
        this.stage.setX(state.x);

        this.stage.setY(state.y);
    }
    //DMF local images
    //Resize image to 5 megapixel  and probably thumbnail.
    ResizeLocalImage = function (imgBase64: string, finalWidth: number, finalHeight: number, callback: Function, orientation?: number) {
        //if no orientation then 1 (as is)
        // var orientation = orientation || 1;

        //implement orientation change if needed
        //set transform left right and switch W H values accordingly

        // no q in ts: var deffered = $q.defer(); so i use callback

        let canvas: any = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        let img = new Image();
        img.src = imgBase64;
        img.onload = function (e) {
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            //check if  can make vertual canvas smaller
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            //here should go logic to rotate according to orientation
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            console.log('ResizeLocalImage toDataURL started');
            var newImgBase64 = canvas.toDataURL('image/jpeg');
            return callback(newImgBase64);
        }

    }

}