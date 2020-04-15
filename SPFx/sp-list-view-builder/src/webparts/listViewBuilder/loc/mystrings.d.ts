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
}

declare module 'ListViewBuilderWebPartStrings' {
  const strings: IListViewBuilderWebPartStrings;
  export = strings;
}
