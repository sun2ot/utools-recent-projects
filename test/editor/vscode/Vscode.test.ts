import {dedupEntries, normalizeStorageEntries, Vscode1640ApplicationImpl, VscodeApplicationImpl} from '../../../src/parser/editor/Vscode'
import {Context} from '../../../src/Context'

test('vscodeProjectItems', async () => {
    let app = new VscodeApplicationImpl()
    ;(app as any).config = `${__dirname}/storage.json`

    let items = await app.generateProjectItems(Context.get())
    expect(items.length).toEqual(4)
    expect(items[0].title).toEqual('notes')
    expect(items[1].title).toEqual('notes')
    expect(items[2].title).toEqual('notes-server')
    expect(items[3].title).toEqual('notes')
})

test('normalizeStorageEntries modern', () => {
    let storage = require('./storage-modern.json')
    let entries = normalizeStorageEntries(storage)
    // openedPathsList 无 → profileAssociations 2 条 + lastActiveWindow 1 + openedWindows 1 + backup 2 = 6
    expect(entries.length).toEqual(6)
    expect(entries[0].folderUri).toEqual('file:///Users/lanyuanxiaoyao/notes')
    expect(entries[1].folderUri).toEqual('file:///Users/lanyuanxiaoyao/notes-server')
    expect(entries[2].folderUri).toEqual('file:///Users/lanyuanxiaoyao/notes')
    expect(entries[3].folderUri).toEqual('file:///Users/lanyuanxiaoyao/notes-remote')
    expect(entries[4].folderUri).toEqual('file:///Users/lanyuanxiaoyao/notes')
    expect(entries[5].workspace.configPath).toEqual('file:///Users/lanyuanxiaoyao/notes.code-workspace')
})

test('normalizeStorageEntries legacy', () => {
    let storage = require('./storage.json')
    let entries = normalizeStorageEntries(storage)
    expect(entries.length).toEqual(4)
    expect(entries[0].workspace.configPath).toEqual('file:///Users/lanyuanxiaoyao/notes.code-workspace')
    expect(entries[1].folderUri).toEqual('file:///Users/lanyuanxiaoyao/notes')
})

test('dedupEntries', () => {
    let entries = [
        {folderUri: 'file:///Users/lanyuanxiaoyao/notes'},
        {folderUri: 'file:///d%3A/workspace/project-a'},
        {folderUri: 'file:///D%3A/workspace/project-a'},
        {workspace: {configPath: 'file:///Users/lanyuanxiaoyao/notes'}},
        {fileUri: 'file:///Users/lanyuanxiaoyao/other.log'},
    ]
    let deduped = dedupEntries(entries)
    expect(deduped.length).toEqual(3)
    expect(deduped[0].folderUri).toEqual('file:///Users/lanyuanxiaoyao/notes')
    expect(deduped[1].folderUri).toEqual('file:///d%3A/workspace/project-a')
    expect(deduped[2].fileUri).toEqual('file:///Users/lanyuanxiaoyao/other.log')
})

test('vscode1640ModernJsonProjectItems', async () => {
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/storage-modern.json`

    let items = await app.generateProjectItems(Context.get())
    // 6 条 → 去重后 4 条 (notes, notes-server, notes-remote, notes.code-workspace)
    expect(items.length).toEqual(4)
    expect(items[0].title).toEqual('notes')
    expect(items[1].title).toEqual('notes-server')
    expect(items[2].title).toEqual('notes-remote')
    expect(items[3].title).toEqual('notes')
})

test('vscode1640LegacyJsonProjectItems', async () => {
    // 旧版 Code/storage.json 结构 (openedPathsList.entries) 也能正常解析
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/storage.json`

    let items = await app.generateProjectItems(Context.get())
    expect(items.length).toEqual(4)
    expect(items[0].title).toEqual('notes')
    expect(items[3].title).toEqual('notes')
})

test('vscode1640WindowsJsonProjectItems', async () => {
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/storage-windows.json`
    // 模拟 Windows 平台 (测试环境 Mock 为 macOS)
    ;(app as any).isWindows = true

    let items = await app.generateProjectItems(Context.get())
    expect(items.length).toEqual(1)
    expect(items[0].title).toEqual('utools-recent-projects')
    expect(items[0].command.command).toContain('d:/workspace/utools-recent-projects')
})

test('vscode1640InvalidJsonReturnsEmpty', async () => {
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/storage-invalid.json`

    let items = await app.generateProjectItems(Context.get())
    expect(items).toEqual([])
})

test('vscode1640EmptyJsonReturnsEmpty', async () => {
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/storage-empty.json`

    let items = await app.generateProjectItems(Context.get())
    expect(items).toEqual([])
})
