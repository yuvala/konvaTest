export interface IPlan {
    name: string,
    stage: IStage

}
export interface IStage {
    name: string,
    layers: ILayers
}


export interface ILayers {
    [k: string]: ILayer,
}
export interface ILayer {
    name: string,
    isTransformer?: boolean
}

export enum eLayers {
    imgLayer,
    shapesLayer,
    segmentAndTemplateLayer,
    wlLayer  //( window level)
}

export enum eShapes {
    circle = 'circle',
    line = 'line',
    rectangle = 'rectangle',
    radialGradPentagon = 'radialGradPentagon',

}