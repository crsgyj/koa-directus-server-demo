import mysql2 from 'mysql2';
import fs from 'fs';
import path from 'path';
import appRootPath from 'app-root-path';

const modelDir = path.join(appRootPath.path, './src/models/db');

type DDLResult = {
  typeName: string
  typeMap: string
  tableName: string
}

async function main() {
  const user = 'root';
  const password = '?';
  const host = '?';
  const port = 10336;
  const database = '?'
  if (fs.existsSync(modelDir)) {
    return 
  }

  const conn = mysql2.createConnection({
    host,
    user,
    password,
    database,
    port
  });
  /** tables 表名 */
  const tables: {
    table_name: string;
    table_comment: string
  }[] = await new Promise(resolve => {
    conn.query(
      `SELECT table_name, table_comment FROM information_schema.tables WHERE table_schema='${database}';`,
      (err, results) => {
        if (err) {
          resolve(null);
          return;
        }
        resolve(results as any[]);
      }
    )
  });
  const ddlMaps: DDLResult[] = [];
  for (const table of tables) {
    const ddl: string = await new Promise(resolve => {
      conn.query(getTableDDLQuery(database, table.table_name), (err, data) => {
        if (err) {
          return resolve(null);
        }
        return resolve(data[0]['Create Table']);
      })
    });
    /** 当前表结果 */
    const ddlResult = resolveDDL(table, ddl);
    ddlMaps.push(ddlResult);
    writeModel(ddlResult);
  }
  /** 聚合类型 */
  writeMergeMap(ddlMaps)

  conn.end();
}

/** 合并类型 */
function writeMergeMap(ddlMaps: DDLResult[]) {
  const imports = 'import { TypeMap } from \'@directus/sdk\';\n' + ddlMaps.map(e => `import { ${e.typeName} } from './db/${e.tableName}.model';\n`).join('') + '\n';
  const mergeType = `export type ModelMap = {\n${ddlMaps.map(e => `  ${e.tableName}: ${e.typeName};\n`).join('')}} & TypeMap;`

  fs.writeFileSync(path.join(modelDir, '../map.ts'), imports + mergeType, { encoding: 'utf-8' });
}

function getTableDDLQuery(db:string, tableName: string) {
  return `SHOW CREATE table \`${db}\`.\`${tableName}\`;`
}

function resolveDDL(table: {
  table_name: string,
  table_comment: string
}, ddl: string): DDLResult {
  const keyLines = ddl.split('\n').map(e => e.trim()).filter(e => e.startsWith('`'));
  const keyInfo: {
    key: string;
    type: string;
    comment: string;
  }[] = [];
  for (let keyLine of keyLines) {
    const key = keyLine.split(/\s+/g)[0].replace(/`/g, '');
    const type = keyLine.split(/\s+/g)[1].replace(/\([\w,]+\)/, '');
    const tsType = transDbType2js(type); 
    const comment: string = keyLine.match(/COMMENT \'(.+)\',/ig)?.[0].replace(/COMMENT/i, '').trim().slice(1, -2) ?? '';
    keyInfo.push({
      key: key,
      type: `${key}: ${tsType};`,
      comment
    });
  }
  const typeName = `MTYPE_${table.table_name.toUpperCase()}`;
  const typeMap = `/** ${table.table_name} - ${table.table_comment} */
export type ${typeName} = {
${
      keyInfo.map(k => {
        return `  /** ${k.key} - ${k.comment} */\n  ${k.type}\n`
      }).join('')
    }}`

  return {
    typeMap: typeMap,
    typeName: typeName,
    tableName: table.table_name
  }
}

function writeModel(data: DDLResult) {
  existOrMkModelDir(modelDir);

  const filePath = path.join(modelDir, `${data.tableName}.model.ts`);
  fs.writeFileSync(filePath, data.typeMap, {
    encoding: 'utf-8'
  });
}

function transDbType2js(DbType: string) {
  if (DbType.includes('int')) {
    return 'number'
  }
  if(DbType.includes('text') || DbType.includes('char')) {
    return 'string'
  }

  switch(DbType) {
    case 'int':
    case 'long':
    case 'timstamp':
    case 'tinyint':
    case 'decimal':
      return 'number';
    case 'char':
    case 'varchar': 
    case 'longtext':
    case 'date':
    case 'datetime':
      return 'string';
    default: {
      return 'string'
    }
  }
}

function existOrMkModelDir(path: string) {
  if (fs.existsSync(path)) {
    return
  }
  fs.mkdirSync(path);
}

main()