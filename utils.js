/**
 * @description 
 * @author ronffy
 * @Date 2020-06-02 19:17:54
 * @LastEditTime 2020-07-28 17:51:02
 * @LastEditors ronffy
 */
/** @typedef {import("./typings").Options} UploadFileOptions */

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { parse } = require('url');

// 默认仅取出 .js.map 文件和 manifest.json 文件
const defaultFileTypes = [/\.js\.map$/, /manifest\.json/];

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

/**
 * @description 递归读取文件夹
 * @author ronffy
 * @param {Pick<UploadFileOptions, 'filePath'>} filePath
 * @param {Pick<UploadFileOptions, 'fileTypes'>} fileTypes
 * @return {Pick<UploadFileOptions, 'filePath'>} 输出指定文件目录集
 */
function readDir(filePath, fileTypes = defaultFileTypes) {
  const filesContent = [];

  const readSingleFile = p => {
    try {
      const _filesPath = resolveApp(p);
      const files = fs.readdirSync(_filesPath);

      files.forEach(f => {
        const wholeFilePath = path.resolve(p, f);
        const fileStat = fs.statSync(wholeFilePath);
        // 查看文件是目录还是单文件
        if (fileStat.isDirectory()) {
          readSingleFile(wholeFilePath);
        }

        // 只筛选出manifest和map文件
        if (
          fileStat.isFile() &&
          fileTypes.some(r => r.test(f))
        ) {
          filesContent.push(wholeFilePath);
        }
      });
    } catch (error) {
      console.log('upload-file-webpack-plugin readDir error');
    }
  }

  readSingleFile(filePath);

  return filesContent;
}


/**
 * @description 异步上传文件
 * @author ronffy
 * @param {Pick<UploadFileOptions, 'url' | 'method' | 'filePath'>} options
 * @return 
 */
const uploadFilesAsync = options => {
  return new Promise((resolve, reject) => {
    const { url, method, filePath } = options;
    if (!url || !filePath) {
      reject("params 'url' and 'filePath' is required!!");
      return;
    }
    const { protocol, hostname, port, path } = parse(url);

    const params = {
      protocol,
      host: hostname,
      path,
      port,
      method,
      headers: {
        "Content-Type": "application/octet-strean",
        // 由于我们的文件通过二进制流传输，所以需要保持长连接
        // 设置一下request header
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked"
      }
    };
    const req = (protocol === 'http:' ? http : https ).request(params);

    req.on('error', (e) => {
      console.log('upload file error, filePath:' + filePath);
      reject(e);
    });

    req.on('timeout', (e) => {
      console.log('upload file timeout, filePath:' + filePath);
      reject(e);
    })

    req.on('response', () => {
      resolve(filePath);
    })

    fs.createReadStream(filePath)
      .on("data", chunk => {
        // 对request的写入，会将数据流写入到 request body
        req.write(chunk);
      })
      .on("end", () => {
        // 在文件读取完成后，需要调用req.end来发送请求
        req.end();
      })
      .on('error', e => {
        req.end();
        reject('readStream filePath error');
      })
  })
}

module.exports = {
  readDir,
  uploadFilesAsync,
}
