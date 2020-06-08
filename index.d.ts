import { Compiler } from 'webpack';

export = UploadFileWebpackPlugin;

declare class UploadFileWebpackPlugin {
  constructor(options: UploadFileWebpackPlugin.Options);
  apply(compiler: Compiler): void
}

declare namespace UploadFileWebpackPlugin {

  type Method =
    | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'

  interface Options {
    url: string
    filePath: string
    method?: Method
    fileTypes?: (string | RegExp)[]
    onSuccess?(string[]): void
    onError?(e: Event): void
  }
}