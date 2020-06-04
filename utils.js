/**
 * @description 
 * @author ronffy
 * @Date 2020-06-02 19:17:54
 * @LastEditTime 2020-06-04 19:51:44
 * @LastEditors ronffy
 */
const path = require('path');
const fs = require('fs');
const { request } = require('http');
const { parse } = require('url');

// 默认仅取出 .js.map 文件和 manifest.json 文件
const defaultFileTypes = [/\.js\.map$/, /manifest\.json/];

/**
* 递归读取文件夹
* 输出指定文件目录集
*/
const readDir = (filePath, fileTypes = defaultFileTypes) => {
  const filesContent = [];

  function readSingleFile(p) {
    const files = fs.readdirSync(p);
    files.forEach(_filePath => {
      const wholeFilePath = path.resolve(p, _filePath);
      const fileStat = fs.statSync(wholeFilePath);
      // 查看文件是目录还是单文件
      if (fileStat.isDirectory()) {
        readSingleFile(wholeFilePath);
      }

      // 只筛选出manifest和map文件
      if (
        fileStat.isFile() &&
        fileTypes.some(r => r.test(_filePath))
      ) {
        filesContent.push(wholeFilePath);
      }
    });
  }

  readSingleFile(filePath);

  return filesContent;
}

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
    const req = request(params);

    req.on('error', (e) => {
      console.log('upload file error, filePath:' + filePath);
      reject(e);
    });

    fs.createReadStream(filePath)
      .on("data", chunk => {
        // 对request的写入，会将数据流写入到 request body
        req.write(chunk);
      })
      .on("end", () => {
        // 在文件读取完成后，需要调用req.end来发送请求
        req.end();
        resolve(filePath);
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
