//// <reference path="../Declaretions.ts" />

import { PointF } from "./ImageDataModels";

export class EProcedureType {
    static None = -111;
    static Hip = 0;
    static Knee = 2;
    static AutoHip = 11;
    static AutoKnee = 2;
    //DMF new procedure 
    static UpperLimb = 3;
    static FootAndAnkle = 4;
    //TODO: add the rest of procedures
    //dmf end

    static AutoHipName = 'AutoHip';
    static AutoKneeName = 'AutoKnee';
    //DMF new procedure 
    static UpperLimbName = 'UpperLimb';
    static FootAndAnkleName = 'FootAndAnkle';
   //dmf end

    static GetName(type: number)
    {
        if (EProcedureType.AutoHip == type)
        {
            return EProcedureType.AutoHipName;
        }
        if (EProcedureType.AutoKnee == type)
        {
            return EProcedureType.AutoKneeName;
        }
   //DMF new procedure 
        if (EProcedureType.UpperLimb == type) {
            return EProcedureType.UpperLimbName;
        }
        if (EProcedureType.FootAndAnkle == type) {
            return EProcedureType.FootAndAnkleName;
        }
   //dmf end
        return null;
    }
}

export class Anatomy {
    static Left = "Left";
    static Right = "Right";
    static None = "None"; 
};

export class DTOImplantSearchResults {
    ResultsAtProcedure: DTOTemplatesGeneralInfo[];
    OtherProceduresResults: DTOTemplatesGeneralInfo[]
}

export class ImplantIDCounter {
    ImplantID: number;
    Counter: number;
    constructor(implantID: number, counter: number) {
        this.ImplantID = implantID;
        this.Counter = counter;
   
    }
}

export class DTOTemplatesGeneralInfo {
    ID: string;
    Name: string;
    Manufacturer: string;
    Classification: string;
    AnatomicalRegion: string;
}

export class DTOImplantFamily {
    FamilyId: string;
    FamilyName: string;
    Properties: DTOImplantProperty[];
    ImplantItemsMetaData: DTOImplantItemMetaData[];
    ClassificationName: string;
    ManufacturerName: string;
    HasAttachmentPoints: any;
    static Cup = "Cups";
    static Stem = "Stems";
    static Head = "Heads";
    static Femoral = "Femoral";
    static Tibial = "Tibial";
    //dmf add procedures
    //ankle
    static Talar = "Talar";
    //shoulder and elbow
    static Glenoid = "Glenoid";
    static Humeral = "Humeral";
    static Ulna = "Ulna";
    static Radial = "Radial";
    //other upper limb
    static Carpal = "Carpal";
    static Basis = "Basis";
    static Caput = "Caput";


    //dmf end
    
}

export class DTOImplantItemMetaData {
    ImplantId: number;
    Description: DTOImplantDescription;
    AttachmentPointsName: string[];
}

export class DTOImplantDescription {
    PartNumber: string;
    Comments: string;
    ManufacturerRevision: string;
    
}

export class DTOImplantProperty {
    PropertyName: string;
    PropertyValues: DTOPropertyValueAndImplantIdPair[];
    IsPropertyVisible: boolean;
    HasCustomSortOrder: boolean;
}

export class DTOPropertyValueAndImplantIdPair {
    ImplantId: number;
    PropertyValue: string;
    CustomSortOrder: number;
}


export class DTOImplantItem {
    ImplantId: number;
    ImplantImageMMPerPixel: number;
    //ImplantImage: Uint8Array;
    ImplantImageUrl:string;
    ImplantImageBase64: string;
    RotAxisImplantImageCoords: PointF;
    StartPointImplantImageCoords: PointF;
    AttachmentPoints: DTOAttachmentPoint[];
	SpecialHiddenPoints: DTOAttachmentPoint[];
	SpecialHiddenImplantProperties: any[];
    IsAP: boolean;
}

export class DTOAttachmentPoint {
    AttachmentPointName: string;
    LocationImplantImageCoords: PointF;
}
