const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SQL_FILE = path.join(__dirname, '../../database_rag_chatbot.sql');

function prepareSql(rawSql, dbName) {
  return rawSql
    .replace(/^\uFEFF/, '')
    .replace(/USE\s+`[^`]+`\s*;/gi, `USE \`${dbName}\`;`)
    .trim();
}

async function runRagChatbotSql() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || DB_NAME === undefined || DB_PASSWORD === undefined) {
    throw new Error('Thiếu biến môi trường DB_HOST, DB_USER, DB_PASSWORD hoặc DB_NAME');
  }

  if (!fs.existsSync(SQL_FILE)) {
    console.warn(`Không tìm thấy ${SQL_FILE}, bỏ qua khởi tạo bảng RAG.`);
    return;
  }

  const sql = prepareSql(fs.readFileSync(SQL_FILE, 'utf8'), DB_NAME);
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log('Đã chạy database_rag_chatbot.sql');
  } finally {
    await connection.end();
  }
}

module.exports = runRagChatbotSql;
