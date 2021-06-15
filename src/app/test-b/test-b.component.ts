import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { Manager as Hammer, Pinch } from "hammerjs";
import { KonvaComponent } from "ng2-konva";
import {
  Observable,
  BehaviorSubject,
  of,
  fromEvent,
  combineLatest
} from "rxjs";
import { map, startWith, pairwise, scan, tap } from "rxjs/operators";

@Component({
  selector: 'app-test-b',
  templateUrl: './test-b.component.html',
  styleUrls: ['./test-b.component.scss']
})
export class TestBComponent implements AfterViewInit {
  @ViewChild("stage") stage: KonvaComponent;
  @ViewChild("circle1") circle1: KonvaComponent;
  @ViewChild("container") container: ElementRef;

  public configCircle1: Observable<any> = of({
    x: 200,
    y: 100,
    radius: 70,
    fill: "red",
    stroke: "black",
    strokeWidth: 4,
    draggable: true
  });
  public configCircle2: Observable<any> = new BehaviorSubject({
    x: 200,
    y: 300,
    radius: 70,
    fill: "green",
    stroke: "black",
    strokeWidth: 4,
    draggable: true
  });

  private scale: Observable<any> = fromEvent<WheelEvent>(window, "wheel").pipe(
    map((e) => e.deltaY),
    scan((oldScale, deltaY) => {
      console.log("scale", oldScale);
      const scaleBy = 1.5;
      return deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    }, 1)
  );

  private position = this.scale.pipe(
    pairwise(),
    scan(
      (oldPosition, [oldScale, newScale]) => {
        console.log("test", oldPosition);
        const stage = this.stage.getStage();

        const absoluteMouse = stage.getPointerPosition();
        if (!absoluteMouse) {
          return oldPosition;
        }
        const relativeMouse = {
          x: absoluteMouse.x / oldScale - stage.x() / oldScale,
          y: absoluteMouse.y / oldScale - stage.y() / oldScale
        };
        return {
          x: -(relativeMouse.x - absoluteMouse.x / newScale) * newScale,
          y: -(relativeMouse.y - absoluteMouse.y / newScale) * newScale
        };
      },
      { x: 0, y: 0 }
    )
  );

  private size = fromEvent(window, "resize").pipe(
    map(() => {
      const container = this.container.nativeElement;
      return {
        height: container.offsetHeight,
        width: container.offsetWidth
      };
    })
  );

  public configStage = combineLatest(
    this.scale.pipe(startWith(1)),
    this.position.pipe(startWith({ x: 0, y: 0 })),
    this.size
  ).pipe(
    map(([scale, position, size]) => ({
      draggable: true,
      scaleX: scale,
      scaleY: scale,
      ...position,
      ...size
    })),
    startWith({
      height: 1000,
      width: 1000
    })
  );

  ngAfterViewInit() {
    // Resize Canvas as soon as we can get container width and height
    // Also IE Comp
    const event = document.createEvent("UIEvents");
    event.initEvent("resize", false, false);
    window.dispatchEvent(event);

    const test = new Hammer(this.container.nativeElement, {
      recognizers: [[Pinch]]
    });

    test.on("pinch", (e) => alert(JSON.stringify(e)));
  }
}
