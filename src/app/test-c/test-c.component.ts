
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KonvaComponent } from 'ng2-konva';

@Component({
  selector: 'app-test-c',
  templateUrl: './test-c.component.html',
  styleUrls: ['./test-c.component.scss']
})
export class TestCComponent implements OnInit {
  @ViewChild('stage') stage!: KonvaComponent;
  @ViewChild('layer') layer!: KonvaComponent;
  @ViewChild('text') text!: KonvaComponent;

  public configStage: Observable<any> = of({
    width: 300,
    height: 200
  });
  public configItem: Observable<any> = of({
    x: 80,
    y: 120,
    sides: 3,
    radius: 80,
    fill: '#00D2FF',
    stroke: 'black',
    strokeWidth: 4
  });
  public configText: Observable<any> = of({
    x: 10,
    y: 10,
    fontFamily: 'Calibri',
    fontSize: 24,
    text: '',
    fill: 'black'
  });

  public writeMessage(message: string) {
    this.text.getStage().setText(message);
    this.layer.getStage().draw();
  }

  public handleMouseOut(event:any) {
    this.writeMessage('Mouseout triangle');
  }

  public handleMouseMove(event:any) {
    const mousePos = this.stage.getStage().getPointerPosition();
    const x = mousePos.x - 190;
    const y = mousePos.y - 40;
    this.writeMessage('x: ' + x + ', y: ' + y);
  }

  ngOnInit() { }
}