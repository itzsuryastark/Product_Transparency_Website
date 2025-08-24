import PDFDocument from 'pdfkit';

export async function createReportPdfBuffer(product: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error) => reject(error));

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Product Transparency Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Product Information
      doc.fontSize(18).font('Helvetica-Bold').text('Product Information');
      doc.moveDown();
      
      doc.fontSize(12).font('Helvetica-Bold').text('Product Name:');
      doc.fontSize(12).font('Helvetica').text(product.name);
      doc.moveDown();
      
      doc.fontSize(12).font('Helvetica-Bold').text('Company ID:');
      doc.fontSize(12).font('Helvetica').text(product.companyId);
      doc.moveDown(2);

      // Transparency Assessment
      doc.fontSize(18).font('Helvetica-Bold').text('Transparency Assessment');
      doc.moveDown();

      const metadata = product.metadata || {};
      const sections = categorizeMetadata(metadata);
      
      // Basic Information
      if (sections.basic.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Basic Information');
        doc.moveDown();
        sections.basic.forEach(([key, value]) => {
          doc.fontSize(11).font('Helvetica-Bold').text(formatFieldName(key) + ':');
          doc.fontSize(11).font('Helvetica').text(formatFieldValue(value));
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Sustainability Information
      if (sections.sustainability.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Sustainability Information');
        doc.moveDown();
        sections.sustainability.forEach(([key, value]) => {
          doc.fontSize(11).font('Helvetica-Bold').text(formatFieldName(key) + ':');
          doc.fontSize(11).font('Helvetica').text(formatFieldValue(value));
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Materials & Manufacturing
      if (sections.materials.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Materials & Manufacturing');
        doc.moveDown();
        sections.materials.forEach(([key, value]) => {
          doc.fontSize(11).font('Helvetica-Bold').text(formatFieldName(key) + ':');
          doc.fontSize(11).font('Helvetica').text(formatFieldValue(value));
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Certifications & Compliance
      if (sections.certifications.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Certifications & Compliance');
        doc.moveDown();
        sections.certifications.forEach(([key, value]) => {
          doc.fontSize(11).font('Helvetica-Bold').text(formatFieldName(key) + ':');
          doc.fontSize(11).font('Helvetica').text(formatFieldValue(value));
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Additional Information
      if (sections.additional.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Additional Information');
        doc.moveDown();
        sections.additional.forEach(([key, value]) => {
          doc.fontSize(11).font('Helvetica-Bold').text(formatFieldName(key) + ':');
          doc.fontSize(11).font('Helvetica').text(formatFieldValue(value));
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Transparency Score
      const transparencyScore = calculateTransparencyScore(metadata);
      doc.fontSize(16).font('Helvetica-Bold').text('Transparency Score');
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Overall Transparency Rating: ${transparencyScore.score}/100`);
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(transparencyScore.description);
      doc.moveDown(2);

      // Footer
      doc.fontSize(8).font('Helvetica').text('This report was generated automatically by the Product Transparency Platform.', { align: 'center' });
      doc.text('For questions about this report, please contact the product manufacturer.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function categorizeMetadata(metadata: any) {
  const basic = ['product_name', 'product_category', 'origin_country', 'manufacturing_date', 'contact_email'];
  const sustainability = ['sustainability_rating', 'carbon_footprint', 'recyclability', 'packaging_type'];
  const materials = ['materials', 'fabric_composition', 'ingredients_source'];
  const certifications = ['certifications', 'energy_efficiency', 'supplier_info'];
  const additional = ['additional_notes'];

  const sections: any = {
    basic: [],
    sustainability: [],
    materials: [],
    certifications: [],
    additional: []
  };

  Object.entries(metadata).forEach(([key, value]) => {
    if (basic.includes(key)) sections.basic.push([key, value]);
    else if (sustainability.includes(key)) sections.sustainability.push([key, value]);
    else if (materials.includes(key)) sections.materials.push([key, value]);
    else if (certifications.includes(key)) sections.certifications.push([key, value]);
    else if (additional.includes(key)) sections.additional.push([key, value]);
    else sections.additional.push([key, value]);
  });

  return sections;
}

function formatFieldName(key: string): string {
  const nameMap: { [key: string]: string } = {
    product_name: 'Product Name',
    product_category: 'Product Category',
    origin_country: 'Country of Origin',
    manufacturing_date: 'Manufacturing Date',
    contact_email: 'Contact Email',
    sustainability_rating: 'Sustainability Rating',
    carbon_footprint: 'Carbon Footprint',
    recyclability: 'Recyclability',
    packaging_type: 'Packaging Type',
    materials: 'Materials',
    fabric_composition: 'Fabric Composition',
    ingredients_source: 'Ingredients Source',
    certifications: 'Certifications',
    energy_efficiency: 'Energy Efficiency',
    supplier_info: 'Supplier Information',
    additional_notes: 'Additional Notes'
  };
  return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatFieldValue(value: any): string {
  if (typeof value === 'string') {
    // Handle special values
    const valueMap: { [key: string]: string } = {
      'excellent': 'Excellent - Leading industry standards',
      'good': 'Good - Above average practices',
      'average': 'Average - Meets basic requirements',
      'below_average': 'Below Average - Needs improvement',
      'unknown': 'Unknown - Still evaluating',
      'fully_recyclable': 'Fully Recyclable',
      'partially_recyclable': 'Partially Recyclable',
      'not_recyclable': 'Not Recyclable',
      'recyclable': 'Recyclable Packaging',
      'biodegradable': 'Biodegradable Packaging',
      'reusable': 'Reusable Packaging',
      'minimal': 'Minimal Packaging',
      'standard': 'Standard Packaging',
      'clothing': 'Clothing & Apparel',
      'electronics': 'Electronics',
      'food': 'Food & Beverages',
      'cosmetics': 'Cosmetics & Personal Care',
      'furniture': 'Furniture & Home',
      'automotive': 'Automotive',
      'other': 'Other',
      'usa': 'United States',
      'china': 'China',
      'india': 'India',
      'bangladesh': 'Bangladesh',
      'vietnam': 'Vietnam',
      'turkey': 'Turkey',
      'mexico': 'Mexico',
      'all_local': 'All ingredients are locally sourced',
      'mostly_local': 'Most ingredients are locally sourced',
      'some_local': 'Some ingredients are locally sourced',
      'not_local': 'Ingredients are not locally sourced'
    };
    return valueMap[value] || value;
  }
  return String(value);
}

function calculateTransparencyScore(metadata: any): { score: number; description: string } {
  let score = 0;
  let totalPossible = 0;

  // Basic information (20 points)
  if (metadata.product_name) score += 5;
  if (metadata.product_category) score += 5;
  if (metadata.origin_country) score += 5;
  if (metadata.contact_email) score += 5;
  totalPossible += 20;

  // Sustainability (30 points)
  if (metadata.sustainability_rating) score += 10;
  if (metadata.carbon_footprint) score += 10;
  if (metadata.recyclability) score += 5;
  if (metadata.packaging_type) score += 5;
  totalPossible += 30;

  // Materials (25 points)
  if (metadata.materials) score += 15;
  if (metadata.fabric_composition || metadata.ingredients_source) score += 10;
  totalPossible += 25;

  // Certifications (15 points)
  if (metadata.certifications) score += 10;
  if (metadata.energy_efficiency) score += 5;
  totalPossible += 15;

  // Additional (10 points)
  if (metadata.supplier_info) score += 5;
  if (metadata.additional_notes) score += 5;
  totalPossible += 10;

  const finalScore = Math.round((score / totalPossible) * 100);
  
  let description = '';
  if (finalScore >= 90) description = 'Excellent transparency - This product provides comprehensive information about its sustainability and manufacturing practices.';
  else if (finalScore >= 75) description = 'Good transparency - This product provides substantial information about its practices with room for improvement.';
  else if (finalScore >= 60) description = 'Moderate transparency - This product provides basic information but could benefit from more detailed disclosure.';
  else if (finalScore >= 40) description = 'Limited transparency - This product provides minimal information and should improve disclosure practices.';
  else description = 'Poor transparency - This product provides very little information and needs significant improvement in disclosure practices.';

  return { score: finalScore, description };
}


