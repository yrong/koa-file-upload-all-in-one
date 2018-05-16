const uuid = require("uuid")
const path = require("path")
const mount = require("koa-mount")
const parse = require("async-busboy-fork")
const _ = require('lodash')
const local = require('./local')

const fileUpload = (opts) => {

    let store
    try {
        store = require(`./${opts.provider}`)(opts)
    } catch (err) {
        throw new Error(`Error: ${err}`)
    }

    const handler = async (ctx, next) => {

        // Validate Request
        if ("POST" !== ctx.method && !ctx.request.is("multipart/*")) {
            return await next()
        }

        let {mimetypes, exts} = opts

        // Parse request for multipart
        const {files, fields} = await parse(ctx.req,opts)
        console.log('multipart request parsed!')

        let params=_.assign({},ctx.query,fields),filename
        if(params.unique==='true'){
            filename =  (file)=>`${uuid().replace(/-/g, '')}${path.extname(file.filename)}`
        }
        filename = filename||((file)=>file.filename)
        // Check if any file is not valid mimetype
        if (mimetypes) {
            const invalidFiles = files.filter(file => {
                return !mimetypes.includes(file.mimeType)
            })

            // Return err if any not valid
            if (invalidFiles.length !== 0) {
                ctx.status = 400
                ctx.body = `Error: Invalid type of files ${invalidFiles.map(file => `${file.filename}[${file.mimeType}]`)}`
                return
            }
        }

        // Check if any file is not valid ext
        if (exts) {
            const invalidFiles = files.filter(file => {
                return !exts.includes(file.filename.substring(file.filename.lastIndexOf('.') + 1))
            })

            // Return err if any not valid
            if (invalidFiles.length !== 0) {
                ctx.status = 400
                ctx.body = `Error: Invalid type of files ${invalidFiles.map(file => file.filename)}`
                return
            }
        }

        // Generate oss path
        let result = {}
        const storeDir = opts.storeDir ? `${opts.storeDir}/` : ''
        files.forEach(file => {
            const fileId = typeof filename === 'function' ?
                filename(file) : file.filename
            file.fileId = fileId
            result[fileId] = {
                storeDir: `${storeDir}`,
                fileId: fileId,
            }
        })

        await Promise.all(files.map(async file => {
            let putResult = await store.put(`${storeDir}/${file.fileId}`, file, ctx, fields)
            _.assign(result[file.fileId],{putResult})
        }))
        console.log('backend store success,file path:' + JSON.stringify(result))
        // Return result
        ctx.status = 200
        ctx.body = await store.get(result)
        console.log('get url from backend store success,file path:' + JSON.stringify(result))
    }
    return {handler,store}
}

module.exports = (options) => {
    if (!options.url) {
        throw new Error('Can not find option url')
    }
    return fileUpload(options)
}