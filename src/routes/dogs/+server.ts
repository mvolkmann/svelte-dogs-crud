import {json} from '@sveltejs/kit';
import type {RequestHandler} from '@sveltejs/kit';
import {addDog, getDogs} from './dogs';

export function GET() {
  return json(getDogs());
}

export const POST = (async ({request}) => {
  try {
    const formData = await request.formData();
    const name = (formData.get('name') as string) || '';
    const breed = (formData.get('breed') as string) || '';
    const newDog = addDog(name, breed);
    return json(newDog, {status: 201});
  } catch (error) {
    return json({error}, {status: 500});
  }
}) satisfies RequestHandler;
