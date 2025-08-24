import PDFDocument from 'pdfkit';

export async function createReportPdfBuffer(product: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('Product Transparency Report', { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Product: ${product.name}`);
    doc.text(`Company: ${product.companyId}`);
    doc.moveDown();
    doc.fontSize(12).text('Metadata:');
    doc.font('Courier').text(JSON.stringify(product.metadata, null, 2));
    doc.moveDown();
    if (product.questions?.length) {
      doc.font('Helvetica').fontSize(12).text('Questions & Answers:');
      doc.moveDown(0.5);
      product.questions.forEach((q: any, idx: number) => {
        doc.text(`${idx + 1}. ${q.text}`);
        if (q.answer) doc.text(`   Answer: ${q.answer}`);
        doc.moveDown(0.5);
      });
    }
    doc.end();
  });
}


