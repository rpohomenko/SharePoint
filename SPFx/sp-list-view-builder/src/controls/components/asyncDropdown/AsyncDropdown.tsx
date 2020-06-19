import * as React from 'react';
import { Dropdown, IDropdownOption, Spinner } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { IAsyncDropdownProps } from './IAsyncDropdownProps';
import { IAsyncDropdownState } from './IAsyncDropdownState';

export class AsyncDropdown extends React.Component<IAsyncDropdownProps, IAsyncDropdownState> { 

  constructor(props: IAsyncDropdownProps, state: IAsyncDropdownState) {
    super(props);
    this.state = {
      loading: false,
      options: undefined,
      error: undefined
    };
  }

  public componentDidMount(): void {
    this.loadOptions();
  }

  public componentDidUpdate(prevProps: IAsyncDropdownProps, prevState: IAsyncDropdownState): void {
    if (this.props.disabled !== prevProps.disabled /*||
      this.props.stateKey !== prevProps.stateKey*/) {
      //this.loadOptions();
    }
  }

  public render(): JSX.Element {
    const loading = this.state.loading;
    const error: JSX.Element = this.state.error !== undefined
      ? (<div className={'ms-TextField-errorMessage ms-u-slideDownIn20'}>{`Error while loading items: ${this.state.error}`}</div>)
      : <div />;

    return (
      <div>
        <Dropdown label={this.props.label}
          disabled={this.props.disabled || this.state.loading || this.state.error !== undefined}
          onChange={this.onChange.bind(this)}
          selectedKey={this.props.selectedKey}
          options={this.state.options}
          placeholder={this.props.placeholder || ""}
          {...loading ? { onRenderCaretDown: () => <Spinner /> } : {}} />
        {error}
      </div>
    );
  }

  private loadOptions(): void {  

    if (this.props.options) {
      if(this.props.options instanceof Array){
        this.setState({
          loading: false,
          error: undefined,
          options: this.props.options
        });
        return;
      }
      this.setState({
        loading: true,
        error: undefined,
        options: undefined
      });
      this.props.options()
        .then((options: IDropdownOption[]): void => {
          this.setState({
            loading: false,
            error: undefined,
            options: options
          });
        }, (error: any): void => {
          this.setState((prevState: IAsyncDropdownState, props: IAsyncDropdownProps): IAsyncDropdownState => {
            prevState.loading = false;
            prevState.error = error;
            return prevState;
          });
        });
    }
  }

  private onChange(e, option: IDropdownOption, index?: number): void {   
    // reset previously selected options
    const options: IDropdownOption[] = this.state.options;
    options.forEach((o: IDropdownOption): void => {
      if (o.key !== option.key) {
        o.selected = false;
      }
    });
    this.setState((prevState: IAsyncDropdownState, props: IAsyncDropdownProps): IAsyncDropdownState => {
      prevState.options = options;
      return prevState;
    }, () => {
      if (typeof this.props.onChange === "function") {
        this.props.onChange(option, index);
      }
    });
  }
}