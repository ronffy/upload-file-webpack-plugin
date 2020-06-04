/**
 * @description 上传文件到指定服务器的 webpack 插件
 * @author ronffy
 * @Date 2020-06-02 19:15:16
 * @LastEditTime 2020-06-04 20:04:00
 * @LastEditors ronffy
 */
const { uploadFilesAsync, readDir } = require('./utils');

function UploadFileWebpackPlugin(options) {
  this.options = options;
}

UploadFileWebpackPlugin.prototype.apply = function (compiler) {
  const { url, method = 'PUT', fromPath, fileTypes, onSuccess, onError } = this.options;
  if (!url || !fromPath) {
    console.warn('UploadFileWebpackPlugin apply error, url, fromPath is required');
    return;
  }
  compiler.hooks.afterEmit.tap('upload-file-webpack-plugin', status => {
    const t = +new Date();
    
    const files = readDir(fromPath, fileTypes);
    const asyncTasks = files.map((filePath, i) => uploadFilesAsync({
      url: `${url}${url.includes('?') ? '' : '?'}&fileName=${filePath.replace(fromPath, '')}`,
      method,
      filePath,
    }));

    Promise.all(asyncTasks)
      .then(() => {
        console.log('upload file success');
        console.log('time use ' + (+new Date() - t));
        onSuccess && onSuccess(files);
      })
      .catch((e) => {
        onError && onError(e);
      })
  })
}

module.exports = UploadFileWebpackPlugin
