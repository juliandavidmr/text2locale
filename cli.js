#!/usr/bin/env node

const shelljs = require('shelljs')
const { getFiles, extractTextContent, generateKeyValue, generateFile, generateTemplates } = require('./files')

require('yargs')
    .command('input [folder]', 'Extract text from folder', (yargs) => {
        yargs
            .positional('folder', {
                describe: 'port to bind on',
                type: 'string'
            })
    }, (argv) => {
        if (argv.verbose) console.info(`List :${argv.folder}`)
        processInputCommand({
            input: argv.folder,
            separator: argv.separator,
            output: argv.output,
            templates: argv.templates,
            v: argv.verbose,
            language: argv.lang
        })
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        default: './',
        description: 'Output directory.'
    })
    .option('templates', {
        alias: 't',
        type: 'string',
        default: 'en,es',
        description: 'Generate template for other languages.'
    })
    .option('lang', {
        alias: 'l',
        type: 'string',
        default: 'en',
        description: 'Language of the texts to be extracted.'
    })
    .option('separator', {
        alias: 's',
        type: 'string',
        default: '_',
        description: 'Separator to generate the key names.'
    })
    .argv


/**
 * @param {{
        input: string,
        separator?: string,
        output: string,
        templates: string,
        language: string,
        v: boolean,
   }} args
 */
function processInputCommand(args) {
    const REGEX_HTML_FINDER = /(.*\.html$)/
    const list = shelljs.ls('-R', args.input)
    const htmls = getFiles(list, REGEX_HTML_FINDER).map(filePath => args.input.concat('/').concat(filePath))
    const extractedText = extractTextContent(htmls)
    const generatedContent = generateKeyValue(extractedText, args.separator)

    const basePath = args.output + `${args.language.concat('.json')}`;
    if (args.v) {
        console.log('Path:', args.output)
        console.log('Texts extracted:', Object.keys(generatedContent).length)
    }
    generateFile(args.output, basePath, JSON.stringify(generatedContent, null, 2))
    generateTemplates(args.output, args.templates, generatedContent)
}