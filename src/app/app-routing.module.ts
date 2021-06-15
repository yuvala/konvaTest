import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestAComponent } from './test-a/test-a.component';
import { TestBComponent } from './test-b/test-b.component';
import { TestCComponent } from './test-c/test-c.component';
import { TestDComponent } from './test-d/test-d.component';
import { TestEComponent } from './test-e/test-e.component';

const routes: Routes = [
  { path: 'test-a', component: TestAComponent },
  { path: 'test-b', component: TestBComponent },
  { path: 'test-c', component: TestCComponent },
  { path: 'test-d', component: TestDComponent },
  { path: 'test-e', component: TestEComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
