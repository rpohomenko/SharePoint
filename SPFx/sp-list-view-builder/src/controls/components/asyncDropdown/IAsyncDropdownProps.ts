import { IDropdownOption } from 'office-ui-fabric-react' /* '@fluentui/react'*/;

export interface IAsyncDropdownProps {
  label?: string;
  options: () => Promise<IDropdownOption[]>;
  onChange: (option: IDropdownOption, index?: number) => void;
  selectedKey?: string | number;
  disabled?: boolean;
  stateKey?: string;
  placeholder? : string;
}