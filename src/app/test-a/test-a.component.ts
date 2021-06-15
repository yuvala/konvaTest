import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-test-a',
  templateUrl: './test-a.component.html',
  styleUrls: ['./test-a.component.scss']
})
export class TestAComponent implements OnInit, AfterViewInit {

  @Input() shouldDisplay: string;

  @ViewChild('hello', { static: false }) hello: ElementRef;

  ngOnInit(): void {
    // In ngOnInit this.hello is undefined because the dynamic content has not been resolved yet.
    console.log('ngOnInit', this.hello, this.shouldDisplay);
  }

  ngAfterViewInit(): void {
    // In ngAfterViewInit the dynamic content has been resolved, so this.hello return the matching ElementRef.
    console.log('ngAfterViewInit', this.hello, this.shouldDisplay);
  }

}
