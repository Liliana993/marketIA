import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone, Sparkles, Image as ImageIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { combosApi, assistantApi } from '../api/api';
import { Button, Card, Badge, Loading } from '../components/ui';
import { generateComboImage } from '../utils/generateComboImage';

const CHANNELS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function ComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [comboImage, setComboImage] = useState(null);

  useEffect(() => {
    const loadCombo = async () => {
      try {
        const { data } = await combosApi.getById(id);
        setCombo(data.combo);
      } catch {
        toast.error('Error al cargar el combo');
        navigate('/combos');
      } finally {
        setLoading(false);
      }
    };
    loadCombo();
  }, [id, navigate]);

  const handlePromote = async (channel) => {
    setPromoting(true);
    setShowChannels(false);
    try {
      const { data } = await combosApi.promote(id, channel);
      toast.success('Contenido generado. Miralo en Publicaciones.');
      if (data.warning) toast.warning(data.warning);
    } catch {
      toast.error('Error al promocionar el combo');
    } finally {
      setPromoting(false);
    }
  };

  const handleLoadAiSuggestions = async () => {
    setLoadingAi(true);
    try {
      const { data } = await assistantApi.comboSuggestions();
      setAiSuggestions(data.suggestions);
    } catch {
      toast.error('Error al obtener sugerencias');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      const imageData = await generateComboImage(combo);
      setComboImage(imageData);
      toast.success('Imagen generada');
    } catch {
      toast.error('Error al generar la imagen');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.download = `combo-${combo.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = comboImage;
    link.click();
  };

  if (loading) return <Loading text="Cargando combo..." />;
  if (!combo) return null;

  const savingsPercent =
    combo.regularPrice > 0
      ? ((combo.discount / combo.regularPrice) * 100).toFixed(1)
      : 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">{combo.name}</h1>
        <Badge variant={combo.active ? 'success' : 'danger'}>
          {combo.active ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <Card className="p-6 space-y-4">
        {combo.description && (
          <p className="text-gray-600">{combo.description}</p>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Productos incluidos</h2>
          <div className="divide-y divide-gray-100">
            {combo.items?.map((item, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span className="text-gray-800">{item.product?.name || 'Producto'}</span>
                <div className="flex gap-4">
                  <span className="text-gray-500">
                    ${item.product?.salePrice?.toFixed(2)} c/u
                  </span>
                  <span className="font-medium">x{item.quantity}</span>
                  <span className="font-medium w-20 text-right">
                    ${((item.product?.salePrice || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4 mt-4">
          <div>
            <span className="text-xs text-gray-500 block">Precio regular</span>
            <span className="text-lg font-semibold">${combo.regularPrice?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Precio combo</span>
            <span className="text-lg font-bold text-brand-600">
              ${combo.comboPrice?.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Ahorro</span>
            <span className="text-lg font-semibold text-success-600">
              ${combo.discount?.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Descuento</span>
            <span className="text-lg font-semibold text-warning-600">{savingsPercent}%</span>
          </div>
        </div>

        <div className="pt-4 relative">
          <div className="flex gap-3">
            <Button onClick={() => setShowChannels(!showChannels)} loading={promoting}>
              <Megaphone className="w-4 h-4 mr-2" />
              Promocionar
            </Button>
            <Button variant="secondary" onClick={handleGenerateImage} loading={generatingImage}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Generar imagen
            </Button>
          </div>

          {showChannels && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => handlePromote(ch.value)}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {comboImage && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-500" />
            Imagen del combo
          </h2>
          <img src={comboImage} alt={combo.name} className="w-full rounded-lg border" />
          <div className="mt-4 flex gap-3">
            <Button onClick={handleDownloadImage}>
              <Download className="w-4 h-4 mr-2" />
              Descargar imagen
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Sugerencias de IA
          </h2>
          <Button variant="secondary" size="sm" onClick={handleLoadAiSuggestions} loading={loadingAi}>
            Obtener sugerencias
          </Button>
        </div>

        {aiSuggestions.length > 0 ? (
          <div className="space-y-3">
            {aiSuggestions.map((s, idx) => (
              <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900">{s.name}</h3>
                {s.description && (
                  <p className="text-sm text-purple-700 mt-1">{s.description}</p>
                )}
                {s.reasoning && (
                  <p className="text-xs text-purple-600 mt-1 italic">{s.reasoning}</p>
                )}
                {s.comboPrice != null && (
                  <p className="text-sm font-medium text-purple-800 mt-2">
                    Precio sugerido: ${s.comboPrice.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {loadingAi ? 'Generando sugerencias...' : 'Presioná el botón para obtener sugerencias de IA'}
          </p>
        )}
      </Card>
    </div>
  );
}
