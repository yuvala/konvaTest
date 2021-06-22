import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { Rect } from 'konva/lib/shapes/Rect';
import { iPos } from '../interfaces';
@Injectable({
    providedIn: 'root'
})
export class ShapeService {
    constructor() { }

    // public getShape(shapeType: any): Function {
    //     return this[shapeType.type as string]();
    // }
    color = ['#9b0404', '#df4b26'];


    circle(type: any) {
        let circleObj = new Konva.Circle({
            x: type.x ? type.x : 70,
            y: type.y ? type.y : 70,
            radius: 70,
            opacity:0.8,
            fill: this.color[0],
            draggable: type.draggable ? type.draggable : false,
            name: 'simpleShape'
        });
        this.setEvents(circleObj);
        return circleObj;
    }

    line(pos: any, mode: string = 'brush') {
        let lineObjsect = new Konva.Line({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation:
                mode === 'brush' ? 'source-over' : 'destination-out',
            points: [pos.x, pos.y],
            draggable: mode == 'brush'
        });
        return lineObjsect;
    }
    rectangle(type: any) {
        let rectObj = new Konva.Rect({
            x: type.x ? type.x : 20,
            y: type.y ? type.y : 20,
            width: 100,
            height: 50,
            fill: this.color[0],
            opacity:0.8,
            draggable: type.draggable ? type.draggable : false,
            name: 'simpleShape'
        });
        this.setEvents(rectObj);
        return rectObj;
    }


    pentagon(type: any) {
        let obj = new Konva.RegularPolygon({
            x: type.x ? type.x : 70,
            y: type.y ? type.y : 70,
            sides: 5,
            radius: 70,
            opacity:0.8,
            fill: this.color[0],
            draggable: type.draggable ? type.draggable : false,
            name: 'simpleShape'
        });
        this.setEvents(obj);
        return obj;
    }

    private setEvents(shapeObj: Shape): void {
        shapeObj.on('mouseover touchstart', (e) => {
            shapeObj.fill(this.color[1]);
        });

        shapeObj.on('mouseout touchend', (e) => {
            shapeObj.fill(this.color[0]);
        });
    }
}