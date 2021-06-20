import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPlan } from './interfaces';
import { PlanObject } from './plan-object';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {

  private plan: IPlan | undefined;
  constructor() { }

  getPlan(): Observable<any> {
    console.log('getPlan');
    
    let o$ = new Observable((obsever) => {
      this.plan = new PlanObject();
      obsever.next(this.plan);
    });

    return o$;
  }
}

