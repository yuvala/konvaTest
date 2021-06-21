import { Injectable } from '@angular/core';
import Konva from 'konva';
import { ShapeService } from './shape.service';

@Injectable({
  providedIn: 'root'
})
export class ComplexService {

  colors = ['red', 'orange', 'yellow'];
  constructor(private shapeService: ShapeService) { }

  complex(type: any) {
    const group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
      visible: true,
      name: 'complexGroup'
    });

    this.colors.forEach((k, i) => {
      const obj = this.shapeService.rectangle({ type: 'rectangle', x: i * 30, y: i * 30 });
      obj.fill(k);
      group.add(obj);
    });
    group.addName('moshe');
    
    return group;
  }
}
