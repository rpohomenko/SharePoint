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
    MultiUser = 12
}

export enum FormMode {
    Display = 0,
    Edit = 1,
    New = 2
}

export interface IViewField {
    Id: string;
    Name: string;
    Title: string;
    DataType: DataType;
    OutputType?: DataType.Text | DataType.Number | DataType.Boolean | DataType.DateTime | DataType.Date;
    Sortable?: boolean;
    Filterable?: boolean;
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
