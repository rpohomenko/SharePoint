import { FieldTypes, IFieldInfo } from "@pnp/sp/fields";
import { IBasePermissions } from "@pnp/sp/security";

export enum DataType {
    Text = 0,
    MultiLineText = 1,
    RichText = 2,
    DateTime = 3,
    Date = 4,
    Number = 5,
    Lookup = 6,
    MultiLookup = 7,
    Boolean = 8,
    Choice = 9,
    MultiChoice = 10,
    User = 11,
    MultiUser = 12,
    URL = 13
}

export enum FormMode {
    Display = 0,
    Edit = 1,
    New = 2
}

export interface IField {
    Id: string;
    Name: string;
    Title: string;
}

export interface IViewField extends IField {
    DataType: DataType;
    OutputType?: DataType.Text | DataType.Number | DataType.Boolean | DataType.DateTime | DataType.Date;
    Sortable?: boolean;
    Filterable?: boolean;
}

export interface IViewUrlField extends IViewField {
    AsImage?: boolean;
}

export interface IFormField extends IField {
    DataType: DataType;
    OutputType?: DataType.Text | DataType.Number | DataType.Boolean | DataType.DateTime | DataType.Date;
    LookupFieldName?: string;
    LookupListId?: string;
    LookupWebId?: string;
    PrimaryFieldName?: string;
    Required?: boolean;
    ReadOnly?: boolean;
    Modes?: FormMode[];
    Description?: string;
    Choices?: string[];
    DefaultValue?: any;
    Filterable?: boolean;
}

export interface IOrderByField extends IField {
    Descending?: boolean;
}

export interface IViewLookupField extends IViewField {
    LookupFieldName: string;
    LookupListId: string;
    LookupWebId: string;
    PrimaryFieldName?: string;
}

export interface IFolder {
    /**
     * Folder name
     */
    Name: string;
    /**
     * Server relative url of the folder
     */
    ServerRelativeUrl: string;
}

export interface IFieldLookupInfo extends IFieldInfo {
    AllowMultipleValues: boolean;
    LookupField: string;
    LookupList: string;
    LookupWebId: string;
    IsRelationship: boolean;
    PrimaryFieldId?: string;
}

export interface IFieldUserInfo extends IFieldLookupInfo {
}


export interface IFieldChoiceInfo extends IFieldInfo {
    Choices: { results: string[] };
}

export interface IFieldMultiLineTextInfo extends IFieldInfo {
    RichText: boolean;
}

export interface IFieldDateInfo extends IFieldInfo {
    DisplayFormat: number;
}

export interface IListItem {
    ID: number;
    Title?: string;
    EffectiveBasePermissions: IBasePermissions;
}

export interface IEditableListItem extends IListItem {
    CanEdit?: boolean;
    CanDelete?: boolean;
}


export enum PrincipalType {
    User = 1,
    DistributionList = 2,
    SecurityGroup = 4,
    SharePointGroup = 8
}

export interface IUserInfo {
    Id: number;
    IsHiddenInUI?: boolean;
    LoginName: string;
    Title: string;
    PrincipalType: number;
    Email: string;
    IsEmailAuthenticationGuestUser?: boolean;
    IsShareByEmailGuestUser?: boolean;
    IsSiteAdmin?: boolean;
}

export interface ILookupFieldValue {
    Id: number;
    Title: string;
}

export interface IUserFieldValue extends ILookupFieldValue {
    Name: string;
    Email: string;
}

export interface IUrlFieldValue {
    Url: string;
    Description?: string;
}

export interface IFilterGroup {
    LeftFilterGroup?: IFilterGroup;
    LeftFilter?: IFilter;
    Join: FilterJoin;
    RightFilter?: IFilter;
    RightFilterGroup?: IFilterGroup;
}

export interface IFilter {
    Field: string;
    Type: FilterType;
    Value: any;
    FilterValue?: string;
}

export enum FilterJoin {
    Or = 0,
    And = 1
}

export enum FilterType {
    Equals = 0,
    NotEquals = 1,
    StartsWith = 2,
    Contains = 3,
    Less = 4,
    LessOrEquals = 5,
    Greater = 6,
    GreaterOrEquals = 7,
    Empty = 8,
    NotEmpty = 9
}

export interface IContentType {
    Id: string;
    Name: string;
}
