const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")

module.exports = (options) => {
    if (!(options.folder)) {
        throw new Error("Missing option in options: [folder]")
    }

    if (!options.urlPath) {
        options.urlPath = options.folder
    }

    return {
        put: (filePath, file) => {
            return new Promise((resolve, reject) => {
                let absoluteFilePath = path.join(options.folder, filePath)
                mkdirp.sync(path.dirname(absoluteFilePath))
                const stream = fs.createWriteStream(absoluteFilePath)
                file.pipe(stream)
                file.on("end", () => { return resolve(filePath) })
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