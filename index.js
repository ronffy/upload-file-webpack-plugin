/**
 * @description 上传文件到指定服务器的 webpack 插件
 * @author ronffy
 * @Date 2020-06-02 19:15:16
 * @LastEditTime 2020-06-04 20:22:50
 * @LastEditors ronffy
 */
const { uploadFilesAsync, readDir } = require('./utils');

/**
 * @param {string} url 上传文件的服务器地址
 * @param {HTTPMethod} method request 请求方法
 * @param {string} filePath 要上传的文件的路径
 * @param {(string|regex)[]} fileTypes 要上传的文件的类型
 * @param {function} onSuccess 上传成功后的回调
 * @param {function} onError 上传失败后的回调
 * @return
 */
function UploadFileWebpackPlugin(options) {
  this.options = options;
}

UploadFileWebpackPlugin.prototype.apply = function (compiler) {
  const { url, method = 'PUT', filePath, fileTypes, onSuccess, onError } = this.options;
  if (!url || !filePath) {
    console.warn('UploadFileWebpackPlugin apply error, url, filePath is required');
    return;
  }
  compiler.hooks.afterEmit.tap('upload-file-webpack-plugin', status => {
    const t = +new Date();
    
    const files = readDir(filePath, fileTypes);
    const asyncTasks = files.map((filePath, i) => uploadFilesAsync({
      url: `${url}${url.includes('?') ? '' : '?'}&fileName=${filePath.replace(filePath, '')}`,
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
