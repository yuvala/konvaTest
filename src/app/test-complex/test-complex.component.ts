import { Component, OnInit } from '@angular/core';
import { ComplexService } from './complex.service';
 
 
import { Viewer } from './viewer/Viewer';


@Component({
  selector: 'app-test-complex',
  templateUrl: './test-complex.component.html',
  styleUrls: ['./test-complex.component.scss']
})
export class TestComplexComponent implements OnInit {
  stage: any;
  layers: any;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;

  constructor(
  //  private Viewer: Viewer,
    private Service: ComplexService
  ) { }

  ngOnInit(): void {
    let width = window.innerWidth * 0.9;
    let height = window.innerHeight;
    this.Service.Init();
   // this.Viewer.Init();
    // this.stage = new Konva.Stage({
    //   container: 'container',
    //   width: width,
    //   height: height,
    //   draggable: false,
    // });
    // this.layers = new Konva.Layer();
    this.initStageEvents();
  }

  private initStageEvents(): void {
    this.stage.on('mousedown touchstart', (e: any) => {
      this.x1 = this.stage.getPointerPosition()?.x as number;
      this.y1 = this.stage.getPointerPosition()?.y as number;
      this.x2 = this.stage.getPointerPosition()?.x as number;
      this.y2 = this.stage.getPointerPosition()?.y as number;
    });

    this.stage.on('mousemove touchmove', () => {
      // no nothing if we didn't start selection
      this.x2 = this.stage.getPointerPosition()?.x as number;
      this.y2 = this.stage.getPointerPosition()?.y as number;
    });

    // clicks should select/deselect shapes
    this.stage.on('click tap', (e: any) => {
      console.log('click');

    });

    this.stage.on('mouseup touchend', (e: any) => {

    });
  }




}
