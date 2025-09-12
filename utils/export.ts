import { ScrapedData, Product, QAItem } from '../types';

/**
 * Triggers a browser download for the given content.
 * @param filename - The desired filename for the download (e.g., "report.csv").
 * @param content - The string content of the file.
 * @param mimeType - The MIME type of the file (e.g., "text/csv").
 */
export const exportDataAsFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const escapeCsvField = (field: any): string => {
  const str = String(field ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// --- CSV Generation ---

export const generateProductCsv = (products: Product[]): string => {
  if (products.length === 0) return '';
  const headers = ['Name', 'Price', 'Part Number', 'Description', 'URL', 'Mention Count', 'Mention Summaries'];
  const rows = products.map(p => [
    p.name,
    p.price,
    p.partNumber,
    p.description,
    p.url,
    p.mentions.length,
    p.mentions.map(m => m.summary).join('; ')
  ].map(escapeCsvField).join(','));
  return [headers.join(','), ...rows].join('\n');
};

export const generateQaCsv = (qaItems: QAItem[]): string => {
  if (qaItems.length === 0) return '';
  const headers = ['Question', 'Answer Summary', 'Thread URL', 'Related Products'];
  const rows = qaItems.map(qa => [
    qa.question,
    qa.answerSummary,
    qa.threadUrl,
    qa.relatedProducts.join('; ')
  ].map(escapeCsvField).join(','));
  return [headers.join(','), ...rows].join('\n');
};

export const generateFullReportCsv = (data: ScrapedData): string => {
    const productCsv = generateProductCsv(data.products);
    const qaCsv = generateQaCsv(data.qaItems);
    
    let fullCsv = "--- Products ---\n";
    fullCsv += productCsv.length > 0 ? productCsv : "No products found.\n";
    fullCsv += "\n\n--- Q&A Items ---\n";
    fullCsv += qaCsv.length > 0 ? qaCsv : "No Q&A items found.\n";
    
    return fullCsv;
};

export const generatePartsListCsv = (products: Product[]): string => {
  const headers = ['Product Name', 'Part Number'];
  const productsWithParts = products.filter(p => p.partNumber && p.partNumber.trim() !== '');

  if (productsWithParts.length === 0) {
    return 'Product Name,Part Number\nNo products with part numbers found in the selection.';
  }

  const rows = productsWithParts.map(p =>
    [p.name, p.partNumber].map(escapeCsvField).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};

export const generateMentionsCsv = (products: Product[]): string => {
  const headers = ['Product Name', 'Mention Thread Title', 'Mention Summary', 'Mention URL'];
  const rows: string[] = [];

  products.forEach(product => {
    if (product.mentions && product.mentions.length > 0) {
      product.mentions.forEach(mention => {
        const row = [
          product.name,
          mention.threadTitle,
          mention.summary,
          mention.url
        ].map(escapeCsvField).join(',');
        rows.push(row);
      });
    }
  });

  if (rows.length === 0) {
    return 'Product Name,Mention Thread Title,Mention Summary,Mention URL\nNo forum mentions found in the selection.';
  }

  return [headers.join(','), ...rows].join('\n');
};


// --- HTML Generation ---

const getHtmlStyles = () => `
<style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #111827; color: #e5e7eb; margin: 0; padding: 2rem; }
    .container { max-width: 1000px; margin: auto; }
    h1, h2, h3 { color: #67e8f9; border-bottom: 2px solid #374151; padding-bottom: 0.5rem; }
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; margin-top: 3rem; }
    .card { background-color: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
    .card h3 { font-size: 1.5rem; margin-top: 0; border: none; }
    .card a { color: #22d3ee; text-decoration: none; }
    .card a:hover { text-decoration: underline; }
    .tag { display: inline-block; background-color: #374151; color: #9ca3af; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; margin-right: 0.5rem; }
    .price { font-size: 1.2rem; font-weight: bold; color: #4ade80; }
    .mentions { border-top: 1px solid #374151; margin-top: 1rem; padding-top: 1rem; }
    .mention { background-color: #374151; padding: 1rem; border-radius: 6px; margin-top: 0.5rem; }
    .mention p { margin: 0 0 0.5rem 0; }
</style>
`;

const productToHtml = (product: Product): string => `
<div class="card">
    <h3>${product.name}</h3>
    <div><span class="price">${product.price || 'N/A'}</span> <span class="tag">Part #: ${product.partNumber || 'N/A'}</span></div>
    <p>${product.description}</p>
    ${product.url ? `<a href="${product.url}" target="_blank">View Product Page</a>` : ''}
    ${product.mentions && product.mentions.length > 0 ? `
        <div class="mentions">
            <h4>Forum Intelligence:</h4>
            ${product.mentions.map(m => `
                <div class="mention">
                    <p>"<em>${m.summary}</em>"</p>
                    <a href="${m.url}" target="_blank">${m.threadTitle}</a>
                </div>
            `).join('')}
        </div>
    ` : ''}
</div>`;

const qaToHtml = (item: QAItem): string => `
<div class="card">
    <h3>Question: "${item.question}"</h3>
    <p><strong>Answer Summary:</strong> ${item.answerSummary}</p>
    ${item.relatedProducts && item.relatedProducts.length > 0 ? `
        <div>
            <strong>Related Products:</strong>
            ${item.relatedProducts.map(p => `<span class="tag">${p}</span>`).join(' ')}
        </div>
    ` : ''}
    ${item.threadUrl ? `<p><a href="${item.threadUrl}" target="_blank">View Forum Thread</a></p>` : ''}
</div>`;

export const generateProductHtml = (product: Product): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Product: ${product.name}</title>
    ${getHtmlStyles()}
</head>
<body><div class="container">
    <h1>Product Details</h1>
    ${productToHtml(product)}
</div></body>
</html>`;

export const generateQaHtml = (item: QAItem): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Q&A: ${item.question.substring(0, 50)}...</title>
    ${getHtmlStyles()}
</head>
<body><div class="container">
    <h1>Q&A Details</h1>
    ${qaToHtml(item)}
</div></body>
</html>`;


export const generateFullReportHtml = (data: ScrapedData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web Data Intelligence Report</title>
    ${getHtmlStyles()}
</head>
<body>
    <div class="container">
        <h1>Web Data Intelligence Report</h1>
        
        <h2>Products (${data.products.length})</h2>
        ${data.products.length > 0 ? data.products.map(productToHtml).join('') : '<p>No products found.</p>'}
        
        <h2>Q&A Items (${data.qaItems.length})</h2>
        ${data.qaItems.length > 0 ? data.qaItems.map(qaToHtml).join('') : '<p>No Q&A items found.</p>'}
    </div>
</body>
</html>`;