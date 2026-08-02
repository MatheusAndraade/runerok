import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // @ts-ignore
  public override props: Props;
  // @ts-ignore
  public override state: State;
  // @ts-ignore
  public override setState: (state: Partial<State>) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Capturado erro não tratado no jogo:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-amber-100 select-none">
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-800 rounded-xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-950/80 border border-rose-700/80 rounded-full flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-rose-200">Ops! Ocorreu uma falha no jogo</h2>
              <p className="text-xs text-slate-400">
                Ocorreu um erro de renderização inesperado. Você pode reiniciar o jogo para continuar sua aventura.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar o Jogo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
