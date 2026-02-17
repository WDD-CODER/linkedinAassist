import { jitterDelay_ } from './jitter.js'
import { requestAction } from './daily-governor.js'

async function main(): Promise<void> {
  await jitterDelay_()
  const { permitted, count } = await requestAction()
  if (permitted) {
    console.log('Action permitted')
    console.log('Count:', count)
  } else {
    console.log('Limit reached')
    console.log('Count:', count)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
