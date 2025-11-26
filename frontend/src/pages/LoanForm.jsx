import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API, toast } from '@/App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';

const DEPARTAMENTOS = [
  'AUDITÓRIO', 'PROTOCOLO', 'SEVESC', 'SEGRE', 'ECC', 'SEPES',
  'SALA DE APOIO-SUPERVISÃO', 'SEFREP', 'URE', 'AT', 'SEINTEC',
  'VIDEO CONFERENCIA', 'SALA DO PREGÃO', 'SECOMSE', 'SEFIN',
  'SEAFIN', 'SALA DE INFORMÁTICA', 'CDP', 'SALA DE REUNIÃO',
  'BIBLIOTECA', 'CAPACITAÇÃO 1', 'ESE', 'Outros'
];

const LoanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableEquipments, setAvailableEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [formData, setFormData] = useState({
    nome_solicitante: '',
    departamento_solicitante: '',
    data_emprestimo: new Date().toISOString().split('T')[0],
    data_prevista_devolucao: '',
  });

  useEffect(() => {
    fetchAvailableEquipments();
  }, []);

  const fetchAvailableEquipments = async () => {
    try {
      const response = await axios.get(`${API}/equipments`, {
        params: { status: 'Disponível' }
      });
      setAvailableEquipments(response.data);
    } catch (error) {
      toast.error('Erro ao carregar equipamentos disponíveis');
    }
  };

  const filteredEquipments = availableEquipments.filter(eq => {
    const searchLower = searchTerm.toLowerCase();
    return (
      eq.numero_patrimonio.toLowerCase().includes(searchLower) ||
      eq.marca.toLowerCase().includes(searchLower) ||
      eq.modelo.toLowerCase().includes(searchLower) ||
      eq.tipo_equipamento.toLowerCase().includes(searchLower)
    );
  });

  const addEquipment = (patrimonio) => {
    if (!selectedEquipments.includes(patrimonio)) {
      setSelectedEquipments([...selectedEquipments, patrimonio]);
      setSearchTerm('');
    }
  };

  const removeEquipment = (patrimonio) => {
    setSelectedEquipments(selectedEquipments.filter(p => p !== patrimonio));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedEquipments.length === 0) {
      toast.error('Adicione pelo menos um equipamento');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/loans`, {
        ...formData,
        data_emprestimo: new Date(formData.data_emprestimo).toISOString(),
        data_prevista_devolucao: new Date(formData.data_prevista_devolucao).toISOString(),
        equipments: selectedEquipments,
      });
      toast.success('Empréstimo criado com sucesso');
      navigate('/loans');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar empréstimo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="loan-form-page">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/loans')} data-testid="back-button">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Empréstimo</h1>
          <p className="text-gray-600 mt-1">Preencha os dados do empréstimo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Info */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Solicitante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_solicitante">Nome do Solicitante *</Label>
                <Input
                  id="nome_solicitante"
                  value={formData.nome_solicitante}
                  onChange={(e) => setFormData({ ...formData, nome_solicitante: e.target.value })}
                  required
                  data-testid="nome-solicitante-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departamento_solicitante">Departamento *</Label>
                <Select
                  value={formData.departamento_solicitante}
                  onValueChange={(value) => setFormData({ ...formData, departamento_solicitante: value })}
                  required
                >
                  <SelectTrigger data-testid="departamento-solicitante-select">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTAMENTOS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_emprestimo">Data do Empréstimo *</Label>
                <Input
                  id="data_emprestimo"
                  type="date"
                  value={formData.data_emprestimo}
                  onChange={(e) => setFormData({ ...formData, data_emprestimo: e.target.value })}
                  required
                  data-testid="data-emprestimo-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_prevista_devolucao">Data Prevista de Devolução *</Label>
                <Input
                  id="data_prevista_devolucao"
                  type="date"
                  value={formData.data_prevista_devolucao}
                  onChange={(e) => setFormData({ ...formData, data_prevista_devolucao: e.target.value })}
                  required
                  min={formData.data_emprestimo}
                  data-testid="data-prevista-input"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/loans')}
                  data-testid="cancel-loan-button"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} data-testid="submit-loan-button">
                  {loading ? 'Criando...' : 'Criar Empréstimo'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Equipment Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Equipamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por patrimônio, marca ou modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-equipment-input"
                />
              </div>

              {searchTerm && filteredEquipments.length > 0 && (
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {filteredEquipments.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => addEquipment(equipment.numero_patrimonio)}
                      data-testid={`equipment-option-${equipment.id}`}
                    >
                      <div className="font-medium">{equipment.numero_patrimonio}</div>
                      <div className="text-sm text-gray-600">
                        {equipment.tipo_equipamento} - {equipment.marca} {equipment.modelo}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && filteredEquipments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum equipamento disponível encontrado
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Selecionados ({selectedEquipments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEquipments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum equipamento selecionado
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedEquipments.map((patrimonio) => {
                    const equipment = availableEquipments.find(e => e.numero_patrimonio === patrimonio);
                    return (
                      <div
                        key={patrimonio}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`selected-equipment-${patrimonio}`}
                      >
                        <div>
                          <div className="font-medium">{patrimonio}</div>
                          {equipment && (
                            <div className="text-sm text-gray-600">
                              {equipment.tipo_equipamento} - {equipment.marca} {equipment.modelo}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquipment(patrimonio)}
                          data-testid={`remove-equipment-${patrimonio}`}
                        >
                          <X size={16} className="text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanForm;