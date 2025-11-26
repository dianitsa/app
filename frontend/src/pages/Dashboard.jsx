import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, AlertCircle, Wrench, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentLoans, setRecentLoans] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, loansRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/loans`)
      ]);
      setStats(statsRes.data);
      setRecentLoans(loansRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Equipamentos',
      value: stats?.total_equipments || 0,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Disponíveis',
      value: stats?.available || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Emprestados',
      value: stats?.loaned || 0,
      icon: FileText,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Manutenção',
      value: stats?.maintenance || 0,
      icon: Wrench,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Empréstimos Ativos',
      value: stats?.active_loans || 0,
      icon: Clock,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Empréstimos Atrasados',
      value: stats?.overdue_loans || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      'Pendente': 'badge badge-warning',
      'Devolvido': 'badge badge-success',
      'Atrasado': 'badge badge-danger',
    };
    return badges[status] || 'badge badge-secondary';
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/equipments/new">
            <Button data-testid="add-equipment-button">Adicionar Equipamento</Button>
          </Link>
          <Link to="/loans/new">
            <Button variant="outline" data-testid="new-loan-button">Novo Empréstimo</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover" data-testid={`stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Empréstimos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoans.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum empréstimo registrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Solicitante</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Departamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Equipamentos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Empréstimo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLoans.map((loan) => (
                    <tr key={loan.id} className="table-row border-b" data-testid={`loan-row-${loan.id}`}>
                      <td className="py-3 px-4">{loan.nome_solicitante}</td>
                      <td className="py-3 px-4">{loan.departamento_solicitante}</td>
                      <td className="py-3 px-4">{loan.equipments.length} item(s)</td>
                      <td className="py-3 px-4">
                        {new Date(loan.data_emprestimo).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(loan.status_devolucao)}>
                          {loan.status_devolucao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {recentLoans.length > 0 && (
            <div className="mt-4 text-center">
              <Link to="/loans">
                <Button variant="link" data-testid="view-all-loans-button">Ver todos os empréstimos</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;