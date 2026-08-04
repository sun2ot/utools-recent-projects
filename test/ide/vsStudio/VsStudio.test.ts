import {Context} from '../../../src/Context'
import {VsStudioApplicationImpl} from '../../../src/parser/ide/VsStudio'

test('vsStudioProjectItems', async () => {
    let app = new VsStudioApplicationImpl()
    ;(app as any).config = `${__dirname}/ApplicationPrivateSettings.xml`

    let items = await app.generateProjectItems(Context.get())
    expect(items.length).toEqual(1)
})
