import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KonvaModule } from 'ng2-konva';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestAComponent } from './test-a/test-a.component';
import { TestBComponent } from './test-b/test-b.component';
import { TestCComponent } from './test-c/test-c.component';
import { TestDComponent } from './test-d/test-d.component';
import { TestEComponent } from './test-e/test-e.component';

@NgModule({
  declarations: [
    AppComponent,
    TestAComponent,
    TestBComponent,
    TestCComponent,
    TestDComponent,
    TestEComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KonvaModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
