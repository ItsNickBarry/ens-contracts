import { writeFile } from 'fs/promises'
import path from 'path'
import { overrideTask } from 'hardhat/config'

// TODO: import task name constant
export default overrideTask('compile')
  .setAction(async (_, { config }, runSuper) => {
    const superRes = await runSuper({})

    try {
      await writeFile(
        path.join(config.paths.artifacts, 'package.json'),
        '{ "type": "commonjs" }',
      )
    } catch (error) {
      console.error('Error writing package.json: ', error)
    }

    return superRes
  })
  .build()
