/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { cli } = require('cli-ux')
const { init, mockSdk } = require('@adobe/aio-lib-cloudmanager')
const { setStore } = require('@adobe/aio-lib-core-config')
const UpdatePipelineCommand = require('../../src/commands/cloudmanager/update-pipeline')

beforeEach(() => {
  setStore({})
})

test('update-pipeline - missing arg', async () => {
  expect.assertions(2)

  const runResult = UpdatePipelineCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toSatisfy(err => err.message.indexOf('Missing 1 required arg') === 0)
})

test('update-pipeline - missing config', async () => {
  expect.assertions(3)

  const runResult = UpdatePipelineCommand.run(['--programId', '5', '10'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual(undefined)
  await expect(cli.action.stop.mock.calls[0][0]).toBe('missing config data: jwt-auth')
})

test('update-pipeline - branch success', async () => {
  setStore({
    'jwt-auth': JSON.stringify({
      client_id: '1234',
      jwt_payload: {
        iss: 'good'
      }
    })
  })

  expect.assertions(8)

  const runResult = UpdatePipelineCommand.run(['--programId', '5', '10', '--branch', 'develop'])
  await expect(runResult instanceof Promise).toBeTruthy()

  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', '1234', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.updatePipeline.mock.calls.length).toEqual(1)
  await expect(mockSdk.updatePipeline.mock.calls[0][0]).toEqual('5')
  await expect(mockSdk.updatePipeline.mock.calls[0][1]).toEqual('10')
  await expect(mockSdk.updatePipeline.mock.calls[0][2]).toMatchObject({
    branch: 'develop'
  })
  await expect(cli.action.stop.mock.calls[0][0]).toBe('updated pipeline ID 10')
})

test('update-pipeline - repository and branch success', async () => {
  setStore({
    'jwt-auth': JSON.stringify({
      client_id: '1234',
      jwt_payload: {
        iss: 'good'
      }
    })
  })

  expect.assertions(8)

  const runResult = UpdatePipelineCommand.run(['--programId', '5', '10', '--branch', 'develop', '--repositoryId', '4'])
  await expect(runResult instanceof Promise).toBeTruthy()

  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', '1234', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.updatePipeline.mock.calls.length).toEqual(1)
  await expect(mockSdk.updatePipeline.mock.calls[0][0]).toEqual('5')
  await expect(mockSdk.updatePipeline.mock.calls[0][1]).toEqual('10')
  await expect(mockSdk.updatePipeline.mock.calls[0][2]).toMatchObject({
    branch: 'develop',
    repositoryId: '4'
  })
  await expect(cli.action.stop.mock.calls[0][0]).toBe('updated pipeline ID 10')
})

test('update-pipeline - both tag and branch', async () => {
  setStore({
    'jwt-auth': JSON.stringify({
      client_id: '1234',
      jwt_payload: {
        iss: 'good'
      }
    })
  })

  expect.assertions(2)

  const runResult = UpdatePipelineCommand.run(['--programId', '5', '5', '--branch', 'develop', '--tag', 'foo'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toSatisfy(err => err.message.indexOf('Both branch and tag cannot be specified') === 0)
})

test('update-pipeline - malformed tag', async () => {
  setStore({
    'jwt-auth': JSON.stringify({
      client_id: '1234',
      jwt_payload: {
        iss: 'good'
      }
    })
  })

  expect.assertions(2)

  const runResult = UpdatePipelineCommand.run(['--programId', '5', '5', '--tag', 'refs/tags/foo'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toSatisfy(err => err.message.indexOf('tag flag should not be specified with "refs/tags/" prefix. Value provided was refs/tags/foo') === 0)
})

test('update-pipeline - correct tag', async () => {
  setStore({
    'jwt-auth': JSON.stringify({
      client_id: '1234',
      jwt_payload: {
        iss: 'good'
      }
    })
  })

  expect.assertions(8)

  const runResult = UpdatePipelineCommand.run(['--programId', '5', '10', '--tag', 'foo'])
  await expect(runResult instanceof Promise).toBeTruthy()

  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', '1234', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.updatePipeline.mock.calls.length).toEqual(1)
  await expect(mockSdk.updatePipeline.mock.calls[0][0]).toEqual('5')
  await expect(mockSdk.updatePipeline.mock.calls[0][1]).toEqual('10')
  await expect(mockSdk.updatePipeline.mock.calls[0][2]).toMatchObject({
    branch: 'refs/tags/foo'
  })
  await expect(cli.action.stop.mock.calls[0][0]).toBe('updated pipeline ID 10')
})
