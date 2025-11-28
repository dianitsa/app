import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API, toast } from '@/App';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, History, FileDown, Upload, FileSpreadsheet } from 'lucide-react';

const DEPARTAMENTOS = [
  'AUDITÓRIO', 'PROTOCOLO', 'SEVESC', 'SEGRE', 'ECC', 'SEPES',
  'SALA DE APOIO-SUPERVISÃO', 'SEFREP', 'URE', 'AT', 'SEINTEC',
  'VIDEO CONFERENCIA', 'SALA DO PREGÃO', 'SECOMSE', 'SEFIN',
  'SEAFIN', 'SALA DE INFORMÁTICA', 'CDP', 'SALA DE REUNIÃO',
  'BIBLIOTECA', 'CAPACITAÇÃO 1', 'ESE', 'Outros'
];

const TIPOS_EQUIPAMENTO = ['Notebook', 'Desktop', 'Celular', 'Tablet', 'Monitor', 'Impressora', 'Outros'];
const STATUS_OPTIONS = ['Disponível', 'Em uso', 'Emprestado', 'Manutenção', 'Baixado'];

const EquipmentList = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipments();
  }, [filterTipo, filterDepartamento, filterStatus, search]);

  const fetchEquipments = async () => {
    try {
      const params = {};
      if (filterTipo) params.tipo = filterTipo;
      if (filterDepartamento) params.departamento = filterDepartamento;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;

      const response = await axios.get(`${API}/equipments`, { params });
      setEquipments(response.data);
    } catch (error) {
      toast.error('Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/equipments/${deleteId}`);
      toast.success('Equipamento deletado com sucesso');
      setDeleteId(null);
      fetchEquipments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao deletar equipamento');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/export/equipments`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'equipamentos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(`${API}/export/equipments/template`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_equipamentos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template baixado com sucesso');
    } catch (error) {
      toast.error('Erro ao baixar template');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await axios.post(`${API}/import/equipments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportResult(response.data);
      toast.success(`Importação concluída: ${response.data.success_count} equipamentos importados`);
      
      if (response.data.success_count > 0) {
        fetchEquipments();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao importar equipamentos');
      setImportResult({ error: error.response?.data?.detail || 'Erro ao importar' });
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialog(false);
    setImportFile(null);
    setImportResult(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Disponível': 'badge badge-success',
      'Em uso': 'badge badge-info',
      'Emprestado': 'badge badge-warning',
      'Manutenção': 'badge badge-danger',
      'Baixado': 'badge badge-secondary',
    };
    return badges[status] || 'badge badge-secondary';
  };

  return (
    <div className="space-y-6" data-testid="equipment-list-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie o inventário de equipamentos</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport} data-testid="export-button">
            <FileDown size={16} className="mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => setImportDialog(true)} data-testid="import-button">
            <Upload size={16} className="mr-2" />
            Importar Excel
          </Button>
          <Link to="/equipments/new">
            <Button data-testid="add-equipment-btn">
              <Plus size={16} className="mr-2" />
              Adicionar
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger data-testid="filter-tipo">
                <SelectValue placeholder="Tipo de Equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos os Tipos</SelectItem>
                {TIPOS_EQUIPAMENTO.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
              <SelectTrigger data-testid="filter-departamento">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos os Departamentos</SelectItem>
                {DEPARTAMENTOS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-testid="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos os Status</SelectItem>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipamentos ({equipments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Carregando...</p>
          ) : equipments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum equipamento encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Patrimônio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Marca/Modelo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Departamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Responsável</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.map((equipment) => (
                    <tr key={equipment.id} className="table-row border-b" data-testid={`equipment-row-${equipment.id}`}>
                      <td className="py-3 px-4 font-medium">{equipment.numero_patrimonio}</td>
                      <td className="py-3 px-4">{equipment.tipo_equipamento}</td>
                      <td className="py-3 px-4">{equipment.marca} {equipment.modelo}</td>
                      <td className="py-3 px-4">{equipment.departamento_atual}</td>
                      <td className="py-3 px-4">{equipment.responsavel_atual || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(equipment.status)}>
                          {equipment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/equipments/history/${equipment.id}`)}
                            data-testid={`history-btn-${equipment.id}`}
                          >
                            <History size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/equipments/edit/${equipment.id}`)}
                            data-testid={`edit-btn-${equipment.id}`}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(equipment.id)}
                            data-testid={`delete-btn-${equipment.id}`}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este equipamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-button">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="confirm-delete-button">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={handleCloseImportDialog}>
        <DialogContent className="max-w-2xl" data-testid="import-dialog">
          <DialogHeader>
            <DialogTitle>Importar Equipamentos via Excel</DialogTitle>
            <DialogDescription>
              Faça upload de uma planilha Excel (.xlsx, .xls) com os dados dos equipamentos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="max-w-xs mx-auto"
                data-testid="import-file-input"
              />
              {importFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Arquivo selecionado: {importFile.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Instruções:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Baixe o template Excel para ver o formato correto</li>
                <li>Preencha todas as colunas obrigatórias</li>
                <li>Não altere os nomes das colunas</li>
                <li>Equipamentos com patrimônio duplicado serão ignorados</li>
              </ul>
              <Button
                variant="link"
                onClick={handleDownloadTemplate}
                className="mt-2 p-0 h-auto text-blue-600"
                data-testid="download-template-button"
              >
                <FileDown size={16} className="mr-1" />
                Baixar Template Excel
              </Button>
            </div>

            {importResult && (
              <div className={`border rounded-lg p-4 ${
                importResult.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <h4 className={`font-semibold text-sm mb-2 ${
                  importResult.error ? 'text-red-900' : 'text-green-900'
                }`}>
                  Resultado da Importação:
                </h4>
                {importResult.error ? (
                  <p className="text-sm text-red-800">{importResult.error}</p>
                ) : (
                  <>
                    <div className="text-sm space-y-1">
                      <p className="text-green-800">
                        ✓ Sucesso: {importResult.success_count} equipamentos importados
                      </p>
                      {importResult.error_count > 0 && (
                        <p className="text-red-800">
                          ✗ Erros: {importResult.error_count} linhas com erro
                        </p>
                      )}
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Detalhes dos erros:</p>
                        <ul className="text-xs text-gray-700 space-y-1 max-h-32 overflow-y-auto">
                          {importResult.errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseImportDialog} data-testid="cancel-import-button">
              {importResult ? 'Fechar' : 'Cancelar'}
            </Button>
            {!importResult && (
              <Button onClick={handleImport} disabled={importing || !importFile} data-testid="confirm-import-button">
                {importing ? 'Importando...' : 'Importar'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentList;