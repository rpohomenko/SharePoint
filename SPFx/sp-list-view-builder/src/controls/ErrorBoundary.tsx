import * as React from 'react';

export default class ErrorBoundary extends React.Component<{
}, {
  hasError?: boolean;
  msg: string;
}> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      msg: null
    };
  }

  public componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true, msg: error });
    // You can also log the error to an error reporting service   
    console.log(error, info);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <h3>Something went wrong...</h3>
          <h4>Message: {this.state.msg.toString()}</h4>
        </>
      );
    }
    return this.props.children;
  }
}