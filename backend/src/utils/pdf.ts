import PDFDocument from 'pdfkit';

export async function createReportPdfBuffer(product: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
          Title: 'Product Transparency Report',
          Author: 'Product Transparency Platform',
          Subject: 'Sustainability Assessment',
          Keywords: 'transparency, sustainability, product assessment',
          CreationDate: new Date()
        }
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error) => reject(error));

      // Cover Page
      createCoverPage(doc, product);
      doc.addPage();

      // Table of Contents
      createTableOfContents(doc);
      doc.addPage();

      // Executive Summary
      createExecutiveSummary(doc, product);
      doc.addPage();

      // Product Information
      createProductInformation(doc, product);
      doc.addPage();

      // Transparency Assessment
      createTransparencyAssessment(doc, product);
      doc.addPage();

      // Detailed Analysis
      createDetailedAnalysis(doc, product);
      doc.addPage();

      // Recommendations
      createRecommendations(doc, product);
      doc.addPage();

      // Appendices
      createAppendices(doc, product);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function createCoverPage(doc: PDFKit.PDFDocument, product: any) {
  // Background gradient effect
  const gradient = doc.linearGradient(50, 50, 550, 800);
  gradient.stop(0, '#1e40af');
  gradient.stop(1, '#3b82f6');
  doc.rect(0, 0, 595, 842).fill(gradient);

  // Company logo placeholder (you can replace with actual logo)
  doc.save();
  doc.translate(297, 150);
  doc.circle(0, 0, 40).fill('#ffffff');
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('PT', 0, -10, { align: 'center' });
  doc.restore();

  // Title
  doc.fontSize(36).font('Helvetica-Bold').fill('#ffffff').text('Product Transparency', 0, 250, { align: 'center' });
  doc.fontSize(36).font('Helvetica-Bold').fill('#ffffff').text('Report', 0, 290, { align: 'center' });

  // Product name
  doc.fontSize(18).font('Helvetica').fill('#e5e7eb').text(product.name, 0, 350, { align: 'center' });

  // Company info
  doc.fontSize(14).font('Helvetica').fill('#e5e7eb').text(`Company: ${product.companyId}`, 0, 400, { align: 'center' });
  doc.fontSize(14).font('Helvetica').fill('#e5e7eb').text(`Generated: ${new Date().toLocaleDateString()}`, 0, 420, { align: 'center' });

  // Footer
  doc.fontSize(10).font('Helvetica').fill('#e5e7eb').text('Product Transparency Platform', 0, 780, { align: 'center' });
  doc.fontSize(10).font('Helvetica').fill('#e5e7eb').text('Comprehensive Sustainability Assessment', 0, 795, { align: 'center' });
}

function createTableOfContents(doc: PDFKit.PDFDocument) {
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('Table of Contents', 0, 50, { align: 'center' });
  doc.moveDown(2);

  const sections = [
    { title: 'Executive Summary', page: 3 },
    { title: 'Product Information', page: 4 },
    { title: 'Transparency Assessment', page: 5 },
    { title: 'Detailed Analysis', page: 6 },
    { title: 'Recommendations', page: 7 },
    { title: 'Appendices', page: 8 }
  ];

  sections.forEach((section, index) => {
    doc.fontSize(14).font('Helvetica-Bold').fill('#374151').text(section.title, 50, 150 + (index * 30));
    doc.fontSize(12).font('Helvetica').fill('#6b7280').text(`Page ${section.page}`, 450, 150 + (index * 30));
  });
}

function createExecutiveSummary(doc: PDFKit.PDFDocument, product: any) {
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('Executive Summary', 0, 50, { align: 'center' });
  doc.moveDown();

  const metadata = product.metadata || {};
  const transparencyScore = calculateTransparencyScore(metadata);

  // Score visualization
  doc.fontSize(18).font('Helvetica-Bold').fill('#374151').text('Transparency Score', 50, 120);
  
  // Progress bar
  const barWidth = 400;
  const barHeight = 20;
  const scoreWidth = (transparencyScore.score / 100) * barWidth;
  
  doc.rect(50, 150, barWidth, barHeight).stroke('#e5e7eb');
  doc.rect(50, 150, scoreWidth, barHeight).fill(getScoreColor(transparencyScore.score));
  doc.fontSize(14).font('Helvetica-Bold').fill('#ffffff').text(`${transparencyScore.score}/100`, 50 + (barWidth/2) - 20, 155);
  
  doc.moveDown(2);

  // Key findings table
  createTable(doc, [
    ['Key Finding', 'Status', 'Impact'],
    ['Product Information', getStatusText(metadata.product_name), 'High'],
    ['Sustainability Rating', getStatusText(metadata.sustainability_rating), 'High'],
    ['Materials Disclosure', getStatusText(metadata.materials), 'Medium'],
    ['Certifications', getStatusText(metadata.certifications), 'Medium'],
    ['Carbon Footprint', getStatusText(metadata.carbon_footprint), 'Low']
  ], 50, 220);

  doc.moveDown(2);
  doc.fontSize(12).font('Helvetica').fill('#6b7280').text(transparencyScore.description, 50, 400);
}

function createProductInformation(doc: PDFKit.PDFDocument, product: any) {
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('Product Information', 0, 50, { align: 'center' });
  doc.moveDown();

  const metadata = product.metadata || {};
  const sections = categorizeMetadata(metadata);

  // Basic Information Table
  if (sections.basic.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').fill('#374151').text('Basic Information', 50, 120);
    createDataTable(doc, sections.basic, 50, 150);
    doc.moveDown(2);
  }

  // Materials Information
  if (sections.materials.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').fill('#374151').text('Materials & Manufacturing', 50, 300);
    createDataTable(doc, sections.materials, 50, 330);
  }
}

function createTransparencyAssessment(doc: PDFKit.PDFDocument, product: any) {
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('Transparency Assessment', 0, 50, { align: 'center' });
  doc.moveDown();

  const metadata = product.metadata || {};
  const sections = categorizeMetadata(metadata);

  // Sustainability Information
  if (sections.sustainability.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').fill('#374151').text('Sustainability Information', 50, 120);
    createDataTable(doc, sections.sustainability, 50, 150);
    doc.moveDown(2);
  }

  // Certifications
  if (sections.certifications.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').fill('#374151').text('Certifications & Compliance', 50, 300);
    createDataTable(doc, sections.certifications, 50, 330);
  }
}

function createDetailedAnalysis(doc: PDFKit.PDFDocument, product: any) {
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('Detailed Analysis', 0, 50, { align: 'center' });
  doc.moveDown();

  const metadata = product.metadata || {};
  const transparencyScore = calculateTransparencyScore(metadata);

  // Score breakdown
  doc.fontSize(16).font('Helvetica-Bold').fill('#374151').text('Score Breakdown', 50, 120);
  
  const breakdown = [
    ['Category', 'Points', 'Score', 'Percentage'],
    ['Basic Information', '20', calculateBasicScore(metadata), `${Math.round((calculateBasicScore(metadata)/20)*100)}%`],
    ['Sustainability', '30', calculateSustainabilityScore(metadata), `${Math.round((calculateSustainabilityScore(metadata)/30)*100)}%`],
    ['Materials', '25', calculateMaterialsScore(metadata), `${Math.round((calculateMaterialsScore(metadata)/25)*100)}%`],
    ['Certifications', '15', calculateCertificationsScore(metadata), `${Math.round((calculateCertificationsScore(metadata)/15)*100)}%`],
    ['Additional', '10', calculateAdditionalScore(metadata), `${Math.round((calculateAdditionalScore(metadata)/10)*100)}%`]
  ];

  createTable(doc, breakdown, 50, 150);

  // Recommendations based on score
  doc.moveDown(2);
  doc.fontSize(14).font('Helvetica-Bold').fill('#374151').text('Areas for Improvement', 50, 400);
  doc.fontSize(12).font('Helvetica').fill('#6b7280').text(getImprovementSuggestions(metadata), 50, 430);
}

function createRecommendations(doc: PDFKit.PDFDocument, product: any) {
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('Recommendations', 0, 50, { align: 'center' });
  doc.moveDown();

  const metadata = product.metadata || {};
  const recommendations = generateRecommendations(metadata);

  recommendations.forEach((rec, index) => {
    doc.fontSize(14).font('Helvetica-Bold').fill('#374151').text(`${index + 1}. ${rec.title}`, 50, 120 + (index * 80));
    doc.fontSize(12).font('Helvetica').fill('#6b7280').text(rec.description, 50, 140 + (index * 80), { width: 500 });
    doc.fontSize(10).font('Helvetica').fill('#059669').text(`Priority: ${rec.priority}`, 50, 160 + (index * 80));
  });
}

function createAppendices(doc: PDFKit.PDFDocument, product: any) {
  doc.fontSize(24).font('Helvetica-Bold').fill('#1e40af').text('Appendices', 0, 50, { align: 'center' });
  doc.moveDown();

  const metadata = product.metadata || {};

  // Raw data table
  doc.fontSize(16).font('Helvetica-Bold').fill('#374151').text('Raw Data', 50, 120);
  createRawDataTable(doc, metadata, 50, 150);

  // Methodology
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold').fill('#374151').text('Methodology', 50, 50);
  doc.fontSize(12).font('Helvetica').fill('#6b7280').text(
    'This transparency assessment is based on industry best practices and sustainability standards. ' +
    'Scores are calculated using a weighted system that prioritizes critical transparency factors. ' +
    'The assessment covers product information, sustainability practices, materials disclosure, ' +
    'certifications, and additional transparency measures.',
    50, 80, { width: 500 }
  );
}

function createTable(doc: PDFKit.PDFDocument, data: string[][], x: number, y: number) {
  const colWidths = [200, 100, 100];
  const rowHeight = 25;
  const headerHeight = 30;

  // Header
  doc.rect(x, y, colWidths[0], headerHeight).fill('#1e40af');
  doc.rect(x + colWidths[0], y, colWidths[1], headerHeight).fill('#1e40af');
  doc.rect(x + colWidths[0] + colWidths[1], y, colWidths[2], headerHeight).fill('#1e40af');

  doc.fontSize(12).font('Helvetica-Bold').fill('#ffffff').text(data[0][0], x + 5, y + 8);
  doc.fontSize(12).font('Helvetica-Bold').fill('#ffffff').text(data[0][1], x + colWidths[0] + 5, y + 8);
  doc.fontSize(12).font('Helvetica-Bold').fill('#ffffff').text(data[0][2], x + colWidths[0] + colWidths[1] + 5, y + 8);

  // Data rows
  for (let i = 1; i < data.length; i++) {
    const rowY = y + headerHeight + (i - 1) * rowHeight;
    
    doc.rect(x, rowY, colWidths[0], rowHeight).stroke('#e5e7eb');
    doc.rect(x + colWidths[0], rowY, colWidths[1], rowHeight).stroke('#e5e7eb');
    doc.rect(x + colWidths[0] + colWidths[1], rowY, colWidths[2], rowHeight).stroke('#e5e7eb');

    doc.fontSize(10).font('Helvetica').fill('#374151').text(data[i][0], x + 5, rowY + 8);
    doc.fontSize(10).font('Helvetica').fill('#374151').text(data[i][1], x + colWidths[0] + 5, rowY + 8);
    doc.fontSize(10).font('Helvetica').fill('#374151').text(data[i][2], x + colWidths[0] + colWidths[1] + 5, rowY + 8);
  }
}

function createDataTable(doc: PDFKit.PDFDocument, data: [string, any][], x: number, y: number) {
  const colWidths = [200, 300];
  const rowHeight = 25;

  data.forEach(([key, value], index) => {
    const rowY = y + index * rowHeight;
    
    doc.rect(x, rowY, colWidths[0], rowHeight).fill('#f3f4f6');
    doc.rect(x + colWidths[0], rowY, colWidths[1], rowHeight).fill('#ffffff');
    doc.rect(x, rowY, colWidths[0] + colWidths[1], rowHeight).stroke('#e5e7eb');

    doc.fontSize(10).font('Helvetica-Bold').fill('#374151').text(formatFieldName(key), x + 5, rowY + 8);
    doc.fontSize(10).font('Helvetica').fill('#6b7280').text(formatFieldValue(value), x + colWidths[0] + 5, rowY + 8);
  });
}

function createRawDataTable(doc: PDFKit.PDFDocument, metadata: any, x: number, y: number) {
  const data = Object.entries(metadata).map(([key, value]) => [key, String(value)]);
  createDataTable(doc, data, x, y);
}

// Helper functions
function getScoreColor(score: number): string {
  if (score >= 90) return '#059669'; // Green
  if (score >= 75) return '#d97706'; // Orange
  if (score >= 60) return '#dc2626'; // Red
  return '#7f1d1d'; // Dark red
}

function getStatusText(value: any): string {
  return value ? 'Complete' : 'Missing';
}

function calculateBasicScore(metadata: any): number {
  let score = 0;
  if (metadata.product_name) score += 5;
  if (metadata.product_category) score += 5;
  if (metadata.origin_country) score += 5;
  if (metadata.contact_email) score += 5;
  return score;
}

function calculateSustainabilityScore(metadata: any): number {
  let score = 0;
  if (metadata.sustainability_rating) score += 10;
  if (metadata.carbon_footprint) score += 10;
  if (metadata.recyclability) score += 5;
  if (metadata.packaging_type) score += 5;
  return score;
}

function calculateMaterialsScore(metadata: any): number {
  let score = 0;
  if (metadata.materials) score += 15;
  if (metadata.fabric_composition || metadata.ingredients_source) score += 10;
  return score;
}

function calculateCertificationsScore(metadata: any): number {
  let score = 0;
  if (metadata.certifications) score += 10;
  if (metadata.energy_efficiency) score += 5;
  return score;
}

function calculateAdditionalScore(metadata: any): number {
  let score = 0;
  if (metadata.supplier_info) score += 5;
  if (metadata.additional_notes) score += 5;
  return score;
}

function getImprovementSuggestions(metadata: any): string {
  const suggestions = [];
  if (!metadata.product_name) suggestions.push('Add product name');
  if (!metadata.sustainability_rating) suggestions.push('Provide sustainability rating');
  if (!metadata.materials) suggestions.push('Disclose materials information');
  if (!metadata.certifications) suggestions.push('Obtain relevant certifications');
  if (!metadata.carbon_footprint) suggestions.push('Calculate and disclose carbon footprint');
  
  return suggestions.length > 0 ? suggestions.join(', ') : 'All areas are well covered';
}

function generateRecommendations(metadata: any): Array<{title: string, description: string, priority: string}> {
  const recommendations = [];
  
  if (!metadata.sustainability_rating) {
    recommendations.push({
      title: 'Establish Sustainability Rating',
      description: 'Implement a comprehensive sustainability assessment framework to measure and track environmental impact.',
      priority: 'High'
    });
  }
  
  if (!metadata.carbon_footprint) {
    recommendations.push({
      title: 'Calculate Carbon Footprint',
      description: 'Conduct a life cycle assessment to determine the carbon footprint of your product.',
      priority: 'High'
    });
  }
  
  if (!metadata.certifications) {
    recommendations.push({
      title: 'Obtain Sustainability Certifications',
      description: 'Pursue relevant certifications such as Organic, Fair Trade, or B Corp to demonstrate commitment to sustainability.',
      priority: 'Medium'
    });
  }
  
  if (!metadata.supplier_info) {
    recommendations.push({
      title: 'Enhance Supplier Transparency',
      description: 'Collect and disclose information about suppliers and their sustainability practices.',
      priority: 'Medium'
    });
  }
  
  return recommendations;
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


