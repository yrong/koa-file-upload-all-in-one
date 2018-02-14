# koa-file-upload-nextcloud

koa2 middle to upload file, 支持本地文件系统、 nextcloud私有云、 ipfs文件系统及以太坊

### Features

- configuration

```
  "ipfs":{
    "api_host": "localhost",
    "api_port": 5001,
    "gateway_port":8080
  },
  "web3":{
    "host": "localhost",
    "port": 7545,
    "account_address":"0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
    "publish_contract_address": "0x345ca3e014aaf5dca488057592ee47305d9b3e10",
    "publish_contract_gas_limit": 300000
  },
  "upload": {
      "excel": {
        "provider": "local",
        "urlPath": "/upload/xslx",
        "mimetypes": [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
      },
      "share": {
        "provider": "nc",
        "nc_share_path":"/share",
        "limits":{
          "fileSize":1000000
        }
      },
      "image": {
        "provider": "nc",
        "nc_share_path":"/share/images",
        "nc_image_preview": true,
        "mimetypes": ["image/png","image/bmp","image/jpeg"]
      },
      "filechain":{
        "provider": "fc"
      }
    }
```

- support upload to local

```javascript
options['upload'] = {
  "url": '/api/upload',
  "storeDir": 'xxx',
  "provider": "local",
  "mimetypes": ['image/png','image/bmp'], // 如果没有配置,将不进行类型检查 http://www.freeformatter.com/mime-types-list.html
  "folder": "public",
  "urlPath": "images"
}
```

- support upload to nc(nextcloud)

```javascript
options["upload"] = {
  "url": "/api/upload/nc",
  "provider": "nc",
  "folder": "public/upload",
  "nc_host":"http://localhost:8089/FileStore",
  "nc_admin_user":"admin",
  "nc_admin_password":"admin",
  "nc_public_group":"share"
}
```

- support upload to fc(filechain with ipfs and ethereum)

```javascript
options["upload"] = {
  "provider": "fc"
}
```


### How to use

```javascript
const file_uploader = require('koa-file-upload-fork')
app.use(mount(option.url,file_uploader(option).handler))
```

### Requirements

- Node v6.0+

## Workflow

- `npm install`
