import { PointF } from "./ImageDataModels";

export interface IBasicToolsViewer {
	Ruler(shapeName: string, strokeColor, dragendCallback): void;
	Circle(shapeName: string, strokeColor, dragendCallback): void;
	SetAngleTool(shapeName: string, strokeColor): void;
	AngleTool(shapeName: string, strokeColor): void;
	SetCircleByCenter(radius: number, centerX: number, centerY: number, shapeName: string, strokecolor?: string, dragendCallback?): void;
	SetCircle(radius: number, p1: PointF, p2: PointF, shapeName: string, strokecolor?: string, dragendCallback?, count?: number): void;
	SetRuler(x1: number, y1: number, x2: number, y2: number, shapeName: string, strokecolor?: string, dragendCallback?): void;


	//SWIP functions
	SetRulerFromSWIP(rulerSwipItem: any): void;
	SetCircleFromSWIP(circleSwipItem: any): void;
	SetAngleToolFromSWIP(angleSwipItem: any): void;
}