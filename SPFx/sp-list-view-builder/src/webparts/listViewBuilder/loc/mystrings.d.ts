declare interface IListViewBuilderWebPartStrings {
  WebPartName: string;
  PropertyPaneDescription: string;
  BasicGroupName: string;
  AdvancedGroupName: string;
  DescriptionFieldLabel: string;
  ConfigurationIdFieldLabel: string;
  ListFieldLabel: string;
  ViewFieldsFieldLabel: string;
  FieldTypeNames: string[];
  CachingTimeoutSecondsLabel: string;
  CountPerPageLabel: string;
  IncludeSubFolderLabel: string;
  OrderByLabel: string;
  AscendingLabel: string;
  FormFieldsFieldLabel: string;
}

declare module 'ListViewBuilderWebPartStrings' {
  const strings: IListViewBuilderWebPartStrings;
  export = strings;
}
