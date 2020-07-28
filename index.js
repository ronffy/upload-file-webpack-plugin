/**
 * @description 上传文件到指定服务器的 webpack 插件
 * @author ronffy
 * @Date 2020-06-02 19:15:16
 * @LastEditTime 2020-07-16 20:37:46
 * @LastEditors ronffy
 */
/** @typedef {import("./typings").Method} Method */
/** @typedef {import("./typings").Options} UploadFileOptions */
/** @typedef {import("webpack").Compiler} WebpackCompiler */

const { uploadFilesAsync, readDir } = require('./utils');

/**
 * @param {string} url 上传文件的服务器地址
 * @param {Method} method request 请求方法
 * @param {string} filePath 要上传文件的路径
 * @param {(string|regex)[]} fileTypes 要上传文件的类型
 * @param {function} onSuccess 上传成功后的回调
 * @param {function} onError 上传失败后的回调
 * @return
 */
/**
 * @param {UploadFileOptions} options
*/
function UploadFileWebpackPlugin(options) {
  this.options = options;
}

UploadFileWebpackPlugin.prototype.upload = function () {
  const { url, method = 'PUT', filePath, fileTypes, onSuccess, onError } = this.options;
  if (!url || !filePath) {
    console.warn('UploadFileWebpackPlugin apply error, url, filePath is required');
    return;
  }

  const t = +new Date();

  const filePaths = readDir(filePath, fileTypes);
  const asyncTasks = filePaths.map((path) => {
    const fileName = path.replace(filePath + (filePath.endsWith('/') ? '' : '/'), '');
    return uploadFilesAsync({
      url: `${url}${url.includes('?') ? '' : '?'}&fileName=${fileName}`,
      method,
      filePath: path,
    })
  });

  Promise.all(asyncTasks)
    .then(() => {
      console.log('upload file success');
      console.log('time use ' + (+new Date() - t));
      onSuccess && onSuccess(filePaths);
    })
    .catch((e) => {
      console.log('upload file error');
      onError && onError(e);
    })
}

/**
 * @param {WebpackCompiler} compiler
*/
UploadFileWebpackPlugin.prototype.apply = function (compiler) {
  if (compiler.hooks) {
    compiler.hooks.done.tap('upload-file-webpack-plugin', status => {
      this.upload();
    });
    return;
  }
  // webpack 1
  compiler.plugin('done', (stats) => {
    this.upload();
  });
}

module.exports = UploadFileWebpackPlugin
