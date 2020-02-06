import { IListViewProps, IListViewState } from '../listView';

export interface ILazyListViewProps extends IListViewProps {
    asyncItems: Promise<any[]>
}

export interface ILazyListViewState extends IListViewState {
  
}
