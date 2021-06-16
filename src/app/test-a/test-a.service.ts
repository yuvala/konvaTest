import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestAService {
  plan: IPlan = {
    name:'yuval'
  };
  
  constructor() { 
    
  }
}





export interface IPlan{


}