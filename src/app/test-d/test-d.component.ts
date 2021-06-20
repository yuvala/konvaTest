import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { of, Observable } from 'rxjs';
import { KonvaComponent } from 'ng2-konva';
 
declare const Konva: any;
@Component({
  selector: 'app-test-d',
  templateUrl: './test-d.component.html',
  styleUrls: ['./test-d.component.scss']
})
 
export class TestDComponent implements AfterViewInit {
  @ViewChild('stage') stage!: KonvaComponent;
  @ViewChild('layer') layer!: KonvaComponent;
  @ViewChild('hexagon') hexagon!: KonvaComponent;
 
  public configStage: Observable<any> = of({
    width: 400,
    height: 200
  });
  public configItem: Observable<any> = of({
    x: 200,
    y: 100,
    sides: 6,
    radius: 20,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 4
  });
 
  ngAfterViewInit() :void {
    const ng = this;
    const amplitude = 100;
    const period = 5000;
    // in ms
    const centerX = this.stage.getStage().getWidth() / 2;
 
    const anim = new Konva.Animation(function(frame: any) {
      ng.hexagon
        .getStage()
        .setX(
          amplitude * Math.sin((frame.time * 2 * Math.PI) / period) + centerX
        );
    }, ng.layer.getStage());
 
    anim.start();
  }
  public handleMouseOut(event:any) {
    console.log('handleMouseOut:');
    
   // this.writeMessage('Mouseout triangle');
  }
 
  public handleMouseMove(event:any) {
    console.log('handleMouseMove:');
    // const mousePos = this.stage.getStage().getPointerPosition();
    // const x = mousePos.x - 190;
    // const y = mousePos.y - 40;
  //  this.writeMessage('x: ' + x + ', y: ' + y);
  }
}
