import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { Rect } from 'konva/lib/shapes/Rect';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { eLayers, eShapes } from './interfaces'; 
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
   
  stage!: Konva.Stage;
  layers: { [k: string]: any } = {};
  layerKeys = eLayers;
  selectionRectangle: any;
  tr: any;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  constructor(
    private service: ViewerService,
    private ShapeService: ShapeService
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

      Object.keys(planObject.stage.layers || {})
        .forEach(key => {
          const layerConfig = planObject.stage.layers[key];
          this.layers[layerConfig.name] = new Konva.Layer(layerConfig);
          this.stage.add(this.layers[layerConfig.name]);
          if (layerConfig.isTransformer) {
            // add a new feature, lets add ability to draw selection rectangle
            this.selectionRectangle = new Konva.Rect({ fill: 'rgba(0,0,255,0.5)', name: 'selectionRectangle' });
            this.tr = new Konva.Transformer();
            this.layers[layerConfig.name].add(this.selectionRectangle);
            this.layers[layerConfig.name].add(this.tr);
          }
        });

      // clicks should select/deselect shapes
      this.stage.on('click tap', (e) => {
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

      this.stage.on('mousedown touchstart', (e: any) => {
  
        // e.target is a clicked Konva.Shape or current stage if you clicked on empty space
        // console.log(`Clicked on:  '${e.target.name()}'`);
        // console.log('DATA:', e.target);
        // console.log(`Parent: ${e.target.parent?.getType()}, Parent Name: ${e.target.parent?.attrs.id}`);
        // console.log(
        //   'usual click on ' + JSON.stringify(this.stage.getPointerPosition())
        // );

        
        if (e.target !== this.stage) {
          return;
        }
        this.x1 = this.stage.getPointerPosition()?.x as number;
        this.y1 = this.stage.getPointerPosition()?.y as number;
        this.x2 = this.stage.getPointerPosition()?.x as number;
        this.y2 = this.stage.getPointerPosition()?.y as number;
         
        this.selectionRectangle.visible(true);
        this.selectionRectangle.width(0);
        this.selectionRectangle.height(0);

        
      });//.bind(this.stage);

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

      this.stage.on('mouseup touchend', () => {
        // no nothing if we didn't start selection
        if (!this.selectionRectangle.visible()) {
          return;
        }
        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
          this.selectionRectangle.visible(false);
        });

        let shapes = this.stage.find('.rect');
        let box = this.selectionRectangle.getClientRect();
        let selected = shapes.filter((shape) => {
          console.log('box, shape.getClientRect():', box, shape.getClientRect());
          Konva.Util.haveIntersection(box, shape.getClientRect());
        }
        );
        console.log('selected:', selected);
        this.tr.nodes(selected);
      });
      //test
      // this.initCircle();
      //    var json = this.stage.toJSON();
      //   console.log(json);
    });

  }

  initCircle(): void {
    const conf = {
      x: this.stage.width() / 2,
      y: this.stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      drggable: true,
      name: 'moshe-circle'
    };
    let circle = new Konva.Circle(conf);

    var transformer = new Konva.Transformer({
      nodes: [circle],
      rotateAnchorOffset: 60,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    });
    // layer.add(transformer)
    this.layers[eLayers[eLayers.shapesLayer]].add(circle);
    this.layers[eLayers[eLayers.shapesLayer]].add(transformer);


  }

  addToShapeLayer(type: eShapes): void {
    console.log('addToShapeLayer', type);
    let sh = this.shapeType[type];
    let _shapeObj = {
      type: type
    };

    this.stage.getLayer();
    // const conf = {
    //   x: Math.floor(Math.random() * 100),
    //   y: Math.floor(Math.random() * 100),
    //   radius: 70,
    //   fill: 'red',
    //   stroke: 'black',
    //   strokeWidth: 4
    // }

    this.layers['shapesLayer'].add(this.ShapeService[_shapeObj.type](_shapeObj));
    //this.layers['shapesLayer'].add(this.ShapeService[type]());
    //   this.stage.getLayers()[0].add(this.ShapeService.rectangle());

  }

  addToSegmentAndTemplateLayer(): void {
    this.stage.getLayer();
    const conf = {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4
    }
    let circle = new Konva.Circle(conf);
    this.layers['segmentAndTemplateLayer'].add(this.ShapeService.rectangle('rect'));
    //   this.stage.getLayers()[0].add(this.ShapeService.rectangle());
    //  debugger;
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
}
