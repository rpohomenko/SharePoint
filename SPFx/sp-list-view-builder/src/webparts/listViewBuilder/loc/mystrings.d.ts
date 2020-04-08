declare interface IListViewBuilderWebPartStrings {
  WebPartName: string;
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ConfigurationIdFieldLabel: string;
  ListIdFieldLabel: string;
  ViewFieldsFieldLabel: string;
  FieldTypeNames: string[];
}

declare module 'ListViewBuilderWebPartStrings' {
  const strings: IListViewBuilderWebPartStrings;
  export = strings;
}
