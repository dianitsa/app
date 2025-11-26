import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API, toast } from '@/App';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, FileDown, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [returnDialog, setReturnDialog] = useState(null);
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    fetchLoans();
  }, [filterStatus, search]);

  useEffect(() => {
    setReturnDate(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchLoans = async () => {
    try {
      const params = {};
      if (filterStatus) params.status_devolucao = filterStatus;
      if (search) params.search = search;

      const response = await axios.get(`${API}/loans`, { params });
      setLoans(response.data);
    } catch (error) {
      toast.error('Erro ao carregar empréstimos');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    try {
      await axios.put(`${API}/loans/${returnDialog}/return`, {
        data_devolucao_real: new Date(returnDate).toISOString()
      });
      toast.success('Empréstimo devolvido com sucesso');
      setReturnDialog(null);
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao devolver empréstimo');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/export/loans`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'emprestimos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pendente': 'badge badge-warning',
      'Devolvido': 'badge badge-success',
      'Atrasado': 'badge badge-danger',
    };
    return badges[status] || 'badge badge-secondary';
  };

  return (
    <div className="space-y-6" data-testid="loan-list-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empréstimos</h1>
          <p className="text-gray-600 mt-1">Gerencie os empréstimos de equipamentos</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport} data-testid="export-loans-button">
            <FileDown size={16} className="mr-2" />
            Exportar Excel
          </Button>
          <Link to="/loans/new">
            <Button data-testid="new-loan-btn">
              <Plus size={16} className="mr-2" />
              Novo Empréstimo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por solicitante ou departamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="search-loan-input"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-testid="filter-status-loan">
                <SelectValue placeholder="Status da Devolução" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Devolvido">Devolvido</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empréstimos ({loans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Carregando...</p>
          ) : loans.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum empréstimo encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Solicitante</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Departamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Equipamentos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Empréstimo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Prevista</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="table-row border-b" data-testid={`loan-row-${loan.id}`}>
                      <td className="py-3 px-4 font-medium">{loan.nome_solicitante}</td>
                      <td className="py-3 px-4">{loan.departamento_solicitante}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          {loan.equipments.map((eq, idx) => (
                            <span key={idx} className="text-sm">{eq}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(loan.data_emprestimo).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(loan.data_prevista_devolucao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(loan.status_devolucao)}>
                          {loan.status_devolucao}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {loan.status_devolucao !== 'Devolvido' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReturnDialog(loan.id)}
                            data-testid={`return-btn-${loan.id}`}
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Devolver
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Dialog */}
      <Dialog open={returnDialog !== null} onOpenChange={() => setReturnDialog(null)}>
        <DialogContent data-testid="return-dialog">
          <DialogHeader>
            <DialogTitle>Confirmar Devolução</DialogTitle>
            <DialogDescription>
              Informe a data de devolução do empréstimo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="return-date">Data de Devolução</Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                data-testid="return-date-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialog(null)} data-testid="cancel-return-button">
              Cancelar
            </Button>
            <Button onClick={handleReturn} data-testid="confirm-return-button">
              Confirmar Devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanList;