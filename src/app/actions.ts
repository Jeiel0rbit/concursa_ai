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
   // Special handling for the 'previsto' label: We want to keep the text but remove the div structure from output text if needed,
   // although current implementation includes it as part of the text.
   // If we wanted to *exclude* the 'previsto' text:
   // const clonedElement = element.clone();
   // clonedElement.find('div.label-previsto').remove();
   // return { text: clonedElement.text().trim(), link: null };
  return {
    text: element.text().trim(),
    link: null,
  };
}


export async function scrapeConcursos(state: string): Promise<ConcursoData> {
  if (!state) {
    throw new Error("State abbreviation is required.");
  }

  const baseUrl = `https://concursosnobrasil.com/concursos/${state.toLowerCase()}/`;
  console.log(`Scraping URL: ${baseUrl}`);

  try {
    const html = await fetchHtml(baseUrl);
    const $ = cheerio.load(html);

    const tableSelector = '#conteudo > table:first-of-type';
    const table = $(tableSelector);

    if (table.length === 0) {
       console.warn(`Main contest table not found at ${baseUrl} with selector ${tableSelector}`);
       // Return empty arrays if table not found
       return { headers: [], openRows: [], predictedRows: [] };
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
             // Basic heuristic: if a cell looks like a header
             if (text && ($(el).find('strong').length > 0 || ['Órgão', 'Vagas', 'Inscrições'].includes(text))) {
                 headers.push(text);
             } else {
                 headers.length = 0; // Reset headers if any cell doesn't look like a header
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

    const openRows: ConcursoRow[] = [];
    const predictedRows: ConcursoRow[] = [];

    // Iterate through all rows in the main table's tbody
    table.find('tbody tr').each((rowIndex, rowEl) => {
      const row = $(rowEl);

      // Skip the first row if it was identified as the header row
      if (firstRowIsHeader && rowIndex === 0) {
        // console.log('Skipping first tbody row as it was used for headers.');
        return; // Continue to the next iteration
      }

      const firstCell = row.find('td:first-child'); // Get the first cell
      const isPredicted = firstCell.find('div.label-previsto').length > 0;

      // Extract cells for the current row
      const cells: ConcursoCell[] = [];
      row.find('td').each((cellIndex, cellEl) => {
          // If we have headers, only add cells matching the header count.
          // If no headers, add all cells found in the row.
          if (headers.length === 0 || cellIndex < headers.length) {
               cells.push(extractCellData($(cellEl)));
          }
      });

      // Check if the row is valid (has cells, matches header count if headers exist, isn't empty)
      const expectedCellCount = headers.length > 0 ? headers.length : 1; // Expect at least 1 cell if no headers
      const isValidRow = cells.length > 0 &&
                         (headers.length === 0 || cells.length === expectedCellCount) &&
                         cells.some(cell => cell.text !== '');

      if (isValidRow) {
        if (isPredicted) {
            // Add to predicted rows list
            predictedRows.push({ cells });
            // console.log(`Row ${rowIndex} identified as PREDICTED.`);
        } else {
            // Add to open/in-progress rows list
            openRows.push({ cells });
            // console.log(`Row ${rowIndex} identified as OPEN/IN PROGRESS.`);
        }
      } else {
          // Optionally log skipped rows for debugging
          // if (cells.length > 0) {
          //   console.log(`Skipping row ${rowIndex}. Valid: ${isValidRow}, Cells: ${cells.length}, Expected: ${expectedCellCount}, Empty: ${!cells.some(cell => cell.text !== '')}`);
          // }
      }
    });

    console.log(`Found ${openRows.length} open/in progress rows.`);
    console.log(`Found ${predictedRows.length} predicted rows.`);

    // Return the separated data
    return { headers, openRows, predictedRows };

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
