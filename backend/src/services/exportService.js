import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as productRepo from '../repositories/productRepository.js';
import * as saleRepo from '../repositories/saleRepository.js';

const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString('es-AR')}`;

export const exportProductsExcel = async () => {
  const { products } = await productRepo.findAll({}, { limit: 1000 });

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
  const { products } = await productRepo.findAll({}, { limit: 1000 });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape', bufferPages: true });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Productos', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Total: ${products.length} productos`, { align: 'center' });
    doc.moveDown(1);

    const tableTop = doc.y;
    const colWidths = [120, 80, 90, 70, 70, 50, 70, 60];
    const headers = ['Nombre', 'SKU', 'Categoría', 'P. Compra', 'P. Venta', 'Stock', 'Stock Mín.', 'Unidad'];

    doc.font('Helvetica-Bold').fontSize(9);
    let x = 40;
    headers.forEach((h, i) => {
      doc.text(h, x, tableTop, { width: colWidths[i] });
      x += colWidths[i];
    });

    doc.moveTo(40, tableTop + 15).lineTo(40 + colWidths.reduce((a, b) => a + b), tableTop + 15).stroke();

    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;
    products.forEach((p) => {
      if (y > 550) {
        doc.addPage();
        y = 40;
      }
      x = 40;
      const vals = [p.name, p.sku || '', p.category?.name || '', formatCurrency(p.purchasePrice), formatCurrency(p.salePrice), String(p.stock), String(p.minimumStock), p.unit];
      vals.forEach((v, i) => {
        doc.text(String(v).substring(0, 20), x, y, { width: colWidths[i] });
        x += colWidths[i];
      });
      y += 15;
    });

    doc.end();
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
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape', bufferPages: true });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Ventas', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Total: ${sales.length} ventas — Facturación: ${formatCurrency(totalRevenue)}`, { align: 'center' });
    doc.moveDown(1);

    const tableTop = doc.y;
    const colWidths = [100, 250, 80, 80];
    const headers = ['Fecha', 'Productos', 'Items', 'Total'];

    doc.font('Helvetica-Bold').fontSize(9);
    let x = 40;
    headers.forEach((h, i) => {
      doc.text(h, x, tableTop, { width: colWidths[i] });
      x += colWidths[i];
    });

    doc.moveTo(40, tableTop + 15).lineTo(40 + colWidths.reduce((a, b) => a + b), tableTop + 15).stroke();

    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;
    sales.forEach((s) => {
      if (y > 550) {
        doc.addPage();
        y = 40;
      }
      const productNames = (s.items || []).map((i) => `${i.productName || i.product?.name || ''} x${i.quantity}`).join(', ').substring(0, 45);
      x = 40;
      const vals = [new Date(s.createdAt).toLocaleDateString('es-AR'), productNames, String(s.items?.length || 0), formatCurrency(s.total)];
      vals.forEach((v, i) => {
        doc.text(String(v), x, y, { width: colWidths[i] });
        x += colWidths[i];
      });
      y += 15;
    });

    doc.end();
  });
};
