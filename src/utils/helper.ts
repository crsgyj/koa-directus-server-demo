/** 解析base64格式json对象 */
export const resolveBase64json = <T = any>(base64Str: string): T => {
  const str = Buffer.from(base64Str, 'base64').toString('utf-8');
  const obj = JSON.parse(str);
  return obj;
}