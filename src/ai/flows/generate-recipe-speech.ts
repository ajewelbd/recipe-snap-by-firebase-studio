'use server';

/**
 * @fileOverview Converts recipe text to speech.
 *
 * - generateRecipeSpeech - A function that handles the text-to-speech conversion.
 * - GenerateRecipeSpeechInput - The input type for the generateRecipeSpeech function.
 * - GenerateRecipeSpeechOutput - The return type for the generateRecipeSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

const GenerateRecipeSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type GenerateRecipeSpeechInput = z.infer<
  typeof GenerateRecipeSpeechInputSchema
>;

const GenerateRecipeSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type GenerateRecipeSpeechOutput = z.infer<
  typeof GenerateRecipeSpeechOutputSchema
>;

export async function generateRecipeSpeech(
  input: GenerateRecipeSpeechInput
): Promise<GenerateRecipeSpeechOutput> {
  return generateRecipeSpeechFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateRecipeSpeechFlow = ai.defineFlow(
  {
    name: 'generateRecipeSpeechFlow',
    inputSchema: GenerateRecipeSpeechInputSchema,
    outputSchema: GenerateRecipeSpeechOutputSchema,
  },
  async ({text}) => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No audio media returned from the model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
