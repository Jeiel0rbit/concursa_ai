# **App Name**: ConcursoScraper

## Core Features:

- State Selection: Allow the user to select a state from a dropdown menu (AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO).
- Data Scraping: Scrape the table data from https://concursosnobrasil.com/concursos/${ESTADO}/ using the provided XPath //*[@id="conteudo"]/table, after scraping the navigation elements at /html/body/div[3]/div[1]/nav .
- Data Display: Display the scraped data in a clean, tabular format on the page.

## Style Guidelines:

- Primary color: Use a neutral white or light gray for the background.
- Secondary color: Use a dark blue or green for the header and footer.
- Accent: A bright teal (#008080) for interactive elements like buttons and dropdown menus.
- Use a clean and responsive layout to display the data table.
- Use simple and clear icons for the state selection dropdown.

## Original User Request:
Quero criar um aplicativo web em Next.js que faça scraping dos elementos localizados em /html/body/div[3]/div[1]/nav, permitindo que o usuário escolha um estado dentre as seguintes opções: 
AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO. 
O aplicativo deve acessar a URL https://concursosnobrasil.com/concursos/${ESTADO}/ e, em seguida, deve realizar o scraping para extrair as informações da tabela localizada em //*[@id="conteudo"]/table.
  