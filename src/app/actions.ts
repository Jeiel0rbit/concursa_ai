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
    // const navXPath = '/html/body/div[3]/div[1]/nav'; // This XPath translates poorly to CSS selectors.
    // Let's try a more robust selector for the main navigation if needed.
    // Example: const navLinks = $('ul.main-nav > li > a').map((i, el) => $(el).attr('href')).get();
    // console.log("Nav Links:", navLinks); // Log if needed for debugging

    // --- Scraping the Table ---
    const tableSelector = '#conteudo > table'; // Target the table within the #conteudo div
    const table = $(tableSelector);

    if (table.length === 0) {
       console.warn(`Table not found at ${url} with selector ${tableSelector}`);
       return { headers: [], rows: [], predicted: null }; // Return empty data if table not found
    }

    const headers: string[] = [];
    table.find('thead tr th').each((i, el) => {
       // Heuristic to skip potential empty/spacer header cells
       const text = $(el).text().trim();
       if (text) {
         headers.push(text);
       }
    });
     // If no headers found in thead, try tbody first tr td as headers (common alternative structure)
     if (headers.length === 0) {
         table.find('tbody tr:first-child td').each((i, el) => {
             const text = $(el).text().trim();
             if (text) {
                 headers.push(text);
             }
         });
     }

    const rows: ConcursoRow[] = [];
    table.find('tbody tr').each((rowIndex, rowEl) => {
        // Skip the first row if it was used for headers
        if (headers.length > 0 && table.find('thead').length === 0 && rowIndex === 0) {
            return;
        }

        const cells: ConcursoCell[] = [];
        $(rowEl).find('td').each((cellIndex, cellEl) => {
            // Only add cell if its index corresponds to a found header
            if (cellIndex < headers.length) {
                 cells.push(extractCellData($(cellEl)));
            }
        });

         // Only add row if it has the expected number of cells based on headers
         if (cells.length === headers.length && cells.some(cell => cell.text !== '')) {
           rows.push({ cells });
         }
    });

     // --- Scraping Predicted Content ---
    // XPath: //*[@id="conteudo"]/table/tbody/tr[7]/td[1]/div
    const predictedSelector = '#conteudo > table > tbody > tr:nth-child(7) > td:nth-child(1) > div';
    let predictedContent: string | null = null;

    const predictedElement = $(predictedSelector);
    if (predictedElement.length > 0) {
        // Check if the element contains the specific text indicating it's the "previstos" section
        const predictedTitle = predictedElement.find('strong').text().trim();
        if (predictedTitle.toLowerCase().includes('previstos')) {
            predictedContent = predictedElement.html()?.trim() || predictedElement.text().trim(); // Get full HTML or just text
        } else {
             console.warn(`Element at selector ${predictedSelector} does not seem to contain 'previstos'. Found title: "${predictedTitle}"`);
        }
    } else {
        console.warn(`Predicted content element not found with selector: ${predictedSelector}`);
    }


    return { headers, rows, predicted: predictedContent };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape concurso data for state ${state}.`);
  }
}
