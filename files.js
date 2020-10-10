const shelljs = require('shelljs')
const jsdom = require('jsdom')
const slugify = require('@sindresorhus/slugify');

/**
 * @param {Array<string|undefined>} ls 
 * @param {RegExp} filterRegex
 * @returns {Array<string>}
 */
function getFiles(ls, filterRegex) {
    const result = []
    if (Array.isArray(ls)) {
        for (const file of ls) {
            if (typeof file === "string" && filterRegex.test(file)) {
                result.push(file)
            }
        }
    }
    return result
}

/**
 * 
 * @param {Array<string>} filePaths
 * @returns {Array<string>}
 */
function extractTextContent(filePaths) {
    const ignoreExpression = /{{(.*)}}|(^[0-9!@#$%\^&*)(+=._-]$)/i
    const contentFiles = shelljs.cat(filePaths).toString()
    const dom = new jsdom.JSDOM(contentFiles);
    [...dom.window.document.getElementsByTagName('style')].map(e => e.remove())
    const stringsKV = dom.window.document.querySelector("*").textContent
        .split('\n')
        .filter(l => l.trim().length && !ignoreExpression.test(l.trim()))
        .map(l => l.trim())
    return stringsKV
}

/**
 * 
 * @param {Array<string>} texts
 * @returns {{ [key: string]: string }}
 */
function generateKeyValue(texts, separator = '_') {
    const obj = {}
    texts.map(text => {
        obj[slugify(text, { separator: separator })] = text
    })
    return obj
}

function generateFile(output, fileName, content) {
    if (!shelljs.test('-e', output)) {
        shelljs.mkdir(output)
    }
    shelljs.echo(content).to(fileName)
}

/**
 * @param {string} output
 * @param {string} templateStr 
 * @param {{ [key: string]: string }} contentFile 
 */
function generateTemplates(output, templateStr, contentFile) {
    for (const key in contentFile) {
        if (contentFile.hasOwnProperty(key)) {
            contentFile[key] = '';
        }
    }

    const templates = templateStr.split(',');
    for (const templateName of templates) {
        generateFile(output, `${output}/${templateName.trim()}.json`, JSON.stringify(contentFile, null, 2))
    }
}

module.exports = {
    getFiles,
    extractTextContent,
    generateKeyValue,
    generateFile,
    generateTemplates
}