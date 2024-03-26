import {json} from '@sveltejs/kit';
import type {RequestHandler} from '@sveltejs/kit';
import {deleteDog, updateDog} from '../dogs';

export function DELETE({params}) {
  const id = params.id ?? '';
  const existed = deleteDog(id);
  return json(existed ? null : {error: 'dog not found'}, {
    status: existed ? 200 : 404
  });
}

export const PUT = (async ({params, request}) => {
  const id = params.id ?? '';
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const breed = formData.get('breed') as string;
  const dog = updateDog(id, name, breed);
  return dog ? json(dog) : json({error: 'dog not found'}, {status: 404});
}) satisfies RequestHandler;
