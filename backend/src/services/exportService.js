import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as productRepo from '../repositories/productRepository.js';
import * as saleRepo from '../repositories/saleRepository.js';

const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString('es-AR')}`;

const sanitizeText = (text) => {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ');
};

export const exportProductsExcel = async () => {
  const products = await productRepo.findAll({}, { limit: 1000 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Productos');

  sheet.columns = [
    { header: 'Nombre', key: 'name', width: 30 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Categoría', key: 'category', width: 20 },
    { header: 'P. Compra', key: 'purchasePrice', width: 15 },
    { header: 'P. Venta', key: 'salePrice', width: 15 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Stock Mín.', key: 'minimumStock', width: 12 },
    { header: 'Unidad', key: 'unit', width: 12 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

  products.forEach((p) => {
    sheet.addRow({
      name: p.name,
      sku: p.sku || '',
      category: p.category?.name || '',
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      stock: p.stock,
      minimumStock: p.minimumStock,
      unit: p.unit,
    });
  });

  return workbook.xlsx.writeBuffer();
};

export const exportProductsPdf = async () => {
  const products = await productRepo.findAll({}, { limit: 1000 });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    try {
      doc.fontSize(18).text(sanitizeText('Reporte de Productos'), { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(sanitizeText(`Total: ${Array.isArray(products) ? products.length : 0} productos`), { align: 'center' });
      doc.moveDown(1);

      const headers = ['Nombre', 'SKU', 'Categoria', 'P.Compra', 'P.Venta', 'Stock', 'Stock Min', 'Unidad'];
      doc.fontSize(9).font('Helvetica-Bold').text(headers.join('    '));
      doc.font('Helvetica').fontSize(8);

      const items = Array.isArray(products) ? products : [];
      items.forEach((p) => {
        const name = sanitizeText(p.name || '').substring(0, 25);
        const sku = sanitizeText(p.sku || '');
        const cat = sanitizeText(p.category?.name || '');
        const pp = formatCurrency(p.purchasePrice);
        const sp = formatCurrency(p.salePrice);
        const stock = String(p.stock ?? 0);
        const min = String(p.minimumStock ?? 0);
        const unit = sanitizeText(p.unit || '');
        doc.text(`${name}    ${sku}    ${cat}    ${pp}    ${sp}    ${stock}    ${min}    ${unit}`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const exportSalesExcel = async (query = {}) => {
  const filter = {};
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate + 'T23:59:59');
  }

  const sales = await saleRepo.findAll(filter, { limit: 1000 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Ventas');

  sheet.columns = [
    { header: 'Fecha', key: 'date', width: 20 },
    { header: 'Productos', key: 'products', width: 40 },
    { header: 'Cant. Items', key: 'itemCount', width: 12 },
    { header: 'Total', key: 'total', width: 15 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

  sales.forEach((s) => {
    const productNames = (s.items || []).map((i) => `${i.productName || i.product?.name || ''} x${i.quantity}`).join(', ');
    sheet.addRow({
      date: new Date(s.createdAt).toLocaleDateString('es-AR'),
      products: productNames.substring(0, 60),
      itemCount: s.items?.length || 0,
      total: s.total,
    });
  });

  return workbook.xlsx.writeBuffer();
};

export const exportSalesPdf = async (query = {}) => {
  const filter = {};
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate + 'T23:59:59');
  }

  const sales = await saleRepo.findAll(filter, { limit: 1000 });
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    try {
      doc.fontSize(18).text(sanitizeText('Reporte de Ventas'), { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(sanitizeText(`Total: ${sales.length} ventas - Facturacion: ${formatCurrency(totalRevenue)}`), { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(9).font('Helvetica-Bold').text('Fecha    Productos    Items    Total');
      doc.font('Helvetica').fontSize(8);

      sales.forEach((s) => {
        const date = new Date(s.createdAt).toLocaleDateString('es-AR');
        const prods = (s.items || []).map((i) => `${sanitizeText(i.productName || i.product?.name || '')} x${i.quantity}`).join(', ').substring(0, 50);
        const items = String(s.items?.length || 0);
        const total = formatCurrency(s.total);
        doc.text(`${date}    ${prods}    ${items}    ${total}`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
