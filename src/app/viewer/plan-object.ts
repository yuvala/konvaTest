import { eLayers, IPlan, IStage } from "./interfaces";

export class PlanObject implements IPlan {
    name: string;
    stage: IStage;
    constructor() {
        this.name = 'container';
        this.stage = {
            name: 'stageName',
            layers: {
                [eLayers[eLayers.imgLayer]]: { name: 'imgLayer', image: 'darth-vader.jpg' },
                [eLayers[eLayers.shapesLayer]]: { name: 'shapesLayer', isTransformer: true },
                [eLayers[eLayers.segmentAndTemplateLayer]]: { name: 'segmentAndTemplateLayer' },
                [eLayers[eLayers.wlLayer]]: { name: 'wlLayer' }
            },

        }
    }

}