const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")
const _ = require('lodash')
const sharp = require('sharp')

module.exports = (options) => {
    if (!(options.folder)) {
        throw new Error("Missing option in options: [folder]")
    }

    if (!options.urlPath) {
        options.urlPath = options.folder
    }

    return {
        put: (filePath, file,ctx,fields) => {
            return new Promise((resolve, reject) => {
                let absoluteFilePath = path.join(options.folder, filePath)
                mkdirp.sync(path.dirname(absoluteFilePath))
                let writableStream = fs.createWriteStream(absoluteFilePath)
                let params=_.assign({},ctx.query,fields)
                if(params.resize==='true'){
                    let width = parseInt(params.width||'320'),height = parseInt(params.height||'240')
                    let transformer = sharp()
                        .resize(width,height)
                        .on('info', function(info) {
                            console.log('Image resized as:' + JSON.stringify(info))
                            return resolve(filePath)
                        })
                    file.pipe(transformer).pipe(writableStream)
                }else{
                    file.pipe(writableStream)
                    file.on("end", () => { return resolve(filePath)})
                }
            })
        },
        get: async (result) => {
            Object.keys(result).map(filename => {
                const { storeDir, fileId } = result[filename]
                let filePath = `${storeDir}/${encodeURI(fileId)}`
                return result[filename] = `${path.join(options.urlPath, filePath)}`
            })
            return result
        }
    }
}