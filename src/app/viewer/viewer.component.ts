import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

import { eLayers } from './interfaces';
import { ShapeService } from './tools/shape.service';
import { ViewerService } from './viewer-service.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements AfterViewInit {
  @ViewChild('container', { static: true }) container!: ElementRef;
  stage!: Konva.Stage;
  layers: { [k: string]: any } = {};
  layerKeys = eLayers;
  constructor(
    private service: ViewerService,
    private ShapeService: ShapeService
  ) { }

  ngAfterViewInit(): void {
    let width = window.innerWidth * 0.9;
    let height = window.innerHeight;
    this.service.getPlan().subscribe(planObject => {
      const container = this.container.nativeElement;
      height = height * 0.7;;
      width = container.offsetWidth;



      this.stage = new Konva.Stage({
        container: planObject.name,

        width: width,
        height: height,
        draggable: false,
      });
      Object.keys(planObject.stage.layers || {})
        // .map((key, v) => {
        //   debugger;
        //   return key;

        // })
        .forEach(key => {
          const layerConfig = planObject.stage.layers[key];
          this.layers[layerConfig.name] = new Konva.Layer(layerConfig);
          this.stage.add(this.layers[layerConfig.name]);
          if (layerConfig.isTransformer) {
            const tr = new Konva.Transformer();
            this.layers[layerConfig.name].add(tr);
            // // by default select all shapes
            // tr.nodes([rect1, rect2]);
          }
        });


      this.stage.on('click', function (e) {
        if (e.target === this) {
          console.log('click on stage: no object');
          return;
        }
        // e.target is a clicked Konva.Shape or current stage if you clicked on empty space
        console.log(`Clicked on:  '${e.target.name()}'`);
        console.log('DATA:', e.target);
        console.log(`Parent: ${e.target.parent?.getType()}, Parent Name: ${e.target.parent?.attrs.id}`);
        console.log(
          'usual click on ' + JSON.stringify(this.getPointerPosition())
        );
      });

      //test
      this.initCircle();
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
  addToShapeLayer(): void {
    this.stage.getLayer();
    const conf = {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4
    }

    this.layers['shapesLayer'].add(this.ShapeService.rectangle());
    //   this.stage.getLayers()[0].add(this.ShapeService.rectangle());
    debugger;
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
    this.layers['segmentAndTemplateLayer'].add(this.ShapeService.rectangle());
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
