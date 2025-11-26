import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API, toast } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, CheckCircle } from 'lucide-react';

const DEPARTAMENTOS = [
  'AUDITÓRIO', 'PROTOCOLO', 'SEVESC', 'SEGRE', 'ECC', 'SEPES',
  'SALA DE APOIO-SUPERVISÃO', 'SEFREP', 'URE', 'AT', 'SEINTEC',
  'VIDEO CONFERENCIA', 'SALA DO PREGÃO', 'SECOMSE', 'SEFIN',
  'SEAFIN', 'SALA DE INFORMÁTICA', 'CDP', 'SALA DE REUNIÃO',
  'BIBLIOTECA', 'CAPACITAÇÃO 1', 'ESE', 'Outros'
];

const PublicLoanRequest = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
      const response = await axios.get(`${API}/public/equipments/available`);
      setAvailableEquipments(response.data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
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
      await axios.post(`${API}/public/loan-request`, {
        ...formData,
        data_emprestimo: new Date(formData.data_emprestimo).toISOString(),
        data_prevista_devolucao: new Date(formData.data_prevista_devolucao).toISOString(),
        equipments: selectedEquipments,
      });
      toast.success('Solicitação de empréstimo enviada com sucesso!');
      setSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = () => {
    setSuccess(false);
    setSelectedEquipments([]);
    setFormData({
      nome_solicitante: '',
      departamento_solicitante: '',
      data_emprestimo: new Date().toISOString().split('T')[0],
      data_prevista_devolucao: '',
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Card className="w-full max-w-md" data-testid="success-card">
          <CardContent className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={48} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Enviada!</h2>
            <p className="text-gray-600 mb-6">
              Sua solicitação de empréstimo foi registrada com sucesso. O administrador será notificado.
            </p>
            <div className="space-y-3">
              <Button onClick={handleNewRequest} className="w-full" data-testid="new-request-button">
                Nova Solicitação
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitação de Empréstimo</h1>
          <p className="text-gray-600">Preencha o formulário para solicitar equipamentos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Info */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Dados</CardTitle>
              <CardDescription>Informe seus dados para a solicitação</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_solicitante">Nome Completo *</Label>
                  <Input
                    id="nome_solicitante"
                    value={formData.nome_solicitante}
                    onChange={(e) => setFormData({ ...formData, nome_solicitante: e.target.value })}
                    required
                    placeholder="Digite seu nome completo"
                    data-testid="public-nome-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento_solicitante">Departamento *</Label>
                  <Select
                    value={formData.departamento_solicitante}
                    onValueChange={(value) => setFormData({ ...formData, departamento_solicitante: value })}
                    required
                  >
                    <SelectTrigger data-testid="public-departamento-select">
                      <SelectValue placeholder="Selecione seu departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_emprestimo">Data de Retirada *</Label>
                  <Input
                    id="data_emprestimo"
                    type="date"
                    value={formData.data_emprestimo}
                    onChange={(e) => setFormData({ ...formData, data_emprestimo: e.target.value })}
                    required
                    data-testid="public-data-emprestimo-input"
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
                    data-testid="public-data-prevista-input"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || selectedEquipments.length === 0} 
                    className="w-full"
                    data-testid="public-submit-button"
                  >
                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Equipment Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Equipamentos</CardTitle>
                <CardDescription>Pesquise e selecione os equipamentos desejados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por patrimônio, marca ou modelo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="public-search-input"
                  />
                </div>

                {searchTerm && filteredEquipments.length > 0 && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {filteredEquipments.map((equipment) => (
                      <div
                        key={equipment.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => addEquipment(equipment.numero_patrimonio)}
                        data-testid={`public-equipment-${equipment.id}`}
                      >
                        <div className="font-medium text-gray-900">{equipment.numero_patrimonio}</div>
                        <div className="text-sm text-gray-600">
                          {equipment.tipo_equipamento} - {equipment.marca} {equipment.modelo}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Departamento: {equipment.departamento_atual}
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

                {!searchTerm && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Digite para buscar equipamentos disponíveis
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
                          className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                          data-testid={`public-selected-${patrimonio}`}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{patrimonio}</div>
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
                            data-testid={`public-remove-${patrimonio}`}
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
    </div>
  );
};

export default PublicLoanRequest;