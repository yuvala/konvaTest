import { Injectable } from '@angular/core';
import { IPlan } from './viewer/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ComplexService {
  plan: IPlan = {
    planID:'123',
    currentCard:0,
    planCards:[
      image:'darth-vader.jpg'
    ]
  };

  Init() {
    let width = window.innerWidth * 0.9;
    let height = window.innerHeight;

  }

  constructor() { }
}
