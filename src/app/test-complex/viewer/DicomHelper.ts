//// <reference path="../Declaretions.ts" />
'use strict';
declare var imageInfo: any;

class DicomHelper
{
    static GetDicomPatientInformation = function (dicomDataSet)
    {
        var patientInfo = new DTOPatient();
        patientInfo.PatientFullName = DicomHelper.GetTagText($(dicomDataSet).find('element[tag="00100010"]')[0]);
        patientInfo.PatientFullName = patientInfo.PatientFullName.split("^").join(" ");
        var patientDOBStr = DicomHelper.GetTagText($(dicomDataSet).find('element[tag="00100030"]')[0]);
        if ((<any>patientDOBStr) == '' || patientDOBStr ==null)
        {
            patientInfo.PatientDOB = null;
        }
        else if ((Number(patientDOBStr)) < 0)
        {
            var d = new Date("1/1/1970");
            d.setSeconds(Number(patientDOBStr) / 1000);
            patientInfo.PatientDOB = d;
        }
        else
        {
            patientInfo.PatientDOB = new Date(Number(patientDOBStr));
		}

        patientInfo.PatientID = DicomHelper.GetTagText($(dicomDataSet).find('element[tag="00100020"]')[0]);
        patientInfo.Gender = DicomHelper.GetTagText($(dicomDataSet).find('element[tag="00100040"]')[0]);
        return patientInfo;
    }
     static GetDicomStudyInformation = function (dicomDataSet) {
        var studyInfo = new DTOStudy();
        var studyDateStr = DicomHelper.GetTagText($(dicomDataSet).find('element[tag="00080020"]')[0]);
         studyInfo.StudyDate = new Date(Number(studyDateStr));
         
         return studyInfo;
    }
    static GetDicomImageInformation = function (dicomDataSet) {

        var imageWidthTag = $(dicomDataSet).find('element[tag="00280011"]');
        var imageHeightTag = $(dicomDataSet).find('element[tag="00280010"]');

        var windowWidthTag = $(dicomDataSet).find('element[tag="00281051"]');
        var windowCenterTag = $(dicomDataSet).find('element[tag="00281050"]');
        var smallestTag = $(dicomDataSet).find('element[tag="00280106"]'); //Smallest Image Pixel Value
        var largestTag = $(dicomDataSet).find('element[tag="00280107"]'); //Largest Image Pixel Value
        var hightBitTag = $(dicomDataSet).find('element[tag="00280102"]'); //hight bit
        var bitsStoredTag = $(dicomDataSet).find('element[tag="00280101"]'); //bit Stored
        var interceptTag = $(dicomDataSet).find('element[tag="00281052"]'); //Rescale Intercept
        var SlopeTag = $(dicomDataSet).find('element[tag="00281053"]'); //Rescale Slope

        var patientOrientationTag = $(dicomDataSet).find('element[tag="00200020"]'); //Paitent orientation, this is just incase the image orientation is not present

        var orientationTag = $(dicomDataSet).find('element[tag="00200037"]'); //Image Patient Orientation.
        var positionTag = $(dicomDataSet).find('element[tag="00200032"]'); //Image Patient Position.
        var frameOfReferenceUID = $(dicomDataSet).find('element[tag="00200052"]'); //Frame of reference UID

        var voiLutSequence = $(dicomDataSet).find('element[tag="00283010"]'); //VOI LUT Sequence
        var waveFormSequence = $(dicomDataSet).find('element[tag="54000100"]'); //Wave Form Sequence

        var imageTypeTag = $(dicomDataSet).find('element[tag="00080008"]'); //Image Type
        var lossyImageCompressionTag = $(dicomDataSet).find('element[tag="00282110"]'); //The Lossy Image Compression 

        var lutDescriptor = null;
        var lutData = null;
        if (null != voiLutSequence && voiLutSequence.length > 0) {
            var seqItem = voiLutSequence.children().first();

            if (null != seqItem && seqItem.length > 0) {
                lutDescriptor = seqItem.find('element[tag="00283002"]'); //LUT Descriptor
                lutData = seqItem.find('element[tag="00283006"]');  //LUT Data
            }
        }

        var signedTag = $(dicomDataSet).find('element[tag="00280103"]'); //Pixel Representation
        var photometricInterpretationTag = $(dicomDataSet).find('element[tag="00280004"]'); //Photometric Interpretation
        var imagerPixelSpacingTag = $(dicomDataSet).find('element[tag="00181164"]'); //Imager Pixel Spacing
        var pixelSpacingTag = $(dicomDataSet).find('element[tag="00280030"]'); //Pixel Spacing
        var nominalScannedPixelSpacingTag = $(dicomDataSet).find('element[tag="00182010"]'); //Nominal Scanned Pixel Spacing
        var detectorElementSpacingTag = $(dicomDataSet).find('element[tag="00187022"]'); //Detector Element Spacing

        var width;
        var height;
        var bpp = 1;
        var bitsStored = 0;
        var highBit;
        var lowBit = 0;
        var signed = false;


        if (imageWidthTag != null || imageWidthTag.length) {
            width = DicomHelper.GetTagText(imageWidthTag[0]);
        }
        else {
            width = 0;
        }

        if (imageHeightTag != null || imageHeightTag.length) {
            height = DicomHelper.GetTagText(imageHeightTag[0]);
        }
        else {
            height = 0;
        }

        bpp = DicomHelper.GetBitsPerPixel(dicomDataSet);

        if (null != bitsStoredTag && bitsStoredTag.length > 0) {
            bitsStored = parseInt(DicomHelper.GetTagText(bitsStoredTag[0]), 10);
        }
        else {
            bitsStored = bpp;
        }
        var imageInfo:any = {};
        imageInfo.width=parseInt(width, 10);
        imageInfo.height=parseInt(height, 10);
        imageInfo.bitsPerPixel=bpp;

        if (hightBitTag != null && hightBitTag.length > 0) {
            highBit = parseInt(DicomHelper.GetTagText(hightBitTag[0]), 10);
            lowBit = bitsStored - highBit - 1;
        }
        else {
            highBit = bpp - 1;
            lowBit = 0;
            imageInfo=lowBit;
        }

        imageInfo.highBit=highBit;
        imageInfo.lowBit=lowBit;

        if (null != interceptTag && interceptTag.length > 0) {
            imageInfo.modalityIntercept=parseInt(DicomHelper.GetTagText(interceptTag[0]), 10);
        }
        else {
            imageInfo.modalityIntercept=0;
        }

        if (null != SlopeTag && SlopeTag.length > 0) {
            imageInfo.modalitySlope=parseInt(DicomHelper.GetTagText(SlopeTag[0]), 10);
        }
        else {
            imageInfo.modalitySlope=1;
        }

        if (lutData != null && lutData.length) {
            var lutDescValues = DicomHelper.GetTagText(lutDescriptor[0]).split("\\");

            imageInfo.firstStoredPixelValueMapped=lutDescValues[1] | 0;

            var myArray = DicomHelper.GetTagText(lutData[0]).split("\\");
            for (var i = myArray.length; i--; ) myArray[i] = myArray[i] | 0;
            imageInfo.lutDescriptor=myArray;
        }

        if (signedTag != null && signedTag.length) {
            signed = (parseInt(DicomHelper.GetTagText(signedTag[0]), 10) === 1) ? true : false;
            imageInfo.signed=signed;
        }
        else {
            imageInfo.signed=0;
        }

        var offset = (signed === true) ? 1 << highBit : 0;
        var mask = ((1 << bitsStored) - 1);

        var minValue = 0;
        if (smallestTag != null && smallestTag.length) {
            var smallestPixel = parseInt(DicomHelper.GetTagText(smallestTag[0]), 10);

            if (smallestPixel < 0) {
                if (smallestPixel > offset) {
                    minValue = 0;
                }
                else {
                    minValue = smallestPixel + offset;
                }
            }
            else {
                minValue = Math.min(smallestPixel + offset, mask);
            }
        }
        else {
            minValue = 0;
        }

        imageInfo.minValue=minValue;

        var maxValue = -1;

        if (largestTag != null && largestTag.length) {
            var largestPixel = parseInt(DicomHelper.GetTagText(largestTag[0]), 10);

            if (largestPixel < 0) {
                if (largestPixel > offset) {
                    maxValue = 0;
                }
                else {
                    maxValue = (largestPixel + offset);
                }
            }
            else {
                maxValue = Math.min(largestPixel + offset, mask);
            }
        }
        else {
            largestPixel = 0;
        }

        imageInfo.maxValue=largestPixel;


        if (null != windowWidthTag && windowWidthTag.length > 0) {
            imageInfo.windowWidth=parseInt(DicomHelper.GetTagText(windowWidthTag[0]), 10);
        }
        else {
            imageInfo.windowWidth=0;
        }

        if (null != windowCenterTag && windowCenterTag.length > 0) {
            imageInfo.windowCenter=parseInt(DicomHelper.GetTagText(windowCenterTag[0]), 10);
        }
        else {
            imageInfo.windowCenter=0;
        }

        if (null != photometricInterpretationTag && photometricInterpretationTag.length > 0) {
            imageInfo.photometricInterpretation=DicomHelper.GetTagText(photometricInterpretationTag[0]);
        }
        else {
            imageInfo.photometricInterpretation="MONOCHROME2";
        }

        var spacing = null;
        var spacingType = null;

        if (null != nominalScannedPixelSpacingTag && nominalScannedPixelSpacingTag.length > 0) {
            spacing = DicomHelper.GetTagText(nominalScannedPixelSpacingTag[0]);
            spacingType = "detector";
        }

        if (null != imagerPixelSpacingTag && imagerPixelSpacingTag.length > 0) {
            spacing = DicomHelper.GetTagText(imagerPixelSpacingTag[0]);
            spacingType = "detector";
        }

        if (null != pixelSpacingTag && pixelSpacingTag.length > 0) {
            spacing = DicomHelper.GetTagText(pixelSpacingTag[0]);

            spacingType = "calibrated";

            var pixelSpacingCalibrationTypeTag = $(dicomDataSet).find('element[tag="00280A02"]'); //Pixel Spacing Calibration Type

            if (null != pixelSpacingCalibrationTypeTag && pixelSpacingCalibrationTypeTag.length > 0) {
                spacingType = DicomHelper.GetTagText(pixelSpacingCalibrationTypeTag[0]);
            }
        }

        if (null != spacing) {
            var values = spacing.split('\\');
            imageInfo.rowSpacing = parseFloat(values[0]);
            imageInfo.columnSpacing = parseFloat(values[1]);
            imageInfo.spacingType = spacingType;
        }
        else {
            imageInfo.rowSpacing = 0;
            imageInfo.columnSpacing = 0;
        }

        if (null != orientationTag && orientationTag.length > 0) {
            var orientation = DicomHelper.GetTagText(orientationTag[0]); // getElementsByTagName("Image Orientation (Patient)"); // textContent;
            var values = orientation.split('\\');
            imageInfo.orientation = values;
        }
        else if (null != patientOrientationTag && patientOrientationTag.length > 0) {
            var orientation = DicomHelper.GetTagText(patientOrientationTag[0]);
            var values = orientation.split('\\');
            imageInfo.orientation = values;
        }
        else
            imageInfo.orientation = [0, 1, 0, 0, 1, 0];

        if (null != positionTag && positionTag.length > 0) {
            var position = DicomHelper.GetTagText(positionTag[0]);
            var values = position.split('\\');
            imageInfo.position = values;
        }
        else
            imageInfo.position = [1, 1, 1];

        if (frameOfReferenceUID != null && frameOfReferenceUID.length > 0) {
            imageInfo.frameOfReferenceUID = DicomHelper.GetTagText(frameOfReferenceUID[0]);
        }
        else
            imageInfo.frameOfReferenceUID = "";

        imageInfo.isWaveForm = waveFormSequence.length != 0;

        if (null != imageTypeTag && imageTypeTag.length > 0) {
            var imageType = DicomHelper.GetTagText(imageTypeTag[0]);
            var values = imageType.split('\\');
            imageInfo.imageType = values;
        }
        else
            imageInfo.imageType = "unknown";

        if (null != lossyImageCompressionTag) {
            var lossyImageCompression = lossyImageCompressionTag.text();
            if (lossyImageCompression == "01") {
                imageInfo.lossyImageCompression = true;
            } else {
                imageInfo.lossyImageCompression = false;
            }
        }
        else
            imageInfo.lossyImageCompression = false;

    return <ImageInfo>imageInfo;
}

    static GetBitsPerPixel(dicomDataSet: any) {
        var samplesPerPixelTag = $(dicomDataSet).find('element[tag="00280002"]');
        var allocatedBitsTag = $(dicomDataSet).find('element[tag="00280100"]');

        var bpp;
        if (samplesPerPixelTag != null && samplesPerPixelTag.length > 0) {
            bpp = parseInt(DicomHelper.GetTagText(samplesPerPixelTag[0]), 10);
        }

        return bpp * parseInt(DicomHelper.GetTagText(allocatedBitsTag[0]), 10);
    }

    static GetTagText = function (tag) {
        if (!tag)
            return 0;

        if (tag.text != undefined)
            return tag.text;

        return tag.textContent;
    }


}

