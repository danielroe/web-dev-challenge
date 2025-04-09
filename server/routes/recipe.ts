import { streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic'
import recipe from '../sample-recipe.json'
import { imageSize } from 'image-size';

const responseSchema = {
  title: 'Recipe Response',
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    article: {
      type: 'string',
      comment: 'Markdown article response, with an initial title and subsequent headings and paragraphs. The article should be a long form response, with a minimum of 3000 words. The article should be written in markdown format, with headings and subheadings. The article should be well structured, with an introduction, body and conclusion. The article should be engaging and interesting to read. The article should be written in a conversational tone, as if the author is speaking directly to the reader.',
    },
  },
} as const

type Response = {
  [key in keyof typeof responseSchema['properties']]: typeof responseSchema['properties'][key]['type'] extends 'string' ? 'enum' extends keyof typeof responseSchema['properties'][key] ? typeof responseSchema['properties'][key]['enum'] extends Array<infer S> ? S : string : string : typeof responseSchema['properties'][key]['type'] extends 'boolean' ? boolean : unknown
}

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().anthropicApiKey;
  const anthropic = createAnthropic({
    apiKey: apiKey,
  })

  return defineEventHandler(async (event: any) => {
    const [{ text }, { width, height }] = await Promise.all([
      generateText({
        model: anthropic('claude-3-5-haiku-latest'),
        messages: [
          {
            role: 'system',
            content: `You are writing terrible recipe articles for a website. They will include long digressions, life stories and irrelevant details. The more tangents the better, whilst using every possible engagement bait to keep the reader interested. The more dark patterns the better. Unleash your inner evil. Distract the reader with anecdotes, jokes, and more. Make sure not to reveal you know you are evil. You must respond in JSON according to the following schema: ${JSON.stringify(responseSchema)}`
          },
          {
            role: 'user',
            content: `The recipe your stories should accompany is: ${JSON.stringify(recipe)}.`
          }
        ],
      }),
      fetch(recipe.image).then(r => r.arrayBuffer()).then(image => imageSize(Buffer.from(image)))
    ])

    try {
      return {
        ...JSON.parse(text.replace(/"[^"]+"/g, r => r.replace(/\n/g, '\\n'))) as Response,
        image: {
          src: recipe.image,
          alt: '', // nonsense
          height,
          width,

        }
      }
    } catch (e)   {
      console.error(e, { text: text })
      return text
    }
  });
});
