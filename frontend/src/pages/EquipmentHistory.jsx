import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API, toast } from '@/App';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock } from 'lucide-react';

const EquipmentHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [equipmentRes, historyRes] = await Promise.all([
        axios.get(`${API}/equipments/${id}`),
        axios.get(`${API}/equipments/${id}/history`)
      ]);
      setEquipment(equipmentRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      toast.error('Erro ao carregar histórico');
      navigate('/equipments');
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'created': 'Criado',
      'updated': 'Atualizado',
      'loaned': 'Emprestado',
      'returned': 'Devolvido',
      'termo_uploaded': 'Termo Anexado',
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    const colors = {
      'created': 'text-green-600',
      'updated': 'text-blue-600',
      'loaned': 'text-yellow-600',
      'returned': 'text-purple-600',
      'termo_uploaded': 'text-indigo-600',
    };
    return colors[action] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="equipment-history-page">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/equipments')} data-testid="back-button">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico do Equipamento</h1>
          <p className="text-gray-600 mt-1">
            Patrimônio: {equipment?.numero_patrimonio} - {equipment?.marca} {equipment?.modelo}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma movimentação registrada</p>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid={`history-entry-${index}`}
                >
                  <div className={`p-2 rounded-full bg-gray-100 ${getActionColor(entry.action)}`}>
                    <Clock size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${getActionColor(entry.action)}`}>
                        {getActionLabel(entry.action)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{entry.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Por: {entry.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentHistory;