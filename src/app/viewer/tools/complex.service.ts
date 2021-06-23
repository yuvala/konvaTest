import { Injectable } from '@angular/core';
import Konva from 'konva';
import { ShapeService } from './shape.service';

@Injectable({
  providedIn: 'root'
})
export class ComplexService {
  strokeColor = 'red';
  colors = ['red', 'orange', 'yellow'];
  scale =5;// viewer.stage.getScale().x;
  scaledLStroke = 5 / this.scale;
  constructor(private shapeService: ShapeService) { }

  complex(type: any) {
    const group = new Konva.Group({
      x: 100,
      y: 100,
      // draggable: true,
      // visible: true,
      name: 'complexGroup'
    });
    var connectingLine;
    var connectingCircle;

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

    this.colors.forEach((k, i) => {
      const obj = this.shapeService.rectangle({
        type: 'rectangle',
        x: i * 30,
        y: i * 30,
        draggable: false
      });
      obj.fill(k);
      group.add(obj);
    });
    group.addName('moshe');
    group.draggable(true);
    group.cache();

    return group;
  }
}
