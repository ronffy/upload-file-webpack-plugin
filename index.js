/**
 * @description 上传文件到指定服务器的 webpack 插件
 * @author ronffy
 * @Date 2020-06-02 19:15:16
 * @LastEditTime 2020-06-11 21:15:40
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
class UploadFileWebpackPlugin {
  /**
   * @param {UploadFileOptions} options
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @param {WebpackCompiler} compiler
   */
  apply(compiler) {
    const { url, method = 'PUT', filePath, fileTypes, onSuccess, onError } = this.options;
    if (!url || !filePath) {
      console.warn('UploadFileWebpackPlugin apply error, url, filePath is required');
      return;
    }
    compiler.hooks.afterEmit.tap('upload-file-webpack-plugin', status => {
      const t = +new Date();

      const filePaths = readDir(filePath, fileTypes);
      const asyncTasks = filePaths.map((path) => uploadFilesAsync({
        url: `${url}${url.includes('?') ? '' : '?'}&fileName=${
          path.replace(filePath + (filePath.endsWith('/') ? '' : '/'), '')
        }`,
        method,
        filePath: path,
      }));

      Promise.all(asyncTasks)
        .then(() => {
          console.log('upload file success');
          console.log('time use ' + (+new Date() - t));
          onSuccess && onSuccess(filePaths);
        })
        .catch((e) => {
          onError && onError(e);
        })
    })
  }
}

module.exports = UploadFileWebpackPlugin
