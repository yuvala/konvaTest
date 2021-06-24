//// <reference path="../Declaretions.ts" />

import { ImageOrientation } from "src/app/viewer/interfaces/ImageDataModels";

class DTOImageUploadData {
    ImageClientId!: string;
    ImageStringBase64!: string
    ImageFormat!: string;
}

class DTOImageUploadResult {

    Result: any;
    SystemErrorCode!: number;
    IsCompleted!: boolean;
    ServerDirectUrl!: string;
    Status!: number;
    StatusString: string;
}

class DcmImage {
    AdditionalData: any;
    ImageID: ImageID;
    DicomXMLData!: any;
    ImageInfo!: ImageInfo;
    BitePerPixel!: number;
    PngImageUrl!: string;
    OriginalImageWidth!: number;
    OriginalImageHeight!: number;
    BaseWLWindow!: number;
    BaseWLLevel!: number;
    WLImageDataUrl!: string;
    ImageServiceDirectUrl!: string;
    HasUploadPermissionsToOriginalFolder!: boolean;
    additionaldata: any;
    SwipData!: string;
    constructor(imageID: ImageID) {
        this.ImageID = imageID;
    }
}

export class ImageInfo {
    width!: number;
    height!: number;
    bitsPerPixel!: number;
    modalitySlope!: number;
    lutDescriptor: any;
    signed!: number;
    windowWidth!: number;
    windowCenter!: number;
    photometricInterpretation!: string;
    rowSpacing!: number;
    columnSpacing!: number;
    spacingType!: number;
    imageType!: number;
    lossyImageCompression!: boolean;
}

export class ImageOrientation {
    IsAP!: boolean;
    IsLeftBodyPart!: boolean;

    Equals(b: ImageOrientation) {

        return typeof (b) != "undefined" && (this.IsAP == b.IsAP) && (this.IsLeftBodyPart == b.IsLeftBodyPart);

    }
    Copy() {
        var instance = new ImageOrientation();
        instance.IsAP = this.IsAP;
        instance.IsLeftBodyPart = this.IsLeftBodyPart;
        return instance;

    }
}
export class DTOAsyncResultBase {
    IsCompleted!: boolean;
    Status!: EDTOStatus;
    ServerDirectUrl!: string;
}
export class DTOBaseCalibrationAsyncResult extends DTOAsyncResultBase {
    Result!: DTOBaseCalibrationResult;
}

export class ImageCalibrationData {
    constructor(public ImageID: ImageID) {
    }
    ImageOrientation!: ImageOrientation;
    EProcedureType!: number;
    AutoCalibrationResult!: IAutoCalibrationResult;
    SavedCalibrationResult!: DTOBaseCalibrationResult;

}

export class DTOBaseCalibrationResult {
    TypeString!: any;
    Scaling!: number;
    Oversized!: number;
}

export interface IAutoCalibrationResult {
    TypeString: any;
    Scaling: number;
    Oversized: number;

}

export interface IManualCalibrationResult {
    Scaling: number;
    Oversized: number;
}

export class DTOOversizeCalibrationResult extends DTOBaseCalibrationResult implements IManualCalibrationResult {
    static Is(obj: any) {
        return obj instanceof DTOOversizeCalibrationResult;
    }
}

export class DTOCircleCalibrationResult extends DTOBaseCalibrationResult implements IManualCalibrationResult {
    LengthValue!: number;
    StartPoint!: PointF;
    EndPoint!: PointF;
    static Is(obj: any) {
        return obj instanceof DTOCircleCalibrationResult;
    }
}

export class DTORulerCalibrationResult extends DTOBaseCalibrationResult implements IManualCalibrationResult {
    LengthValue!: number;
    StartPoint!: PointF;
    EndPoint!: PointF;
    static Is(obj: any) {
        return obj instanceof DTORulerCalibrationResult;
    }
}

export class DTOKingMarkCalibrationResult extends DTOBaseCalibrationResult implements IAutoCalibrationResult {
    IsRefiningResults!: boolean;
    static Is(obj: any) {
        return obj instanceof DTOKingMarkCalibrationResult;
    }
}

export class DTONotFoundCalibrationResult extends DTOBaseCalibrationResult implements IAutoCalibrationResult {
    static Is(obj: any) {
        return obj instanceof DTONotFoundCalibrationResult;
    }
}

export class DTOPrecalibratedImageResult extends DTOBaseCalibrationResult implements IAutoCalibrationResult {
    PrecalibratedData!: DTOCalibrationInfo;
    static Is(obj: any) {
        return obj instanceof DTOPrecalibratedImageResult;
    }
}

export class DTOCalibrationInfo {
    CalibratedMMPerPixel!: number;
    View!: EDTOAnatomicalView;
    Anatomy!: EDTOAnatomicalSide;
    Procedure!: EDTOProcedure;
    CalibrationDevice!: EDTOCalibrationDevice;
}


export enum EDTOCalibrationDevice {
    None = 0,
    CalibrationBall = 1,
    KingMark = 2,
    Manual = 3,
    PrecalibratedData = 4
}

class DTOBallCalibrationResult extends DTOBaseCalibrationResult implements IAutoCalibrationResult {
    CenterImageCoords: PointF;
    Radius: number;
    BallDiameterInMM: number;

    static Is(obj: any) {
        return obj instanceof DTOBallCalibrationResult;
    }

}

class EDTOStatus {
    static Success = 0;
    static InProcess = 1;
    static Failed = 2;
}

class DTOImageSaveAsyncResult extends DTOAsyncResultBase {

    Result: DTOImageSaveResult;
}

class DTOImageSaveResult {
    HasTask: boolean;
    TaskId: string;
    RecipientUploadStatus: DTORecipientUploadStatus[];

}

class DTORecipientUploadStatus {
    RecipientName: string;

    UserSystemID: string;

    Status: EDTOStatus;

}

class DTOSaveImageData {
    ImageId!: string;
    Filename!: string;
    ImageStringBase64: string
    CalibrationInfo: DTOCalibrationInfo;
    SWIPData: string;
}

class DTOCasePlanningInfo {
    ProcedureName: string;
    Comments: string;
    SurgeryInfo: DTOSurgeryInfo;
    CaseName: string; //patient name and date
    CreatedBy: string; // as overlayes
    PlanningDate: string; //simple string date time
    PlanningDateUTC: string; //Date.UTC  toUTCString()
}

class DTOImagePlanningInfo {
    MeasurmentToolsInfo: DTOMeasurmentToolInfo[];
    TemplatesInfo: DTOTemplateInfo[];
    Side: EDTOAnatomicalSide;
}

class DTOSaveImageDataWithPlanningInfo extends DTOSaveImageData {
    PlanningInfo: DTOImagePlanningInfo;
}


class DTOSaveImageDataWithPlanningInfoAndOriginalImage extends DTOSaveImageData {
    PlanningInfo: DTOImagePlanningInfo;
    OriginalImageStringBase64: string;
}
//DMF quentry recipient
class DTOSaveToQuentryRecipient {
    RecipientSystemID: string;

    constructor() {
        this.RecipientSystemID = null;
    }

}


class DTOSaveCaseDataWithPlanningInfo extends DTOSaveToQuentryRecipient {
    CasePlanningInfo: DTOCasePlanningInfo;
    SaveImagesDataWithPlanningInfo: DTOSaveImageDataWithPlanningInfo[];
    PatientData: DTOPatientStudySaveData;
}


class DTOPatientStudySaveData {
    PatientId: string; // attention two properies OatientId and PatientID
    PatientLastName: string;
    PatientFirstName: string;
    PatientDOB: number;
    Gender: string;
    ReferingMD: string;
    Accesion: string;
    StudyDescription: string;
}

class DTOSaveCaseDataWithPlanningInfoAndPatientData extends DTOSaveCaseDataWithPlanningInfo {

    PatientData: DTOPatientStudySaveData;
}

class DTOSaveCaseDataWithPlanningInfoAndPatientStudyData extends DTOSaveToQuentryRecipient {
    CasePlanningInfo: DTOCasePlanningInfo;
    SaveImagesDataWithPlanningInfoAndOriginalImage: DTOSaveImageDataWithPlanningInfoAndOriginalImage[];
    PatientData: DTOPatientStudySaveData;
}
class DTOSurgeryInfo {

    SurgeryDateTime: number;
    SurgeryDateTimeUTC: string; //new Date.UTC() toUTCString();
    SurgeryInsitution: string
}

class EDTOAnatomicalSide {
    static NotSpecified = 0;
    static Left = 1;
    static Right = 2;
}

class EDTOAnatomicalView {
    static NotSpecified = 0;
    static AP = 1;
    static LAT = 2;
}

class EDTOProcedure {
    // DMF: hip procedure was 1 now its 0 as at server side
    static NotSpecified = -111;
    static AutoHip = 11;
    static Hip = 0;
    static Knee = 2;
    static UpperLimb = 3;
    static FootAndAnkle = 4;
    static Pediatric = 5;
    static Deformity = 6;
    static Trauma = 7;
    static Spine = 8;
    static Suite3D = 9;
}

class DTOTemplateInfo {
    Manufacturer: string;
    Classification: string; //stem cup etc.
    Title: string;
    PartNo: string;
    Comments: string;
    Quantity: number;
    TemplateValues: KeyValuePair[];
}

class DTOMeasurmentToolInfo {
    ToolName: string;
    ToolValues: KeyValuePair[]
}

class KeyValuePair {
    constructor(key: any, value: any) {
        this.Key = key;
        this.Value = value;
    }
    Key: any;
    Value: any;
}

class DTOAutoHipAsyncResult extends DTOAsyncResultBase {
    Result: DTOAutoHipResult;
}

class DTOAutoKneeAsyncResult extends DTOAsyncResultBase {
    Result: DTOAutoKneeResult;
}


class DTOAutoDetectionBase {
    IsLeftBodyPart: boolean;
    EProcedureType: number;
    IsAP: boolean;
}



class DTOAutoHipResult extends DTOAutoDetectionBase {
    SegmentPointsImageCoords: PointF[];
    LldTool: DTOLldTool;
    CupLocationDetailsRightSide: DTOCupLocationDetails;
    CupLocationDetailsLeftSide: DTOCupLocationDetails;
    StemLocationDetailsRightSide: DTOStemLocationDetails;
    StemLocationDetailsLeftSide: DTOStemLocationDetails;
    AutoHipDataRightSide: DTOAutoHipData;
    AutoHipDataLeftSide: DTOAutoHipData;
    EProcedureType = EProcedureType.AutoHip;
    IsAp = true;
    ResectionLine: PointF[]
}

class DTOAutoHipData {
    MedialShaftLineY2XCoefficients: number[];
    LateralShaftLineY2XCoefficients: number[];
    MidShaftLineY2XRightSideCoefficients: number[];
    AnatomicalLineP1: PointF;
    AnatomicalLineP2: PointF;
    UpperCenterPointFinderMedialPoint: PointF;
    UpperCenterPointFinderLineLateralPoint: PointF;
    LowerCenterPointFinderLineMedialPoint: PointF;
    LowerCenterPointFinderLineLateralPoint: PointF;
}

class DTOAutoKneeResult extends DTOAutoDetectionBase {

}

class DTOAutoKneeAPResult extends DTOAutoKneeResult {
    FemorResectionLineTool: DTOAPResectionLineTool;
    TibiaResectionLineTool: DTOAPResectionLineTool;

    IsAP = true;
    EProcedureType = EProcedureType.AutoKnee;
}


class DTOAPResectionLineTool {
    BoneAxis: DTOBoneAxisDetails;
    Condyle: DTOAPKneeCondyleDetails;
}
class DTOBoneAxisDetails {
    TopLeft: PointF;
    TopRight: PointF;
    BottomLeft: PointF;
    BottomRight: PointF;
}

class DTOAPKneeCondyleDetails {
    TipLeft: PointF;
    TipRight: PointF;
    EdgeLeft: PointF;
    EdgeRight: PointF;
}

class DTOAutoKneeLatResult extends DTOAutoKneeResult {
    FemurData: DTOKneeLATFemurData;
    TibiaData: DTOKneeLATTibiaData;
    EProcedureType = EProcedureType.AutoKnee;
    IsAP = false;
}

class DTOKneeLATFemurData {
    AnteriorLinePnt: PointF;
    PosteriorLineDistanceMM: number;
    AnteriorLineDirection: PointF;
    DistalLinePnt: PointF;
}

class DTOKneeLATTibiaData {
    TibialPlateauCenter: PointF;
    TibialPlateauWidth: number;
    TibialSlopeDirection: PointF;
}
class PointF {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    x: number;
    y: number;

    static Empty = new PointF(0, 0);

}

class RectangleF {
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.Top = y;
        this.Left = x;
        this.Bottom = y + height;
        this.Right = x + width;
    }
    x: number;
    y: number;
    width: number;
    height: number;
    Top: number;
    Left: number;
    Bottom: number;
    Right: number;

    static CreateFromPoints = function (pt1: PointF, pt2: PointF) {
        var x = Math.min(pt1.x, pt2.x);
        var y = Math.min(pt1.y, pt2.y);
        var w = Math.abs(pt1.x - pt2.x);
        var h = Math.abs(pt1.y - pt2.y);
        return new RectangleF(x, y, w, h);
    }

    IntersectsWith = function (rect) {
        if (rect.x >= this.x + this.width || this.x >= rect.x + rect.width || rect.y >= this.y + this.height) {
            return false;
        }
        return this.y < rect.y + rect.height;

    }

    Union = function (r2: RectangleF) {
        var l = Math.min(this.Left, r2.Left);
        var t = Math.min(this.Top, r2.Top);
        var r = Math.max(this.Right, r2.Right);
        var b = Math.max(this.Bottom, r2.Bottom);
        return new RectangleF(l, t, r - l, b - t);
    }

    Intersect = function (r2: RectangleF) {
        var l = Math.max(this.Left, r2.Left);
        var t = Math.max(this.Top, r2.Top);
        var r = Math.min(this.Right, r2.Right);
        var b = Math.min(this.Bottom, r2.Bottom);
        return new RectangleF(l, t, Math.max(r - l, 0), Math.max(b - t, 0));
    }

    Round = function () {
        var l = Math.round(this.Left);
        var t = Math.round(this.Top);
        var r = Math.round(this.Right);
        var b = Math.round(this.Bottom);
        return new RectangleF(l, t, r - l, b - t);
    }

    Inflate = function (size: number) {
        var l = this.Left - size;
        var t = this.Top - size;
        var r = this.Right + size;
        var b = this.Bottom + size;
        return new RectangleF(l, t, r - l, b - t);
    }
}



class LinePoints {
    StartPoint: PointF;
    EndPoint: PointF;
    CenterPoint: PointF;
}


class DTOCupLocationDetails {
    Location: PointF;
    Angle: number;
    Radius: number;
}

class DTOStemLocationDetails {
    Location: PointF;
    Angle: number;
    Width: number;
}

class DTOLldTool {
    LeftIschialTuberosity: PointF;
    RightIschialTuberosity: PointF;
    LeftLesserTrochanter: PointF;
    RightLesserTrochanter: PointF;
    LeftTearDrop: PointF;
    RightTearDrop: PointF;
}


//CommunicationDTO

class DTOImageDownloadAsyncResult extends DTOAsyncResultBase {

    Result: DTOImageDownloadResult;
}

class DTOImageDownloadResult {
    DownloadedImages: DTODicomImageData[];
    TotalImagesToDownload: number;
    NumberOfDownloadedImages: number;
}

class DTODicomImageData {
    DicomContent: any;
    Additionaldata: any;
    ImageKey: string;
    StudyUID: string;
    SeriesUID: string;
    InstanceUID: string;
    InstanceIdentifier: string;
    ImageWidth: number;
    ImageHeight: number;
    BaseWLWindow: number;
    BaseWLLevel: number;
}

//2.
class DTOThumbnailImageDataAsyncResult extends DTOAsyncResultBase {

    Result: DTOThumbnailImageData[];
}

class DTOThumbnailDownloadResultAsyncResult extends DTOAsyncResultBase {

    Result: DTOThumbnailDownloadResult;
}

class DTOThumbnailDownloadResult {

    ThumbnailImages: DTOThumbnailImageData[];


}

class DTOThumbnailImageData {
    ImageStringBase64: string;
    StudyUID: string;
    SeriesUID: string;
    InstanceUID: string;
    InstanceVoyantID: string;

    static ConvertToDTOThumbnails(thumbnails: DTOThumbnailImageData[]) {
        var result = new Array<DTOThumbnail>();

        thumbnails.forEach(t => {
            var tumb: DTOThumbnail = DTOThumbnailImageData.ConvertToDTOThumbnail(t);
            result.push(tumb);
        });
        return result;
    }

    static ConvertToDTOThumbnail(thumbnail: DTOThumbnailImageData) {

        var tumb: DTOThumbnail = new DTOThumbnail();
        //      var base64Image = btoa(String.fromCharCode.apply(null, thumbnail.Image));
        var base64Image = thumbnail.ImageStringBase64;
        tumb.Data = "data:image/png;base64," + base64Image;
        if (thumbnail.InstanceVoyantID != null) {
            tumb.ItemID = thumbnail.InstanceVoyantID;
        }
        else if (thumbnail.InstanceUID != null) {
            tumb.ItemID = thumbnail.InstanceUID;
        }
        else {
            tumb.ItemID = thumbnail.SeriesUID;
        }

        return tumb;
    }
}
