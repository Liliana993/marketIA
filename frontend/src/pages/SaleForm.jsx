import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ShoppingCart, Package, ScanBarcode } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, salesApi, combosApi } from '../api/api';
import { Button, Input, Card, Loading } from '../components/ui';

function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

export default function SaleForm() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [items, setItems] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, combosRes] = await Promise.all([
          productsApi.getAll(),
          combosApi.getAll({ active: 'true' }),
        ]);
        setProducts(productsRes.data.products || []);
        setCombos(combosRes.data.combos || []);
      } catch {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedProduct = products.find((p) => String(p._id) === String(selectedProductId));

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Seleccioná un producto');
      return;
    }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast.error('Ingresá una cantidad válida');
      return;
    }

    const existingIndex = items.findIndex((i) => i.product === selectedProduct._id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setItems(updated);
    } else {
      setItems((prev) => [
        ...prev,
        {
          product: selectedProduct._id,
          productName: selectedProduct.name,
          quantity: qty,
          unitPrice: selectedProduct.salePrice || 0,
          subtotal: qty * (selectedProduct.salePrice || 0),
        },
      ]);
    }
    setSelectedProductId('');
    setQuantity('');
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCombo = (combo) => {
    const newItems = [...items];
    for (const comboItem of combo.items) {
      const product = products.find((p) => String(p._id) === String(comboItem.product._id || comboItem.product));
      if (!product) {
        toast.error(`Producto del combo no encontrado`);
        continue;
      }
      const existingIndex = newItems.findIndex((i) => i.product === product._id);
      if (existingIndex >= 0) {
        newItems[existingIndex].quantity += comboItem.quantity;
        newItems[existingIndex].subtotal = newItems[existingIndex].quantity * newItems[existingIndex].unitPrice;
      } else {
        newItems.push({
          product: product._id,
          productName: product.name,
          quantity: comboItem.quantity,
          unitPrice: product.salePrice || 0,
          subtotal: comboItem.quantity * (product.salePrice || 0),
          comboName: combo.name,
        });
      }
    }
    setItems(newItems);
    toast.success(`Combo "${combo.name}" agregado`);
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleBarcodeScan = async (e) => {
    if (e.key !== 'Enter') return;
    const sku = barcodeInput.trim();
    if (!sku) return;

    try {
      const { data } = await productsApi.getBySku(sku);
      const product = data.product;
      if (!product) {
        toast.error('Producto no encontrado');
        return;
      }

      const qty = 1;
      const existingIndex = items.findIndex((i) => i.product === product._id);
      if (existingIndex >= 0) {
        const updated = [...items];
        updated[existingIndex].quantity += qty;
        updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
        setItems(updated);
      } else {
        setItems((prev) => [
          ...prev,
          {
            product: product._id,
            productName: product.name,
            quantity: qty,
            unitPrice: product.salePrice || 0,
            subtotal: qty * (product.salePrice || 0),
          },
        ]);
      }
      toast.success(`${product.name} x${qty}`);
      setBarcodeInput('');
    } catch {
      toast.error('Producto no encontrado con ese código');
    }
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Agregá al menos un producto');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await salesApi.create({ items });
      toast.success('Venta registrada correctamente');

      const saleId = data.sale?._id || 'N/A';
      const ticketLines = items.map(
        (item) => ({
          name: item.productName,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          combo: item.comboName || null,
        })
      );

      const ticketHtml = `
        <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 13px; margin: 0; padding: 20px; width: 260px; }
            .center { text-align: center; }
            .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
            .title { font-size: 20px; font-weight: bold; margin: 5px 0; }
            .subtitle { font-size: 10px; color: #666; margin-bottom: 10px; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .item-name { font-weight: bold; }
            .item-detail { font-size: 11px; color: #555; padding-left: 10px; }
            .combo-badge { font-size: 10px; background: #eee; padding: 1px 4px; border-radius: 3px; }
            .total { font-size: 15px; font-weight: bold; margin-top: 5px; }
            .footer { font-size: 10px; color: #888; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="center">
            <svg class="logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" rx="30" fill="#6366f1"/>
              <text x="100" y="85" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" font-weight="bold" fill="white">M</text>
              <text x="100" y="135" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="white">MARKETIA</text>
              <text x="100" y="158" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="rgba(255,255,255,0.7)">Tu minimercado inteligente</text>
            </svg>
            <div class="title">MARKETIA</div>
            <div class="subtitle">Tu minimercado inteligente</div>
          </div>
          <div class="line"></div>
          <div class="row"><span>Venta:</span><span>#${saleId.slice(-6).toUpperCase()}</span></div>
          <div class="row"><span>Fecha:</span><span>${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}</span></div>
          <div class="line"></div>
          ${ticketLines.map((item) => `
            <div class="row">
              <span class="item-name">${item.name} x${item.qty}</span>
              <span>${formatCurrency(item.subtotal)}</span>
            </div>
            <div class="row item-detail">
              <span>${item.qty} x ${formatCurrency(item.unitPrice)}</span>
              ${item.combo ? `<span class="combo-badge">${item.combo}</span>` : ''}
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="row total"><span>TOTAL:</span><span>${formatCurrency(total)}</span></div>
          <div class="line"></div>
          <div class="center footer">¡Gracias por tu compra!</div>
        </body>
        </html>
      `;

      if (window.confirm('Venta realizada con éxito.\n\n¿Querés imprimir el ticket?')) {
        const printWindow = window.open('', '_blank', 'width=320,height=600');
        printWindow.document.write(ticketHtml);
        printWindow.document.close();
        printWindow.print();
      }

      setItems([]);
      setSelectedProductId('');
      setQuantity('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Registrar Venta</h1>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ScanBarcode className="w-5 h-5" />
          Escanear código de barras
        </h2>
        <input
          type="text"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeScan}
          placeholder="Escaneá o escribí el código..."
          autoFocus
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <p className="text-xs text-gray-400 mt-2">Apuntá el lector y escaneá para agregar el producto directo (x1)</p>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Agregar producto manualmente</h2>
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-1">Producto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar producto...</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {formatCurrency(p.salePrice)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Cantidad"
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />
          <Button type="submit">
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </form>
      </Card>

      {combos.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Vender Combo
          </h2>
          <p className="text-sm text-gray-500 mb-4">Seleccioná un combo para agregar todos sus productos de una vez.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {combos.map((combo) => (
              <button
                key={combo._id}
                onClick={() => handleAddCombo(combo)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition"
              >
                <div className="font-medium text-gray-900">{combo.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {combo.items.length} productos — {formatCurrency(combo.comboPrice)}
                </div>
                <div className="text-xs text-success-600 mt-1">
                  Ahorrás {formatCurrency(combo.discount)}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Detalle de la venta</h2>
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay productos agregados.</p>
        ) : (
          <>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Producto</th>
                  <th className="pb-2 text-right">Cantidad</th>
                  <th className="pb-2 text-right">Precio unit.</th>
                  <th className="pb-2 text-right">Subtotal</th>
                  <th className="pb-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3">{item.productName}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Total: {formatCurrency(total)}
              </span>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Procesando...' : 'Confirmar Venta'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
