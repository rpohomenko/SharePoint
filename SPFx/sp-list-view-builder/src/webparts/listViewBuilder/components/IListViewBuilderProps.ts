import { IViewField } from "../IConfiguration";

export interface IListViewBuilderProps {
  description: string;
  //configurationId: number;
  inDesignMode: boolean;
  //configListTitle: string;
  viewFields: IViewField[];
}
