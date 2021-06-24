class DTOResultBase {
    SystemErrorCode: EDTOStatus;
}
class ESystemErrorCode {
    static None = 0;
    static SessionExpired = 1;
    static VirusFoundInFile = 2;
    static UnauthorisedAccess = 3;
}

class EDTOPatientFolderView {
    static NotSpecified = 0;
    static RecentFoldersView = 1;
    static UsersFoldersView = 2;
    static CareTeamFoldersView = 3;
}

class DTOQueryParams {
    Accession: string;
    FolderID: string;
    PatientName: string;
    PatientID: string;
    StudyDescription: string;
    Modalities: string[];
    PatientFolderView: EDTOPatientFolderView;
    ResultHirerchyLevel: DTOResultRetrieveLevel;
}

class DTOResultRetrieveLevel {
    static caseLevel = 0;
    static caseItemLevel = 1;
    static patientLevel = 100;
    static studyLevel = 101;
    static seriesLevel = 102;
    static imageLevel = 103;
}

class DTOPatientFoldersResult extends DTOResultBase {
    Result: DTOPatientFolder[];
}

class DTOSeriessesResult extends DTOResultBase {
    Result: DTOSeries[];
}

class DTOPACSStudyQueryResult {
    PacsName: string;
    Studies: DTOStudy[];
}

class DTOPACSStudiesResult extends DTOResultBase {
    Result: DTOPACSStudyQueryResult[];
}

class DTOThumbnailsResult extends DTOResultBase {
    Result: DTOThumbnailImageData[];
}

class DTOSinglePACSStudiesResult extends DTOResultBase {
//open patient from PDM
    Result: DTOStudy[];
}

class EDTOError {
    static None = 0;
    static NotSpecified  = 1;
    static UnsupportedFileFormat  = 2;
    static UnsupportedModality  = 3;

}
class DTOSinglePACSStudiesResultExt extends DTOSinglePACSStudiesResult {
    ErrorCode: EDTOError;
}


class DTOPatientFolder {
    FolderID: number;
    Title: string;
    Owner: string;
    OwnerSystemId: string;
    NumberOfStudies: number;
    ModificationDate: Date;
    UploadInProcess: boolean;
    HasUploadPermissions: boolean;
    IsMultiplePatientNames: boolean;
    PatientSelectedFullName: string;
    Studies: DTOStudy[];
}

class DTOStudy {
    StudyUID: string;
    StudyDate: Date;
    Description: string;
    ReferingMD: string;
    Institution: string;
    Accession: string;
    AddedBy: string;
    NumOfSeries: number;
    Patient: DTOPatient;
    Modality: string;
    Series: DTOSeries[];
}

class DTOPatient {

    PatientFullName: string;
    PatientID: string;
    Gender: string;
    PatientDOB: Date;

}

class DTOSeries {

    SeriesUID: string;
    NumberOfImages: number;
    SeriesDate: Date;
    Modality;
    SeriesDescription;
    SenderInstitution;
    AddedBy;
}


class DTOThumbnail {

    ItemID: string;
    Data: string;
}

class ImageID {
    SiteName: string;
    ImageKey: string;
    PatientID: string;
    StudyUID: string;
    SeriesUID: string;
    InstanceUID: string;
    AdditionalData: any;
    TypeString: string;
    constructor(siteName: string, patientID: string, studyUID: string, seriesUID: string, instanceUID?: string, additionalData?: any, TypeString?: string) {
        this.SiteName = siteName;
        this.PatientID = patientID;
        this.StudyUID = studyUID;
        this.SeriesUID = seriesUID;
        this.InstanceUID = instanceUID;
        this.AdditionalData = additionalData
        this.TypeString = TypeString;
    }
    Equals(b: ImageID) {

        return typeof (b) != "undefined" && (this.InstanceUID == undefined || this.InstanceUID == b.InstanceUID)
            && (this.SeriesUID == undefined || this.SeriesUID == b.SeriesUID) &&
            this.StudyUID == b.StudyUID && this.SiteName == b.SiteName;
    
    }
    static Equals(a: ImageID, b: ImageID) {
        return typeof (a) != "undefined" && a.Equals(b)
    }
    ToJson() {
        throw "not implemented";
    }

}

class PacsImageID extends ImageID {
    PacsName: string;
    static Is(obj: any) {
        return obj instanceof PacsImageID;
    }
    ToJson() {
        var instanceUID = this.InstanceUID == null ? '' : this.InstanceUID;
        return { pacsName: this.PacsName, studyUID: this.StudyUID, seriesUID: this.SeriesUID, instanceUID: instanceUID, patientID: this.PatientID };
    }

}

class QuentryImageID extends ImageID {
    PatientFolderID: string;
    PatientFolderModificationDate: Date;
    static Is(obj: any) {
        return obj instanceof QuentryImageID;
    }
    ToJson() {
        var instanceUID = this.InstanceUID == null ? '' : this.InstanceUID;
        return { folderID: this.PatientFolderID, folderModificationDate: this.PatientFolderModificationDate, studyUID: this.StudyUID, seriesUID: this.SeriesUID, instanceUID: instanceUID, patientID: this.PatientID };
    }
}

class LocalDicomPatient extends DTOPatient {
    PatientComment: string
}

class LocalDicomID extends ImageID {
    FileName: string;
    Modality: string;
    SeriesDescription: string;
    StudyDate: Date;
    StudyDescription: string;
	Patient: LocalDicomPatient;
	ImageServiceDirectUrl: string;

    static Is(obj: any) {
        return obj instanceof LocalDicomID;
    }
    //ToJson() {
    //    var instanceUID = this.InstanceUID == null ? '' : this.InstanceUID;
    //    return {
    //        modality: this.Modality
    //    }
    //}
   
}


class LocalImageID extends ImageID {
    FileName: string;
    ImageStringBase64: string;
    //for future use save to quentry or make extand QuentryImageID
    PatientFolderID: string;
    PatientFolderModificationDate: string;
    //new from DcmImage 
    ImageServiceDirectUrl: string;
    OriginalImageWidth: number;
    OriginalImageHeight: number;
    BaseWLWindow: number = 256;
    BaseWLLevel: number = 127;
    BitePerPixel = 8;
    Orientation: number;
    ImageUploadData: DTOImageUploadData;
    static Is(obj: any) {
        return obj instanceof LocalImageID;
    }
    ToJson() {
        var instanceUID = this.InstanceUID == null ? '' : this.InstanceUID;
        return {
            fileName: this.FileName,
            imageStringBase64: this.ImageStringBase64,
            folderID: this.PatientFolderID,
            folderModificationDate: this.PatientFolderModificationDate,
            studyUID: this.StudyUID,
            seriesUID: this.SeriesUID,
            instanceUID: instanceUID,
            patientID: this.PatientID
        };
    }
}

class FolderModificationDate {
    PatientFolderID: string;
    PatientFolderModificationDate: Date;
}

class SeriesDescriptionData {
    SeriesUID: string;
    SeriesDescription: string;
    SeriesDate: Date;
    InstanceCounter: number;
}

class SelectedData {
    patientIdObj: SelectedPatient;
    selectedFoldersID: string;
    studyDate: string[];
    selectedStudiesUIDList: string[];
    selectedSeriesIDList: string[];
    selectedImagesIDList: any [];
    selectedSeriesDescriptionDataList: string[]

    constructor() {
        this.patientIdObj = new SelectedPatient();
        this.selectedFoldersID = "";
        this.studyDate = [];
        this.selectedStudiesUIDList = [];
        this.selectedSeriesIDList = [];
        this.selectedImagesIDList = [];
        this.selectedSeriesDescriptionDataList = [];

    }
}

class SelectedPatient {
    patientFullName: string;
    patientDOB: any;
    patientGender: string;
    patientID: string;

    constructor() {
        this.patientFullName ="";
        this.patientDOB = "";
        this.patientGender = "";
        this.patientID ="";
    }
}








