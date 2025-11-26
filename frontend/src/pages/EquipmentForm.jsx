import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API, toast } from '@/App';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft, Upload } from 'lucide-react';

const DEPARTAMENTOS = [
  'AUDITÓRIO', 'PROTOCOLO', 'SEVESC', 'SEGRE', 'ECC', 'SEPES',
  'SALA DE APOIO-SUPERVISÃO', 'SEFREP', 'URE', 'AT', 'SEINTEC',
  'VIDEO CONFERENCIA', 'SALA DO PREGÃO', 'SECOMSE', 'SEFIN',
  'SEAFIN', 'SALA DE INFORMÁTICA', 'CDP', 'SALA DE REUNIÃO',
  'BIBLIOTECA', 'CAPACITAÇÃO 1', 'ESE', 'Outros'
];

const TIPOS_EQUIPAMENTO = ['Notebook', 'Desktop', 'Celular', 'Tablet', 'Monitor', 'Impressora', 'Outros'];
const STATUS_OPTIONS = ['Disponível', 'Em uso', 'Emprestado', 'Manutenção', 'Baixado'];

const EquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [formData, setFormData] = useState({
    numero_patrimonio: '',
    numero_serie: '',
    marca: '',
    modelo: '',
    tipo_equipamento: '',
    departamento_atual: '',
    responsavel_atual: '',
    status: 'Disponível',
  });

  useEffect(() => {
    if (id) {
      fetchEquipment();
    }
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipments/${id}`);
      setFormData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar equipamento');
      navigate('/equipments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await axios.put(`${API}/equipments/${id}`, formData);
        toast.success('Equipamento atualizado com sucesso');
      } else {
        await axios.post(`${API}/equipments`, formData);
        toast.success('Equipamento criado com sucesso');
      }
      navigate('/equipments');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar equipamento');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }

    if (!id) {
      toast.error('Salve o equipamento primeiro antes de anexar o termo');
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API}/equipments/${id}/upload-termo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Termo anexado com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao anexar termo');
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="equipment-form-page">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/equipments')} data-testid="back-button">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Editar Equipamento' : 'Novo Equipamento'}
          </h1>
          <p className="text-gray-600 mt-1">Preencha os dados do equipamento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numero_patrimonio">Número de Patrimônio *</Label>
                <Input
                  id="numero_patrimonio"
                  value={formData.numero_patrimonio}
                  onChange={(e) => setFormData({ ...formData, numero_patrimonio: e.target.value })}
                  required
                  disabled={id ? true : false}
                  data-testid="numero-patrimonio-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_serie">Número de Série *</Label>
                <Input
                  id="numero_serie"
                  value={formData.numero_serie}
                  onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                  required
                  data-testid="numero-serie-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  required
                  data-testid="marca-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  required
                  data-testid="modelo-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_equipamento">Tipo de Equipamento *</Label>
                <Select
                  value={formData.tipo_equipamento}
                  onValueChange={(value) => setFormData({ ...formData, tipo_equipamento: value })}
                  required
                >
                  <SelectTrigger data-testid="tipo-equipamento-select">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_EQUIPAMENTO.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departamento_atual">Departamento Atual *</Label>
                <Select
                  value={formData.departamento_atual}
                  onValueChange={(value) => setFormData({ ...formData, departamento_atual: value })}
                  required
                >
                  <SelectTrigger data-testid="departamento-select">
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
                <Label htmlFor="responsavel_atual">Responsável Atual</Label>
                <Input
                  id="responsavel_atual"
                  value={formData.responsavel_atual}
                  onChange={(e) => setFormData({ ...formData, responsavel_atual: e.target.value })}
                  data-testid="responsavel-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger data-testid="status-select">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {id && (
              <div className="space-y-2">
                <Label htmlFor="termo">Termo de Responsabilidade (PDF)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="termo"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploadingPdf}
                    data-testid="termo-input"
                  />
                  {uploadingPdf && <span className="text-sm text-gray-500">Enviando...</span>}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/equipments')}
                data-testid="cancel-button"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} data-testid="submit-button">
                {loading ? 'Salvando...' : id ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentForm;