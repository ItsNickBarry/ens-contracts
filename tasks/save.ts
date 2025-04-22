import { exec as _exec } from 'child_process'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import { promisify } from 'util'

import { task } from 'hardhat/config'

import { archivedDeploymentPath } from '../hardhat.config.js'
import type { Artifact } from 'hardhat/types/artifacts'

const exec = promisify(_exec)

export default task('save')
  .setDescription('Saves a specified contract as a deployed contract')
  .addPositionalArgument({
    name: 'contract',
    description: 'The contract to save',
  })
  .addPositionalArgument({
    name: 'block',
    description: 'The block number the contract was deployed at',
  })
  .addOption({
    name: 'fullName',
    description:
      '(Optional) The fully qualified name of the contract (e.g. contracts/resolvers/PublicResolver.sol:PublicResolver)',
    // TODO: remove default value after HH update
    defaultValue: '',
  })
  .setAction(
    async (
      {
        contract,
        block,
        fullName,
      }: { contract: string; block: string; fullName?: string },
      hre,
    ) => {
      const networkConnection = await hre.network.connect()
      const network = networkConnection.networkName

      const artifactReference = fullName || contract
      const artifact = await hre.deployments.getArtifact(artifactReference)

      const archiveName = `${contract}_${network}_${block}`
      const archivePath = `${archivedDeploymentPath}/${archiveName}.sol`

      if (existsSync(archivePath)) {
        throw new Error('Archive already exists')
      }

      const newArtifact: Artifact & {
        commitHash: string
        treeHash: string
      } = {
        ...artifact,
        contractName: archiveName,
        sourceName: archivePath.substring(2),
        commitHash: (await exec('git rev-parse HEAD')).stdout.trim(),
        treeHash: (
          await exec(`git rev-parse HEAD:${artifact.sourceName}`)
        ).stdout.trim(),
      }

      await fs.mkdir(archivePath)
      await fs.writeFile(
        `${archivePath}/${archiveName}.json`,
        JSON.stringify(newArtifact, null, 2),
      )
      console.log("Archived contract to '" + archivePath + "'")
    },
  )
  .build()
