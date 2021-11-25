import koaBody from "koa-body";
import path from 'path';
import { v4 } from 'uuid';
import * as mime from 'mime';

export default ({
  uploadDir
}: {
  uploadDir: string
}) => koaBody({
  encoding: 'utf-8',
  multipart: true,
  formidable: {
    maxFileSize: 1024 * 1024 * 30,
    uploadDir: uploadDir,
    onFileBegin: (name, file) => {
      const newFilename = v4() + '.' + mime.getExtension(file.type);
      file.path = path.resolve(path.dirname(file.path), newFilename);
    },
    keepExtensions: true
  },
})