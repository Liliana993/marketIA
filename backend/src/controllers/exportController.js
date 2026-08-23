import * as exportService from '../services/exportService.js';

export const exportProducts = async (req, res, next) => {
  try {
    const format = req.query.format || 'excel';

    if (format === 'pdf') {
      const pdfBuffer = await exportService.exportProductsPdf();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=productos.pdf');
      return res.send(Buffer.from(pdfBuffer));
    }

    const excelBuffer = await exportService.exportProductsExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=productos.xlsx');
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    console.error('Export products error:', error);
    next(error);
  }
};

export const exportSales = async (req, res, next) => {
  try {
    const format = req.query.format || 'excel';

    if (format === 'pdf') {
      const pdfBuffer = await exportService.exportSalesPdf(req.query);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=ventas.pdf');
      return res.send(pdfBuffer);
    }

    const excelBuffer = await exportService.exportSalesExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ventas.xlsx');
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    next(error);
  }
};
