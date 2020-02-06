import * as React from 'react';
import { Selection, IColumn, IGroup, IGroupRenderProps } from 'office-ui-fabric-react/lib/DetailsList';
import { ILazyListViewState, ILazyListViewProps } from './ILazyListView';
import { ListView } from '../listView';


export class LazyListView extends ListView {

    constructor(props: ILazyListViewProps) {
        super(props);

        // Initialize state
        this.state = {
            ...this.state
        };
    }

    protected updateState(items: any[]) {
        const { asyncItems } = this.props as ILazyListViewProps;
        if (!!asyncItems) {
            asyncItems.then(items => {
                super.updateState(items);
            })
        }
        else {
            super.updateState(items);
        }
    }

    protected renderList(items: any[], columns: IColumn[], groupProps: IGroupRenderProps, groups: IGroup[], selection: Selection): React.ReactElement {
        return super.renderList(items, columns, groupProps, groups, selection);
    }
}