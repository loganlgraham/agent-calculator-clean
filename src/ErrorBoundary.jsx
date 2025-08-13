import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, err:error }; }
  componentDidCatch(error, info){ console.error('ErrorBoundary', error, info); }
  render(){
    if(this.state.hasError){
      return <div className="card"><h3>Something went wrong.</h3><pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.err)}</pre></div>;
    }
    return this.props.children;
  }
}
