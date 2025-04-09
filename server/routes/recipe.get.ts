import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { imageSize } from 'image-size'
import * as z from 'zod'
import recipe from '../sample-recipe.json'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().anthropicApiKey
  const anthropic = createAnthropic({ apiKey })

  return defineCachedEventHandler(async (_event) => {
    const [{ object }, { width = 0, height = 0 }] = await Promise.all([
      generateObject({
        model: anthropic('claude-3-5-haiku-latest'),
        schema: z.object({
          longTitle: z.string(),
          shortTitle: z.string(),
          description: z.string(),
          slides: z.array(z.object({
            title: z.string(),
            description: z.string(),
            text: z.string(),
          })),
        }),
        prompt: `You are writing terrible recipe content for a website. They will include long digressions, life stories and irrelevant details. The more tangents the better, whilst using every possible engagement bait to keep the reader interested. The more dark patterns the better. Unleash your inner evil. Distract the reader with anecdotes, jokes, and more. Make sure not to reveal you know you are evil. You should provide a list of at least 20 Markdown slides. Some slides can have nothing to do with the recipe but be about cooking, anecdotes, personal life advice, and more. The recipe your stories should accompany is: ${JSON.stringify(recipe)}.`,
      }),
      fetch(recipe.image).then(r => r.arrayBuffer()).then(image => imageSize(Buffer.from(image))),
    ])

    return {
      ...object,
      title: recipe.title,
      image: {
        src: recipe.image,
        height,
        width,
      },
    }
  }, { swr: true, shouldBypassCache: () => !!import.meta.dev })
})
