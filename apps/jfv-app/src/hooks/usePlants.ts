import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db/db';

export default function usePlants() {
  return useLiveQuery(async () => {
    const plants = await db.plants
      .filter((plant) => !!plant.position && !plant.tags.includes('dead'))
      .toArray();

    await Promise.all(
      plants.map(async (plant) => {
        if (plant.plantCardId) {
          plant.plantCard = await db.plantCards.get(plant.plantCardId);
        }
      }),
    );

    return plants;
  });
}
