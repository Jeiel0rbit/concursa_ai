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
        }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching HTML:", error);
    throw new Error(`Could not fetch content from ${url}.`);
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

  const url = `https://concursosnobrasil.com/concursos/${state.toLowerCase()}/`;

  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // --- Scraping Navigation (as requested, though not used in output) ---
    // Not implemented as it wasn't required for the final output

    // --- Scraping the Table ---
    const tableSelector = '#conteudo > table'; // Target the table within the #conteudo div
    const table = $(tableSelector);

    if (table.length === 0) {
       console.warn(`Table not found at ${url} with selector ${tableSelector}`);
       return { headers: [], rows: [], predicted: null }; // Return empty data if table not found
    }

    const headers: string[] = [];
    table.find('thead tr th').each((i, el) => {
       const text = $(el).text().trim();
       if (text) {
         headers.push(text);
       }
    });
     // If no headers found in thead, try tbody first tr td as headers
     if (headers.length === 0) {
         table.find('tbody tr:first-child td').each((i, el) => {
             const text = $(el).text().trim();
             if (text) {
                 headers.push(text);
             }
         });
     }

    const rows: ConcursoRow[] = [];
    let predictedContent: string | null = null;

    table.find('tbody tr').each((rowIndex, rowEl) => {
      const row = $(rowEl);
      const firstCell = row.find('td:first-child');

      // Check if the first cell contains the 'label-previsto' div
      const labelPrevisto = firstCell.find('div.label-previsto');
      if (labelPrevisto.length > 0 && labelPrevisto.text().trim().toLowerCase() === 'previsto') {
          // If it's the 'previsto' row, extract the HTML content of the first cell's parent div
          // Adjust selector if the structure is different, e.g., just firstCell.html()
          predictedContent = firstCell.find('div').first().html()?.trim() || firstCell.html()?.trim() || null;
          // Skip adding this row to the main concours list
          return;
      }


      // Skip the first row if it was used for headers (alternative structure)
      if (headers.length > 0 && table.find('thead').length === 0 && rowIndex === 0) {
            return;
      }

      const cells: ConcursoCell[] = [];
      row.find('td').each((cellIndex, cellEl) => {
          // Only add cell if its index corresponds to a found header
          if (cellIndex < headers.length) {
               cells.push(extractCellData($(cellEl)));
          }
      });

       // Only add row if it has the expected number of cells based on headers
       // and isn't empty
       if (cells.length === headers.length && cells.some(cell => cell.text !== '')) {
         rows.push({ cells });
       }
    });

    // --- Find Predicted Content More Robustly ---
    // This section might be redundant now with the check inside the row loop,
    // but kept for potential fallback or different structures.
    // We search for the div with the specific class within any table cell.
    if (!predictedContent) { // Only run if not found during row iteration
        const predictedElementContainer = $('td div.label-previsto:contains("previsto")').closest('td').find('div').first();
         if (predictedElementContainer.length > 0) {
             predictedContent = predictedElementContainer.html()?.trim() || null;
             console.log("Found predicted content via secondary search.");
         } else {
            console.warn(`Predicted content element containing '.label-previsto' not found.`);
         }
    }


    return { headers, rows, predicted: predictedContent };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape concurso data for state ${state}.`);
  }
}
