import type { EntryFieldAPI, SidebarAppSDK } from '@contentful/app-sdk';
import {
  Button,
  EntityList,
  Note,
  Paragraph,
} from '@contentful/f36-components';
import { PlusIcon } from '@contentful/f36-icons';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useMemo, useState } from 'react';
import './Sidebar.css';
import { t } from '@lingui/core/macro';
import { Plural, Trans } from '@lingui/react/macro';

type Plant = {
  id: string;
  code: string;
};

const CODE_NUMBER_LENGTH = 3;

function generatePaddedNumber(n: number): string {
  return n.toString().padStart(CODE_NUMBER_LENGTH, '0');
}

function getCode(field: EntryFieldAPI) {
  return ((field.getValue() as string) ?? '').slice(0, 2).toUpperCase();
}

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const cma = sdk.cma;
  const entry = sdk.entry;
  const sys = entry.getSys();

  const genusField = entry.fields.genus;
  const speciesField = entry.fields.species;

  const [isPublished, setIsPublished] = useState<boolean>(!!sys.publishedAt);
  const [isCreatingPlant, setIsCreatingPlant] = useState<boolean>(false);
  const [genusCode, setGenusCode] = useState<string>(getCode(genusField));
  const [speciesCode, setSpeciesCode] = useState<string>(getCode(speciesField));
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    const detach = entry.onSysChanged((sys) =>
      setIsPublished(!!sys.publishedAt),
    );

    return () => detach();
  }, [entry]);

  useEffect(() => {
    sdk.window.startAutoResizer();

    return () => {
      sdk.window.stopAutoResizer();
    };
  }, [sdk]);

  useEffect(() => {
    const detach = genusField.onValueChanged(() =>
      setGenusCode(getCode(genusField)),
    );
    return () => detach();
  }, [genusField]);

  useEffect(() => {
    const detach = speciesField.onValueChanged(() =>
      setSpeciesCode(getCode(speciesField)),
    );
    return () => detach();
  }, [speciesField]);

  const codeStart = useMemo(
    () => `${genusCode}${speciesCode}`,
    [genusCode, speciesCode],
  );

  useEffect(() => {
    (async () => {
      const query = {
        content_type: 'plant',
        'fields.commonInfo.sys.id': sys.id,
        order: 'fields.code',
      };

      const plantEntries = await cma.entry.getMany({
        query,
      });

      setPlants(
        plantEntries.items.map((pe) => ({
          id: pe.sys.id,
          code: pe.fields.code.fr,
        })),
      );
    })();
  }, [cma, sys]);

  const getNextPlantCode = async () => {
    const query = {
      content_type: 'plant',
      'fields.code[match]': codeStart,
      order: '-fields.code',
      limit: 1,
    };

    const results = await cma.entry.getMany({
      query,
    });

    if (results.total === 0) {
      return `${codeStart}-${generatePaddedNumber(1)}`;
    }

    const lastPlant = results.items[0];
    const lastNumber = parseInt(lastPlant.fields.code.fr.split('-')[1], 10);
    const nextNumber = generatePaddedNumber(lastNumber + 1);

    return `${codeStart}-${nextNumber}`;
  };

  const createNewPlant = async () => {
    setIsCreatingPlant(true);

    try {
      const nextCode = await getNextPlantCode();

      const newPlant = await cma.entry.create(
        {
          contentTypeId: 'plant',
        },
        {
          fields: {
            commonInfo: {
              fr: {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: sys.id,
                },
              },
            },
            code: {
              fr: nextCode,
            },
          },
        },
      );

      await cma.entry.publish(
        {
          entryId: newPlant.sys.id,
        },
        newPlant,
      );

      setPlants([
        ...plants,
        { id: newPlant.sys.id, code: newPlant.fields.code.fr },
      ]);

      sdk.notifier.success(t`Plant ${newPlant.fields.code.fr} created!`);
    } catch (_e) {
      sdk.notifier.error(t`Could not create a new plant :(`);
    }

    setIsCreatingPlant(false);
  };

  return (
    <div>
      {isPublished ? (
        <div className="plant-sidebar">
          <Button
            isFullWidth={true}
            startIcon={<PlusIcon />}
            variant="positive"
            isLoading={isCreatingPlant}
            isDisabled={isCreatingPlant}
            onClick={() => createNewPlant()}
          >
            {isCreatingPlant ? (
              <Trans>
                Creating new <b>{codeStart}</b>
              </Trans>
            ) : (
              <Trans>
                Create new <b>{codeStart}</b>
              </Trans>
            )}
          </Button>
          <EntityList>
            {plants.map((p) => (
              <EntityList.Item
                key={p.id}
                title={p.code}
                withThumbnail={false}
                onClick={() => sdk.navigator.openEntry(p.id, { slideIn: true })}
                className="plant-entity-list-item"
              />
            ))}
          </EntityList>
          <Paragraph>
            <Plural
              value={plants.length}
              _0="No plant for this plant card"
              one="# plant is linked to this plant card"
              other="# plants are linked to this plant card"
            />
          </Paragraph>
        </div>
      ) : (
        <Note variant="warning">
          <Trans>
            Cannot create a plant until this plant card is <b>published</b>
          </Trans>
        </Note>
      )}
    </div>
  );
};

export default Sidebar;
