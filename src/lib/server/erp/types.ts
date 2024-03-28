export interface Article {
	ID: number;
	Name: string;
	GroupID: number;
	Barcode: string;
	VatID: string;
	Unit: string;
	TarifNo: number;
	CatalogNumber: string;
	PaymentDays: number;
	Weight: number;
	ActionDiscount: number;
	IsPackage: boolean;
	IsMaterial: boolean;
	IsProduct: boolean;
	IsService: boolean;
	Iscommission: boolean;
	PlaceOfExpense: number;
	CarrierOfExpense: number;
	Account: string;
	WSSort: number;
	MobSort: boolean;
	ModifyTime: Date;
	Operater: string;
	HasCommercialPackage: boolean;
	CommercialPackageCode: string;
	CPAmount: number;
	HasTransportPackage: boolean;
	TransportPackageCode: string;
	TPAmount: number;
	PlanningPrice: number;
	OwnProductPrice: number;
	SectionID: number;
	Address: string;
	InternalNote: string;
	Declaration: string;
}