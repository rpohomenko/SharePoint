import { IDropdownOption } from 'office-ui-fabric-react' /* '@fluentui/react'*/;

export interface IAsyncDropdownState {
  loading: boolean;
  options: IDropdownOption[];
  error: string;
}