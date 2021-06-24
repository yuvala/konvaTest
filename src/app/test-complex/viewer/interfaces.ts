export interface IPlan {
    planID: string;
    planCards: ICard[];
    currentCard: number | undefined;
}

export interface ICard {
    image: string;
}

export class Vec2 {
    x: number;
    y: number;
    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }
}