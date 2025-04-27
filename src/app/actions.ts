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

  const url = `https://concursosnobrasil.com/concursos/${state.toLowerCase()}/`;
  console.log(`Scraping URL: ${url}`);

  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // --- Scraping the Table ---
    const tableSelector = '#conteudo > table'; // Target the table within the #conteudo div
    const table = $(tableSelector);

    if (table.length === 0) {
       console.warn(`Table not found at ${url} with selector ${tableSelector}`);
       return { headers: [], rows: [], predicted: null }; // Return empty data if table not found
    }

    const headers: string[] = [];
    // Prioritize thead for headers
    table.find('thead tr th').each((i, el) => {
       const text = $(el).text().trim();
       if (text) { // Only add non-empty headers
         headers.push(text);
       }
    });

     // If no headers found in thead, try tbody first tr td as headers
     // This handles cases where the table lacks a <thead>
     if (headers.length === 0) {
         table.find('tbody tr:first-child td').each((i, el) => {
             const text = $(el).text().trim();
             if (text) {
                 headers.push(text);
             }
         });
         // console.log('Using first tbody row for headers:', headers);
     } else {
       // console.log('Using thead for headers:', headers);
     }

     if (headers.length === 0) {
        console.warn('Could not determine table headers.');
        // Decide if you want to proceed without headers or return error/empty
     }

    const rows: ConcursoRow[] = [];
    let predictedContent: string | null = null;

    // Iterate through all rows in tbody
    table.find('tbody tr').each((rowIndex, rowEl) => {
      const row = $(rowEl);
      const firstCell = row.find('td:first-child'); // Get the first cell

      // Check if the first cell contains the 'label-previsto' div indicating a predicted contest row
      const labelPrevisto = firstCell.find('div.label-previsto');
      if (labelPrevisto.length > 0 && labelPrevisto.text().trim().toLowerCase() === 'previsto') {
          // If it's the 'previsto' row, extract the HTML content of the first cell's *content* (excluding the 'previsto' label itself)
          // Clone the cell, remove the label div, then get the html
          const cellContentClone = firstCell.clone();
          cellContentClone.find('div.label-previsto').remove(); // Remove the label
          predictedContent = cellContentClone.html()?.trim() || null; // Get the remaining HTML
          // console.log("Found and extracted predicted content HTML:", predictedContent);
          return; // Skip adding this row to the main concours list
      }

      // Skip the first row if it was used for headers (when no thead exists)
      if (headers.length > 0 && table.find('thead').length === 0 && rowIndex === 0) {
            // console.log('Skipping first tbody row as it was used for headers.');
            return;
      }

      const cells: ConcursoCell[] = [];
      row.find('td').each((cellIndex, cellEl) => {
          // Only add cell if its index corresponds to a found header OR if no headers were found (attempt to grab all)
          if (headers.length === 0 || cellIndex < headers.length) {
               cells.push(extractCellData($(cellEl)));
          }
      });

       // Add row if it has cells and isn't entirely empty text
       // Use headers.length if available for stricter check, otherwise check if cells were found
       const expectedCellCount = headers.length > 0 ? headers.length : 0;
       if (cells.length > 0 && // Ensure there are cells
           (expectedCellCount === 0 || cells.length === expectedCellCount) && // Match header count if headers exist
            cells.some(cell => cell.text !== '')) // Ensure row is not completely empty
        {
         rows.push({ cells });
       }
    });

    // console.log(`Found ${rows.length} regular contest rows.`);
    if (!predictedContent) {
        console.warn(`Predicted content element containing 'div.label-previsto' not found in any row's first cell.`);
    }


    return { headers, rows, predicted: predictedContent };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    // Provide more context in the error message
    if (error instanceof Error) {
        throw new Error(`Failed to scrape concurso data for state ${state}. Reason: ${error.message}`);
    } else {
        throw new Error(`Failed to scrape concurso data for state ${state}. An unknown error occurred.`);
    }
  }
}
