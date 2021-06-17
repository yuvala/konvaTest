import { eLayers, IPlan, IStage } from "./interfaces";

export class PlanObject implements IPlan {
    name: string;
    stage: IStage;
    constructor() {
        this.name = 'container';
        this.stage = {
            name: 'aba',
            layers: {
                [eLayers[eLayers.imgLayer]]: { name: 'imgLayer' },
                [eLayers[eLayers.shapesLayer]]: { name: 'shapesLayer', isTransformer: true },
                [eLayers[eLayers.segmentAndTemplateLayer]]: { name: 'segmentAndTemplateLayer' },
                [eLayers[eLayers.wlLayer]]: { name: 'wlLayer' }
            },

        }
    }

}