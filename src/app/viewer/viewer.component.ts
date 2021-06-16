import { Component, OnInit } from '@angular/core';
import Konva from 'konva';
import { KonvaModule } from 'ng2-konva';
import { eLayers } from './interfaces';
import { ShapeService } from './tools/shape.service';
import { ViewerService } from './viewer-service.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  stage!: Konva.Stage;

  layers: { [k: string]: any } = {};
  layerKeys = eLayers;
  constructor(
    private service: ViewerService,
    private ShapeService: ShapeService
  ) { }

  ngOnInit(): void {
    let width = window.innerWidth * 0.9;
    let height = window.innerHeight;

    this.service.getPlan().subscribe(planObject => {
      const layerKeys = Object.keys(planObject.stage.layers);
      this.stage = new Konva.Stage({
        container: planObject.name,
        width: width,
        height: height,
        draggable: true,
      });



      (layerKeys || []).forEach(key => {
        const l = planObject.stage.layers[key];
        this.layers[l.name] = new Konva.Layer({ l, id: l.name });
        this.stage.add(this.layers[l.name]);

      });

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
      strokeWidth: 4
    };
    let circle = new Konva.Circle(conf);
    this.layers[eLayers[eLayers.shapesLayer]].add(circle);
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
    debugger;
  }
}
