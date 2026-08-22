import { useState, useEffect } from 'react';
import { Megaphone, Check, X, RefreshCw, Copy, Eye, MessageCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { promotionsApi } from '../api/api';
import { Button, Card, Badge, Loading } from '../components/ui';
import { generateComboImage } from '../utils/generateComboImage';

const statusMap = {
  pending: { label: 'Pendiente', variant: 'warning' },
  generated: { label: 'Generado', variant: 'brand' },
  approved: { label: 'Aprobado', variant: 'success' },
  published: { label: 'Publicado', variant: 'success' },
  rejected: { label: 'Rechazado', variant: 'danger' },
  failed: { label: 'Error', variant: 'danger' },
};

const channelLabels = { instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp' };

function formatContent(content) {
  if (!content) return '';
  let text = '';
  if (content.title) text += `*${content.title}*\n\n`;
  if (content.text) text += `${content.text}\n\n`;
  if (content.cta) text += `👉 ${content.cta}\n`;
  if (content.hashtags?.length) text += `\n${content.hashtags.map((h) => `#${h}`).join(' ')}`;
  return text.trim();
}

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const { data } = await promotionsApi.getAll();
      setPromotions(data.promotions || []);
    } catch {
      toast.error('Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await promotionsApi.approve(id);
      toast.success('Publicación aprobada');
      loadPromotions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al aprobar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('¿Rechazar esta publicación?')) return;
    setActionLoading(id);
    try {
      await promotionsApi.reject(id);
      toast.success('Publicación rechazada');
      loadPromotions();
    } catch {
      toast.error('Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (id) => {
    setActionLoading(id);
    try {
      await promotionsApi.retry(id);
      toast.success('Regenerando contenido...');
      loadPromotions();
    } catch {
      toast.error('Error al reintentar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (content) => {
    const text = formatContent(content);
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handleSendWhatsApp = (content) => {
    const text = formatContent(content);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePreview = async (promo) => {
    if (previewId === promo._id) {
      setPreviewId(null);
      setPreviewImage(null);
      return;
    }
    setPreviewId(promo._id);
    setPreviewImage(null);
    if (promo.combo) {
      setGeneratingImage(true);
      try {
        const imageData = await generateComboImage(promo.combo);
        setPreviewImage(imageData);
      } catch {
        // silently fail - image is optional
      } finally {
        setGeneratingImage(false);
      }
    }
  };

  const handleDownloadImage = (comboName) => {
    const link = document.createElement('a');
    link.download = `combo-${comboName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = previewImage;
    link.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    setActionLoading(id);
    try {
      await promotionsApi.remove(id);
      toast.success('Publicación eliminada');
      loadPromotions();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loading text="Cargando publicaciones..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="w-6 h-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Publicaciones</h1>
      </div>

      <p className="text-sm text-gray-500">
        Generá contenido promocional para tus combos y copialo para publicar en WhatsApp, Instagram o Facebook.
      </p>

      {promotions.length === 0 ? (
        <Card className="p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Todavía no hay publicaciones.</p>
          <p className="text-sm text-gray-400 mt-2">Andá a Combos y presioná "Promocionar" en un combo.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo) => {
            const status = statusMap[promo.status] || statusMap.pending;
            const hasContent = promo.generatedContent?.text;
            const isExpanded = previewId === promo._id;

            return (
              <Card key={promo._id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {promo.combo?.name || 'Combo'}
                        </h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge>{channelLabels[promo.channel] || promo.channel}</Badge>
                      </div>

                      <div className="text-sm text-gray-500">
                        <span>${promo.combo?.comboPrice}</span>
                        {promo.combo?.discount > 0 && (
                          <span className="text-success-600 ml-2">
                            Ahorrás ${promo.combo.discount}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(promo.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasContent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(promo)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {promo.status === 'generated' && (
                        <>
                          <Button variant="success" size="sm" onClick={() => handleApprove(promo._id)} loading={actionLoading === promo._id}>
                            <Check className="w-4 h-4 mr-1" /> Aprobar
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleReject(promo._id)} loading={actionLoading === promo._id}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {(promo.status === 'failed' || promo.status === 'rejected') && (
                        <Button variant="secondary" size="sm" onClick={() => handleRetry(promo._id)} loading={actionLoading === promo._id}>
                          <RefreshCw className="w-4 h-4 mr-1" /> Reintentar
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(promo._id)} loading={actionLoading === promo._id}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && hasContent && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Vista previa del contenido</h4>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handleCopy(promo.generatedContent)}>
                            <Copy className="w-4 h-4 mr-1" /> Copiar
                          </Button>
                          {promo.channel === 'whatsapp' && (
                            <Button size="sm" onClick={() => handleSendWhatsApp(promo.generatedContent)}>
                              <MessageCircle className="w-4 h-4 mr-1" /> Enviar por WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>

                      {previewImage && (
                        <div className="mb-3">
                          <img src={previewImage} alt={promo.combo?.name} className="w-full max-w-sm rounded-lg border" />
                          <button
                            onClick={() => handleDownloadImage(promo.combo?.name || 'combo')}
                            className="mt-2 text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" /> Descargar imagen
                          </button>
                        </div>
                      )}
                      {generatingImage && (
                        <p className="text-xs text-gray-400 mb-3">Generando imagen del combo...</p>
                      )}

                      <div className="bg-white p-4 rounded-lg border border-gray-100 whitespace-pre-wrap text-sm text-gray-800">
                        {formatContent(promo.generatedContent)}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        Copiá el texto y pegalo en {channelLabels[promo.channel]} para publicar.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
