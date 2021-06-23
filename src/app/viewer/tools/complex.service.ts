import { Injectable } from '@angular/core';
import Konva from 'konva';
import { ShapeService } from './shape.service';

@Injectable({
  providedIn: 'root'
})
export class ComplexService {
  strokeColor = 'red';
  colors = ['red', 'orange', 'yellow'];
  scale = 5;// viewer.stage.getScale().x;
  scaledLStroke = 5 / this.scale;
  layer: any;
  constructor(private shapeService: ShapeService) { }

  complex(type: any) {
    debugger;
    const group = this.createCircleGroup('complexGroup');
    let connectingLine;
    let connectingCircle;

    connectingLine = new Konva.Line({
      stroke: this.strokeColor,
      strokeWidth: this.scaledLStroke > 5 ? 5 : this.scaledLStroke,
      lineCap: 'round',
      lineJoin: 'round',
      name: 'userline'
    });

    connectingCircle = new Konva.Circle({
      stroke: this.strokeColor,
      strokeWidth: this.scaledLStroke > 5 ? 5 : this.scaledLStroke,
      name: 'usercircle'
    });
    this.layer.add(connectingLine);
    this.layer.add(connectingCircle);
    connectingLine.points([10, 10, 150, 50]);

    // this.colors.forEach((k, i) => {
    //   const obj = this.shapeService.rectangle({
    //     type: 'rectangle',
    //     x: i * 30,
    //     y: i * 30,
    //     draggable: false
    //   });
    //   obj.fill(k);
    //   group.add(obj);
    // });

    // group.draggable(true);
    // group.cache();


    // return group;
  }
  complexNew(complexType: any) {
    const group = this.createCircleGroup(complexType);

    // this.viewer.SetViewerMouseState('circle');
    // BasicToolsViewer.SetDrawCircleByDrag(this.viewer, group, '#ed145b', BasicToolsViewer.connectPointsToCircleDiameter, dragendCallback);
    //  this.SetDrawCircleByDrag(this, group, '#ed145b');

    const connectingLine = new Konva.Line({
      stroke: this.strokeColor,
      strokeWidth: this.scaledLStroke > 5 ? 5 : this.scaledLStroke,
      lineCap: 'round',
      lineJoin: 'round',
      name: 'userline'
    });

    const connectingCircle = new Konva.Circle({
      stroke: this.strokeColor,
      strokeWidth: this.scaledLStroke > 5 ? 5 : this.scaledLStroke,
      name: 'usercircle'
    });

    this.layer.add(connectingLine);
    this.layer.add(connectingCircle);
  }

  createCircleGroup(complexType: string): any {
    let group = new Konva.Group({
      name: complexType,
      draggable: true,
      getReport: this.getReport,
      getSWIP: this.getSWIP,
      mmPerPixel: 0.10667994179542374//this.viewer.MMPerPixel
    });
    this.layer.add(group);

    return group;
  }

  getReport() { }
  getSWIP() { }

  // SetDrawCircleByDrag (viewer, group, strokeColor, connectFunction?, dragendCallback?) {

  //   let stage = group.getStage();
  //   let isStarted = false;
  //   let moveStarted = false;
  //   let startPoint = null;

  //   let connectingLine;
  //   let connectingCircle;

  //   //     _this.Pan(false);
  //   //      _this.SetMousePanEnabled(false);

  //   //stage.getLayers().off('mousedown mousemove mouseup touchstart touchend');
  //   //stage.getLayers().on("mousedown touchstart", function (e) {
  //     if (isStarted) {
  //       isStarted = false;
  //       viewer.shapeslayer.drawScene();
  //     }
  //     else {
  //       e.evt.cancelBubble = true;
  //       e.evt.stopPropagation();

  //       moveStarted = false;
  //       var scale = viewer.stage.getScale().x;
  //       var scaledLStroke = 5 / scale;
  //       connectingLine = new Konva.Line({
  //         stroke: strokeColor,
  //         strokeWidth: scaledLStroke > 5 ? 5 : scaledLStroke,
  //         lineCap: 'round',
  //         lineJoin: 'round',
  //         name: 'userline'
  //       });

  //       connectingCircle = new Konva.Circle({
  //         stroke: strokeColor,
  //         strokeWidth: scaledLStroke > 5 ? 5 : scaledLStroke,
  //         name: 'usercircle'
  //       });

  //       viewer.shapeslayer.add(connectingLine);
  //       viewer.shapeslayer.add(connectingCircle);
  //       //startPoint = { x: e.evt.layerX, y: e.evt.layerY };
  //       startPoint = ViewerHelper.getOffset(e.evt);
  //       var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, startPoint);
  //       connectingLine.setPoints([imgcoords.x, imgcoords.y, imgcoords.x, imgcoords.y]);

  //       isStarted = true;
  //     }
  //   });

  //   stage.getLayers().on("mousemove touchmove", function (e) {
  //     if (isStarted) {
  //       e.evt.cancelBubble = true;
  //       e.evt.stopPropagation();
  //       //var layerCoords = { x: e.evt.layerX, y: e.evt.layerY };
  //       var layerCoords = ViewerHelper.getOffset(e.evt);
  //       if (!moveStarted && MathL.distanceSqr(layerCoords, startPoint) > 150) {
  //         moveStarted = true;
  //       }
  //       if (moveStarted) {
  //         var imgcoords = MathL.TranslateScreenPointToImagePoint(viewer.imglayer, layerCoords);
  //         connectingLine.getPoints()[2] = imgcoords.x;
  //         connectingLine.getPoints()[3] = imgcoords.y;

  //         var centerimgcoords = ViewerHelper.calculateLineCenterPoint(connectingLine);
  //         connectingCircle.setX(centerimgcoords.x);
  //         connectingCircle.setY(centerimgcoords.y);
  //         connectingCircle.setRadius(ViewerHelper.calculateLineLength(connectingLine) / 2);
  //       }
  //       isStarted = true;
  //       viewer.shapeslayer.drawScene();
  //     }
  //   });

  //   stage.getLayers().on("mouseup touchend", function (e) {
  //     isStarted = false;
  //     var p1 = { x: connectingLine.getPoints()[0], y: connectingLine.getPoints()[1] };
  //     var p2 = { x: connectingLine.getPoints()[2], y: connectingLine.getPoints()[3] };
  //     if (!moveStarted) {
  //       var scale = stage.getScale().x;
  //       p2 = { x: connectingLine.getPoints()[0] + 150 / scale, y: connectingLine.getPoints()[1] };
  //     }
  //     connectingLine.destroy();
  //     connectingCircle.destroy();
  //     var anchor = Viewer.addAnchor(group, p1.x, p1.y, "p1", connectFunction, null, dragendCallback);
  //     Viewer.addAnchor(group, p2.x, p2.y, "p2", connectFunction, null, dragendCallback);
  //     connectFunction(group, strokeColor);

  //     viewer.SetCurrentSelected(anchor);
  //     stage.getLayers().off('mousedown');
  //     stage.getLayers().off('touchstart');
  //     stage.getLayers().off('mousemove mouseup touchend');
  //     //              viewer.SetDeActivateViewerMouseState();
  //     viewer.shapeslayer.drawScene();
  //     e.evt.cancelBubble = true;
  //     e.evt.stopPropagation();
  //     if (dragendCallback != null) {
  //       dragendCallback();
  //     }

  //   });
}

