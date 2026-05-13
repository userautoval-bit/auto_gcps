import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// 1. Lógica para carregar as credenciais de forma segura
let creds: any;

if (process.env.GOOGLE_JSON_KEY) {
  // No Render, usamos a variável de ambiente que configuraste na imagem
  creds = JSON.parse(process.env.GOOGLE_JSON_KEY);
} else {
  try {
    // No teu PC (Local), ele tenta ler o ficheiro que está na pasta config
    creds = require('../config/google-auth.json');
  } catch (e) {
    console.error("Aviso: Credenciais do Google não encontradas localmente.");
  }
}

// 2. O ID que encontrámos na URL da tua planilha
const SPREADSHEET_ID = '1ZmOOHig3x_lJ34s2PPKv-H_2wmZDfdNd';

const auth = new JWT({
  email: creds?.client_email,
  // O .replace é CRÍTICO para o Render entender as quebras de linha (\n) da chave
  key: creds?.private_key?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);

// export async function conectarPlanilha() {
//   try {
//     await doc.loadInfo(); 
//     console.log(`Conectado à planilha: ${doc.title}`);
//   } catch (error) {
//     console.error('Erro ao conectar com Google Sheets:', error);
//   }
// }

export async function conectarPlanilha() {
  try {
    await doc.loadInfo(); 
    console.log(`Conectado à planilha: ${doc.title}`);

    // TESTE DE LEITURA (Não altera nada na planilha)
    const aba = doc.sheetsByIndex[0]; // Pega a primeira aba
    const linhas = await aba.getRows();
    console.log(`Sucesso! Lidas ${linhas.length} linhas da planilha.`);
    
    if (linhas.length > 0) {
      console.log("Exemplo da primeira linha:", linhas[0].toObject());
    }

  } catch (error) {
    console.error('Erro ao conectar com Google Sheets:', error);
  }
}