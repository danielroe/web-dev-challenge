import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { imageSize } from 'image-size'
import type sample from '../sample-recipe.json'

const responseSchema = {
  type: 'object',
  properties: {
    longTitle: { type: 'string' },
    shortTitle: { type: 'string' },
    description: { type: 'string' },
    slides: {
      type: 'array',
      comment: 'A list of fifteen slides which the user will move through sequentially. Information should not be presented sequentially, but randomly, with digressions, and out of order. As much as possible users should be engaged, and distracted from the recipe. Some slides can have nothing to do with the recipe but be about cooking, anecdotes, personal life advice, and more.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          text: {
            type: 'string',
            comment: 'Markdown content. Each slide should have about 200 words.',
          },
        },
      },
    },
  },
} as const

type Response = {
  longTitle: string
  shortTitle: string
  description: string
  slides: {
    title: string
    description: string
    text: string
    image?: {
      src: string
      width: number
      height: number
    }
  }[]
}

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().anthropicApiKey
  const anthropic = createAnthropic({ apiKey })

  return defineCachedEventHandler(async (event) => {
    const query = getQuery(event)
    const { recipes } = await $fetch<{ recipes: Array<typeof sample> }>('https://api.spoonacular.com/recipes/random', {
      query: {
        ...query.cookies ? { 'include-tags': 'cookies' } : {},
        apiKey: useRuntimeConfig(event).spoonacularApiKey,
      },
    })
    const recipe = recipes[0]
    console.log(recipe)
    const [{ text }, { width, height }] = await Promise.all([
      generateText({
        model: anthropic('claude-3-5-haiku-latest'),
        messages: [
          {
            role: 'system',
            content: `You are writing terrible recipe articles for a website. They will include long digressions, life stories and irrelevant details. The more tangents the better, whilst using every possible engagement bait to keep the reader interested. The more dark patterns the better. Unleash your inner evil. Distract the reader with anecdotes, jokes, and more. Make sure not to reveal you know you are evil. You must respond in JSON according to the following schema: ${JSON.stringify(responseSchema)}.`,
          },
          {
            role: 'user',
            content: `The recipe your stories should accompany is: ${JSON.stringify(recipe)}. You must only respond in JSON.`,
          },
        ],
      }),
      fetch(recipe.image).then(r => r.arrayBuffer()).then(image => imageSize(Buffer.from(image))),
    ])

    const response = JSON.parse(text.replace(/"[^"]+"/g, r => r.replace(/\n/g, '\\n'))) as Response
    const images = await $fetch('/random-images', {
      query: { count: response.slides.length },
    })

    try {
      return {
        ...response,
        instructions: recipe.instructions,
        ingredients: recipe.extendedIngredients,
        ingredientImages: recipe.analyzedInstructions.flatMap(i => i.steps.flatMap(step => step.ingredients.map(i => i.image))).map(i => `https://spoonacular.com/cdn/ingredients_500x500/${i}`),
        slides: response.slides!.map((slide, i) => ({
          ...slide,
          image: images[i],
        })),
        title: recipe.title,
        image: {
          src: recipe.image,
          height,
          width,
        },
      }
    }
    catch (e) {
      console.error(e, { text: text })
      return await $fetch('/recipe' as string) as unknown
    }
  }, { getKey: event => getQuery(event).cookies ? 'cookies' : 'recipe', swr: true, staleMaxAge: 86400, maxAge: 86400, shouldBypassCache: () => !!import.meta.dev })
})
