import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { Rect } from 'konva/lib/shapes/Rect';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { eComplex, eLayers, eShapes } from './interfaces';
import { ComplexService } from './tools/complex.service';
import { ShapeService } from './tools/shape.service';
import { ViewerService } from './viewer-service.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements AfterViewInit {
  @ViewChild('container', { static: true }) container!: ElementRef;
  public shapeType = eShapes;
  public complexType = eComplex;

  stage!: Konva.Stage;
  layers: { [k: string]: any } = {};
  layerKeys = eLayers;
  selectionRectangle: any;
  tr: any;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  clipBoard: any;

  constructor(
    private service: ViewerService,
    private ShapeService: ShapeService,
    private ComplexService: ComplexService
  ) { }

  ngAfterViewInit(): void {
    let width = window.innerWidth * 0.9;
    let height = window.innerHeight;

    this.service.getPlan().subscribe(planObject => {
      const container = this.container.nativeElement;
      height = height * 0.7;
      width = container.offsetWidth;
      this.stage = new Konva.Stage({
        container: planObject.name,
        width: width,
        height: height,
        draggable: false,
      });

      Object.keys(planObject.stage.layers || {})//.reverse()
        .forEach((key, i) => {
          const layerConfig = planObject.stage.layers[key];
          this.layers[layerConfig.name] = new Konva.Layer(layerConfig).setZIndex(i);
          this.stage.add(this.layers[layerConfig.name]);
          if (layerConfig.isTransformer) {
            // add a new feature, lets add ability to draw selection rectangle
            this.selectionRectangle = new Konva.Rect(
              {
                stroke: 'rgba(0,0,0,1)',
                strokeWidth: .5,
                dash: [3, 3]
              }
            );
            this.selectionRectangle.visible(false);
            this.tr = new Konva.Transformer();
            this.layers[layerConfig.name].add(this.selectionRectangle);
            this.layers[layerConfig.name].add(this.tr);
          }
          if (layerConfig.image && layerConfig.image > '') {
            const imageObj = new Image();
            // let layer = this.layers[layerConfig.name];
            imageObj.onload = () => {
              // alert(imageObj.width + 'x' + imageObj.height);
              const darth = new Konva.Image({
                x: 0,
                y: 0,
                //  opacity: 0.5,
                image: imageObj,
                width: imageObj.width * .7,
                height: imageObj.height * .7,
                name: layerConfig.image
              });
              // add the shape to the layer
              this.layers[layerConfig.name].add(darth);
            }
            imageObj.src = `assets/${layerConfig.image}`;
          }
        });
      this.initStageEvents();
    });
  }

  private initStageEvents(): void {
    this.stage.on('mousedown touchstart', (e: any) => {
      // e.target is a clicked Konva.Shape or current stage if you clicked on empty space
      // console.log(`Clicked on:  '${e.target.name()}'`);
      // console.log('DATA:', e.target);
      // console.log(`Parent: ${e.target.parent?.getType()}, Parent Name: ${e.target.parent?.attrs.id}`);
      // console.log(
      //   'usual click on ' + JSON.stringify(this.stage.getPointerPosition())
      // );

      // console.log('e.target !== this.stage ::', e.target !== this.stage);
      // console.log(' e.target.getLayer().attrs.name !== \'imgLayer\'::',
      //   e.target === this.stage && e.target.getLayer().attrs.name !== 'imgLayer');

      //   if (e.target !== this.stage ||
      //     e.target === this.stage && e.target.getLayer().attrs.name !== 'imgLayer'
      //  ) {
      //     return;
      //  }

      this.x1 = this.stage.getPointerPosition()?.x as number;
      this.y1 = this.stage.getPointerPosition()?.y as number;
      this.x2 = this.stage.getPointerPosition()?.x as number;
      this.y2 = this.stage.getPointerPosition()?.y as number;

      this.selectionRectangle.visible(true);
      this.selectionRectangle.width(0);
      this.selectionRectangle.height(0);
    });

    this.stage.on('mousemove touchmove', () => {
      // no nothing if we didn't start selection
      if (!this.selectionRectangle.visible()) {
        return;
      }
      this.x2 = this.stage.getPointerPosition()?.x as number;
      this.y2 = this.stage.getPointerPosition()?.y as number;

      this.selectionRectangle.setAttrs({
        x: Math.min(this.x1, this.x2),
        y: Math.min(this.y1, this.y2),
        width: Math.abs(this.x2 - this.x1),
        height: Math.abs(this.y2 - this.y1),
      });
    });
    // clicks should select/deselect shapes
    this.stage.on('click tap', (e) => {
      if (this.clipBoard) {
        this.insertFromClipboard(true);
        return;
      }
      // if we are selecting with rect, do nothing
      if (this.selectionRectangle.visible()) {
        return;
      }


      // if click on empty area - remove all selections
      if (e.target === this.stage) {
        this.tr.nodes([]);
        return;
      }

      // do nothing if clicked NOT on our rectangles
      if (!e.target.hasName('rect')) {
        return;
      }

      // do we pressed shift or ctrl?

      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      const isSelected = this.tr.nodes().indexOf(e.target) >= 0;

      if (!metaPressed && !isSelected) {
        // if no key pressed and the node is not selected
        // select just one
        this.tr.nodes([e.target]);
      } else if (metaPressed && isSelected) {
        // if we pressed keys and node was selected
        // we need to remove it from selection:
        const nodes = this.tr.nodes().slice(); // use slice to have new copy of array
        // remove node from array
        nodes.splice(nodes.indexOf(e.target), 1);
        this.tr.nodes(nodes);
      } else if (metaPressed && !isSelected) {
        // add the node into selection
        const nodes = this.tr.nodes().concat([e.target]);
        this.tr.nodes(nodes);
      }
    });

    this.stage.on('mouseup touchend', () => {
      // no nothing if we didn't start selection
      if (!this.selectionRectangle.visible()) {
        return;
      }
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        this.selectionRectangle.visible(false);
      });


      let shapes = this.layers.shapesLayer.find('.simpleShape');
      let box = this.selectionRectangle.getClientRect();
      let selected = shapes.filter((shape: any) => {
        return Konva.Util.haveIntersection(box, shape.getClientRect());
      });
      console.log('selected:', selected);
      this.tr.nodes(selected);
    });
  }

  public addToSegmentAndTemplateLayer(type: eShapes): void {
    this.addShape({ type });
    this.insertFromClipboard(false, eLayers.segmentAndTemplateLayer);

  }

  // private size = fromEvent(window, 'resize').pipe(
  //   map(() => {
  //     const container = this.container.nativeElement;
  //     return {
  //       height: container.offsetHeight,
  //       width: container.offsetWidth
  //     };
  //   })
  // );


  public addToShapeLayer(type: eShapes): void {
    this.addShape({ type });
    this.insertFromClipboard();
  }

  public addShape(addObj: { type: eShapes }, e?: any):void {
    if (e) {
      this.addButtonPress(e);
    }
    let conf = { type: addObj.type, origin: 'primitive', initDefaultPos: true, draggable: true };
    this.clipBoard = this.ShapeService[conf.type](conf);
  }

  public addComplex(addObj: { type: eComplex }, e?: any): void {
    if (e) {
      this.addButtonPress(e);
    }
    let conf = { type: addObj.type, origin: 'complex' };
    this.clipBoard = this.ComplexService[conf.type](conf);
  }

  private insertFromClipboard(initDefaultPos?: boolean, toThisLayer: eLayers = eLayers.shapesLayer) {
    const layerKey = this.clipBoard.hasName('complexGroup') ? eLayers.segmentAndTemplateLayer : toThisLayer;
    if (initDefaultPos) {
      this.clipBoard.setPosition(this.stage.getPointerPosition());
    }

    this.layers[eLayers[layerKey]].add(this.clipBoard);
    this.clipBoard = undefined;

    //temp implemented for testing
    this.removeButtonPress();
  }

 

  private removeButtonPress(): void {
    const buttons = Array.from(document.getElementsByTagName('button'));
    buttons.forEach((but) => but.classList.remove('clicked'));
  }

  private addButtonPress(e: any): void {
    this.removeButtonPress();
    e.toElement.classList.add('clicked');
  }
}
