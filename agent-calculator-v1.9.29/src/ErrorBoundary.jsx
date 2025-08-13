import { Component } from 'react';
export default class ErrorBoundary extends Component {
  constructor(p){ super(p); this.state={hasError:false,err:null}; }
  static getDerivedStateFromError(e){ return {hasError:true,err:e}; }
  componentDidCatch(e,info){ console.error('ErrorBoundary', e, info); }
  render(){
    if(this.state.hasError){
      return <div className="card"><h3>Something went wrong.</h3><pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.err)}</pre></div>
    }
    return this.props.children;
  }
}
