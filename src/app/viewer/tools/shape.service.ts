import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { Rect } from 'konva/lib/shapes/Rect';
@Injectable({
    providedIn: 'root'
})
export class ShapeService {
    constructor() { }

    // public getShape(shapeType: any): Function {
    //     return this[shapeType.type as string]();
    // }
    color = ['#9b0404', '#df4b26'];
    circle() {
        return new Konva.Circle({
            x: 100,
            y: 100,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });
    }

    line(pos: any, mode: string = 'brush') {
        return new Konva.Line({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation:
                mode === 'brush' ? 'source-over' : 'destination-out',
            points: [pos.x, pos.y],
            draggable: mode == 'brush'
        });
    }
    rectangle(type: any) {
        let rectObj = new Konva.Rect({
            x: type.x ? type.x : 20,
            y: type.y ? type.y : 20,
            width: 100,
            height: 50,
            fill: this.color[0],
            draggable: true,
            name: 'rect'
        });
        this.setEvents(rectObj);
        return rectObj;
    }


    radialGradPentagon(type: any) {
        let obj = new Konva.RegularPolygon({
            x: 30,
            y: 30,
            sides: 5,
            radius: 70,
            fillRadialGradientStartPoint: { x: 0, y: 0 },
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: { x: 0, y: 0 },
            fillRadialGradientEndRadius: 70,
            fillRadialGradientColorStops: [0, 'red', 0.5, 'yellow', 1, 'blue'],
            //    stroke: 'black',
            //    strokeWidth: 4,
            draggable: true,
            name: 'rect'
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