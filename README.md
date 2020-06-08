# upload-file-webpack-plugin
A Webpack plugin to upload file to server.


## options

| 参数   |      说明      | 类型 |
|:----------|:-------------|:------:|
| url | 上传文件的服务器地址 | string |
| method | request 请求方法 | Method |
| filePath | 要上传文件的路径 | string |
| fileTypes | 要上传文件的类型 | (string|regex)[] |
| onSuccess | 上传成功后的回调 | function |
| onError | 上传失败后的回调 | function |