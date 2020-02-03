import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Fabric } from 'office-ui-fabric-react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';

import { PropertyPaneList, IPropertyPaneListProps } from './PropertyPaneList';

export class PropertyPaneViewFieldList extends PropertyPaneList {

   constructor(targetProperty: string, properties: IPropertyPaneListProps) {
      super(targetProperty, properties);
   }

   protected onRenderElement(): React.ReactElement {
      const element = super.onRenderElement();
      return <>
         <CommandBar
            items={[
               { key: 'add', text: 'Add', iconProps: { iconName: 'Add' }, onClick: () => {} }
            ]}
         />
         {element}</>;
   }
}