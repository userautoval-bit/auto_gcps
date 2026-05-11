
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import creds from '../config/google-auth.json'; // O arquivo que você baixou

// ID da Planilha: Pegue na URL da sua planilha entre o /d/ e o /edit
const SPREADSHEET_ID = 'COLE_AQUI_O_ID_DA_SUA_PLANILHA';

const auth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);

export async function conectarPlanilha() {
  try {
    await doc.loadInfo(); 
    console.log(`Conectado à planilha: ${doc.title}`);
  } catch (error) {
    console.error('Erro ao conectar com Google Sheets:', error);
  }
}