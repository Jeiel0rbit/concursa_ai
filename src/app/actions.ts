'use server';

import * as cheerio from 'cheerio';
import type { ConcursoData, ConcursoRow, ConcursoCell } from '@/types/concursos';

// Helper function to fetch HTML content
async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
        headers: {
         // Mimic a browser User-Agent to potentially avoid simple bot blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        // Disable cache to get fresh data
        cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText} (Status: ${response.status})`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching HTML:", error);
    // Re-throw a more specific error for the frontend
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
         throw error; // Propagate fetch-related errors
    }
    throw new Error(`Could not fetch content from ${url}. Please check the URL or network connection.`);
  }
}

// Helper function to extract text and link from a Cheerio element
function extractCellData(element: cheerio.Cheerio<cheerio.Element>): ConcursoCell {
  const linkElement = element.find('a');
  if (linkElement.length > 0) {
    const link = linkElement.attr('href');
    // Make link absolute if it's relative
    const absoluteLink = link && !link.startsWith('http') ? new URL(link, 'https://concursosnobrasil.com').toString() : link;
    return {
      text: linkElement.text().trim(),
      link: absoluteLink || null, // Ensure link is string or null
    };
  }
  return {
    text: element.text().trim(),
    link: null,
  };
}


export async function scrapeConcursos(state: string): Promise<ConcursoData> {
  if (!state) {
    throw new Error("State abbreviation is required.");
  }

  // The target URL structure is usually /concursos/{state}/, but fallback to /concursos/previstos/{state}/ might be needed or vice-versa depending on the site structure.
  // Let's try the main state page first.
  const baseUrl = `https://concursosnobrasil.com/concursos/${state.toLowerCase()}/`;
  console.log(`Scraping URL: ${baseUrl}`);

  try {
    const html = await fetchHtml(baseUrl);
    const $ = cheerio.load(html);

    // --- Scraping the Main Table (Open/In Progress) ---
    // Use a more specific selector if possible, #conteudo might contain other tables.
    // Let's assume the first table directly inside #conteudo is the target.
    const tableSelector = '#conteudo > table:first-of-type'; // Adjusted selector to be more specific
    const table = $(tableSelector);

    if (table.length === 0) {
       console.warn(`Main contest table not found at ${baseUrl} with selector ${tableSelector}`);
       // Attempt to find predicted content even if the main table is missing
       let predictedContentFallback: string | null = null;
       const predictedHeading = $('#conteudo h2:contains("Concursos Previstos"), #conteudo h3:contains("Concursos Previstos")');
       if (predictedHeading.length > 0) {
           predictedContentFallback = predictedHeading.next().html()?.trim() || null;
           if (predictedContentFallback) {
             console.log("Found predicted content following a heading (main table missing):", predictedContentFallback);
           }
       }
       return { headers: [], rows: [], predicted: predictedContentFallback }; // Return empty data if table not found
    }

    const headers: string[] = [];
    // Prioritize thead for headers
    table.find('thead tr th').each((i, el) => {
       const text = $(el).text().trim();
       if (text) { // Only add non-empty headers
         headers.push(text);
       }
    });

     // Fallback: If no thead, try the first tbody row for headers
     let firstRowIsHeader = false;
     if (headers.length === 0 && table.find('tbody tr').length > 0) {
         table.find('tbody tr:first-child td').each((i, el) => {
             const text = $(el).text().trim();
             // Basic heuristic: if a cell looks like a header (e.g., bold or specific text)
             if (text && $(el).find('strong').length > 0 || ['Órgão', 'Vagas', 'Inscrições'].includes(text)) {
                 headers.push(text);
             } else {
                 // If one cell doesn't look like a header, assume the row is data
                 headers.length = 0; // Reset headers
                 return false; // Break loop
             }
         });
         if (headers.length > 0) {
            firstRowIsHeader = true;
            // console.log('Using first tbody row for headers:', headers);
         }
     } else if (headers.length > 0) {
       // console.log('Using thead for headers:', headers);
     }

     if (headers.length === 0) {
        console.warn(`Could not determine table headers for ${baseUrl}. Proceeding without strict header matching.`);
     }

    const rows: ConcursoRow[] = [];
    let predictedContent: string | null = null;

    // Iterate through all rows in the main table's tbody
    table.find('tbody tr').each((rowIndex, rowEl) => {
      const row = $(rowEl);

      // Skip the first row if it was identified as the header row
      if (firstRowIsHeader && rowIndex === 0) {
        // console.log('Skipping first tbody row as it was used for headers.');
        return; // Continue to the next iteration
      }

      const firstCell = row.find('td:first-child'); // Get the first cell

      // ** Check if this row indicates 'previsto' content in its first cell **
      // Look for the specific div structure indicating predicted contests
      const labelPrevisto = firstCell.find('div.label-previsto');
      if (labelPrevisto.length > 0 && labelPrevisto.text().trim().toLowerCase() === 'previsto') {
          // If it's the 'previsto' row and we haven't found predicted content yet
          if (!predictedContent) {
              // Extract the HTML content of the first cell, *excluding* the 'previsto' label itself.
              const cellContentClone = firstCell.clone();
              cellContentClone.find('div.label-previsto').remove(); // Remove the label
              predictedContent = cellContentClone.html()?.trim() || null; // Get the remaining HTML
              // console.log("Found and extracted predicted content HTML from first cell of a 'previsto' marked row:", predictedContent);
          }
          // Skip adding this row to the main 'open' concours list, regardless of whether we extracted content
          // (in case multiple rows are marked, we only take the first one's content)
          return;
      }

      // --- Process as a regular (open/in progress) contest row ---
      const cells: ConcursoCell[] = [];
      row.find('td').each((cellIndex, cellEl) => {
          // If we have headers, only add cells matching the header count.
          // If no headers, add all cells found in the row.
          if (headers.length === 0 || cellIndex < headers.length) {
               cells.push(extractCellData($(cellEl)));
          }
      });

       // Add row if it has cells AND (matches header count OR no headers found) AND isn't entirely empty
       const expectedCellCount = headers.length > 0 ? headers.length : 1; // Expect at least 1 cell if no headers
       if (cells.length > 0 &&
           (headers.length === 0 || cells.length === expectedCellCount) &&
           cells.some(cell => cell.text !== '')
        ) {
         rows.push({ cells });
       } else if (cells.length > 0 && (headers.length === 0 || cells.length === expectedCellCount)) {
           // console.log(`Skipping row ${rowIndex} because it seems empty.`);
       } else if (cells.length !== expectedCellCount && headers.length > 0) {
            // console.log(`Skipping row ${rowIndex} due to cell count mismatch (expected ${expectedCellCount}, got ${cells.length}). Cells:`, cells.map(c => c.text));
       }
    });

    // console.log(`Found ${rows.length} regular contest rows in main table.`);

    // Fallback: If we didn't find the 'previsto' label in any table row's first cell,
    // check common alternative locations like a dedicated section or a differently structured table.
    if (!predictedContent) {
        // Example: Look for a specific heading and the content following it
        const predictedHeading = $('#conteudo h2:contains("Concursos Previstos"), #conteudo h3:contains("Concursos Previstos")');
        if (predictedHeading.length > 0) {
            // Try to get the next sibling element's HTML (might be a div, p, or table)
            predictedContent = predictedHeading.next().html()?.trim() || null;
             if (predictedContent) {
               // console.log("Found predicted content following a heading:", predictedContent);
             } else {
               console.warn(`Found 'Concursos Previstos' heading but couldn't extract subsequent content.`);
             }
        } else {
           // console.warn(`'div.label-previsto' not found in any main table row's first cell, and no 'Concursos Previstos' heading found.`);
        }
    }


    return { headers, rows, predicted: predictedContent };

  } catch (error) {
    console.error(`Error scraping ${baseUrl}:`, error);
    // Provide more context in the error message
    if (error instanceof Error) {
        throw new Error(`Failed to scrape concurso data for state ${state}. Reason: ${error.message}`);
    } else {
        throw new Error(`Failed to scrape concurso data for state ${state}. An unknown error occurred.`);
    }
  }
}
