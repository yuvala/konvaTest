//// <reference path="../Declaretions.ts" />

class BaseSWIPData {
    shapeType: string;
    shapeName: string;
    isVisible: boolean;
}

class RulerSWIPData extends BaseSWIPData {
    p1: PointF;
    p2: PointF;
    label: BasicLabel;
}

class CircleSWIPData extends BaseSWIPData {
    radius: number;
    center: PointF;
    label: BasicLabel;
}

class AngleToolSWIPData extends BaseSWIPData {
    p1: PointF;
    p2: PointF;
    pVertex: PointF;
    label: BasicLabel;
}

class TextToolSWIPData extends BaseSWIPData {
    text: string;
    fontSize: number;
    lineLabelAnchor: PointF;
    position: PointF;
}

class InterLineSWIPData extends BaseSWIPData {
    Line1P1: PointF;
    Line1P2: PointF;
    Line2P1: PointF;
    Line2P2: PointF;
    label: BasicLabel;

}

class LLDSWIPData extends BaseSWIPData {
    pIschial1: PointF;
    pIschial2: PointF;
    pLesser1: PointF;
    pLesser2: PointF;
    lesserlineLabel: BasicLabel;
    ischial1PerpendicularlineLabel: BasicLabel;
    ischial2PerpendicularlineLabel: BasicLabel;
}

class BasicLabel {
    name: string;
    text: string;
    position: PointF;
}

class ImplantSWIPData extends BaseSWIPData{
    templateShapeType: string;
    implantFamilyId: string;
    implantItemId: string;
    implantStartPointImageCoords: PointF;
    implantItemRotationAngle: number;
    isTemplateMasterMovement: boolean;
    selectedAttachmentPoint: DTOAttachmentPoint;
    labels: BasicLabel[];
}

class SegmentSWIPData extends BaseSWIPData {
    blackSegmentPoints: PointF[];
    segmentRotationAngle: number;
    segmentRotationPoint: PointF;
    segmentFirstPointLocation: PointF;
}

class SWIPImplantIds {
    implantFamilyId: string;
    implantItemId: string;
    shapeName: string;
}

class ConnectionTransformData {
    transformMatrix: any;
    templatesAttached: boolean;
    segmentRotationAngle: number;
    selectedAttachmentPointCoords: PointF;
    sourcePoint: PointF;
    destPoint: PointF;
}

class SWIPConnectionDataBase extends BaseSWIPData {
    templatesAttached: boolean;
    rotationAngle: number;
}

class SWIPConnectionDataHip extends SWIPConnectionDataBase {
    rotationPoint: PointF;
}

class SWIPConnectionDataKnee extends SWIPConnectionDataBase {
    sourcePoint: PointF;
    destPoint: PointF;
}

class CorSWIPData extends BaseSWIPData {
    isHealthySideLeft: boolean;
    corToolLLD: CorToolLLDSWIPData;
    corCenterPointFinderLineRight: CorCenterPointFinder;
    corCenterPointFinderLineLeft: CorCenterPointFinder;
    centerOfRotationPrimary: CorCenterOfRotation;
    centerOfRotationSecondary: CorCenterOfRotation;
}

class CorToolLLDSWIPData {
    tearDrop1: PointF;
    tearDrop2: PointF;
    pLesser1: PointF;
    pLesser2: PointF;
    tearDroplineLabel: BasicLabel;
    tearDrop1PerpendicularlineLabel: BasicLabel;
    tearDrop2PerpendicularlineLabel: BasicLabel;
}

class CorCenterPointFinder {
    femurAxisLineP1: PointF;
    femurAxisLineP2: PointF;
    lowerCenterPointFinderLineP1: PointF;
    lowerCenterPointFinderLineP2: PointF;
    upperCenterPointFinderLineP1: PointF;
    upperCenterPointFinderLineP2: PointF;
    femurOffsetLineP1: PointF;
    femurOffsetLineP2: PointF;
    femoralOffsetLabel: BasicLabel;
}

class CorCenterOfRotation {
    circleP1: PointF;
    circleP2: PointF;    
    label: BasicLabel;
}

class KneeAPCuttingFemurSWIPData extends BaseSWIPData {
    baseAPKneeCutting: BaseAPKneeCutting;
    angleLineLabel: BasicLabel;
    femoralAxisAngle: number;
}

class KneeAPCuttingTibialSWIPData extends BaseSWIPData {
    baseAPKneeCutting: BaseAPKneeCutting;
}

class BaseAPKneeCutting {
    tipRightPoint: PointF;
    tipLeftPoint: PointF;    
    edgeRightPont: PointF;
    edgeLeftPoint: PointF;
    boneAxisTopLeft: PointF;
    boneAxisTopRight: PointF;
    boneAxisBottomRigh: PointF;
    boneAxisBottomLeft: PointF;
    tipRightProjectionLineLabel: BasicLabel;
    tipLeftProjectionLineLabel: BasicLabel;
}

class TibialSlopeToolSWIPData extends BaseSWIPData {
    angleLineP1: PointF;
    angleLineP2: PointF;
    bottomLineP1: PointF;
    bottomLineP2: PointF;
    upperLineP1: PointF;
    upperLineP2: PointF;
    label: BasicLabel;
}