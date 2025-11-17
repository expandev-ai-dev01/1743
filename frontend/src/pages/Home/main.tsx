import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao StockBox</h2>
      <p className="text-lg text-gray-600 mb-8">Sistema de Controle de Estoque</p>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mb-8">
        <p className="text-gray-700 mb-4">
          Gerencie suas movimentações de estoque de forma simples e eficiente. Registre entradas,
          saídas e acompanhe a quantidade atual de cada produto.
        </p>
        <Link
          to="/stock-movements"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Acessar Movimentações
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-blue-600 mb-3">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Registrar Movimentações</h3>
          <p className="text-gray-600 text-sm">
            Registre entradas, saídas, ajustes e outras movimentações de estoque
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-blue-600 mb-3">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Histórico Completo</h3>
          <p className="text-gray-600 text-sm">
            Consulte o histórico detalhado de todas as movimentações realizadas
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-blue-600 mb-3">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rastreabilidade</h3>
          <p className="text-gray-600 text-sm">
            Acompanhe cada ação com registro de usuário, data e motivo
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
