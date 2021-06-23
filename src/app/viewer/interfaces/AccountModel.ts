// Interface
class ResponseBaseModel {
    success: boolean;
    errors: string[];
    }


class LogOnModel {
    UserName: string;
    Password: string;
    IsPDM: boolean;
 
}

class GuideModel {
	Language: string;
	Link: string;

}

class UserAuthenticatedDataModel extends ResponseBaseModel
{
    UserName: string;
    UserFullName: string;
    Token: string;
    UserSystemId: string;

}

class FeatureLicenseModel extends ResponseBaseModel {
    Ends: number;
}

class ESiteType {
    static Quentry = 0;
    static Hospital = 1;
    //TODO: DMF add option for local upload? 
    static LocalFolder = 2;


}
//working enviroments 


interface SiteDetailsModel {
    SiteName: string;
    SiteId: number;
    SiteType: ESiteType;
    ImagesServiceUrl: string;
  
}

class NotificationModel {
    Text: string;
    PatientFullName: string;
    TimeStamp: number;
    NotificationType: ENotificationType;

}

class ENotificationType {
    static Info = 0;
    static Error = 1;

}
//DMF quentry recipient
class DTORecepientsArrayData {
    Result: DTORecipientData[];
}
class DTORecipientData {
    RecipientName: string;
    UserSystemID: string;
    IsCareTeam: boolean;

}
class DTOPacsDetailsArray {
    Result: DTOPacsDetails[];
}
class DTOPacsDetails {
    PacsID: string;
    PacsName: string;
}







