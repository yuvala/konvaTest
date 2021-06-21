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
        let ectObj = new Konva.Rect({
            x: 20,
            y: 20,
            width: 100,
            height: 50,
            fill: 'green',
            draggable: true,
            name: 'rect'
        });
        this.setEvents(ectObj);
        return ectObj;
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
            shapeObj.fill('blue');
        });

        shapeObj.on('mouseout touchend', (e) => {
            shapeObj.fill('red');
        });

        // shapeObj.on('mousedown touchstart', (e) => {
        //     // do nothing if we mousedown on any shape
        //     //    debugger;
        //     // if (e.target !== stage) {
        //     //   return;
        //     // }
        //     // x1 = stage.getPointerPosition().x;
        //     // y1 = stage.getPointerPosition().y;
        //     // x2 = stage.getPointerPosition().x;
        //     // y2 = stage.getPointerPosition().y;

        //     // selectionRectangle.visible(true);
        //     // selectionRectangle.width(0);
        //     // selectionRectangle.height(0);
        // });

    }
}