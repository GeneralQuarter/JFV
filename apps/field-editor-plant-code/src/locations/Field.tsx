import type { FieldAppSDK } from '@contentful/app-sdk';
import { SlugEditor } from '@contentful/field-editor-slug';
import { useSDK } from '@contentful/react-apps-toolkit';
import { generateNextPlantCode, useAutoResizer } from '@jfv/contentful-app';
import { useEffect } from 'react';
import './Field.css';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const commonInfoField = sdk.entry.fields.commonInfo;
  const field = sdk.field;
  const entrySys = sdk.entry.getSys();
  const cma = sdk.cma;

  useAutoResizer();

  useEffect(() => {
    const detach = commonInfoField.onValueChanged(async (value) => {
      if (!value) {
        if (!entrySys.publishedAt) {
          field.setValue('');
        }

        return;
      }

      if (field.getValue()) {
        return;
      }

      const commonInfo = await cma.entry.get({
        entryId: value.sys.id,
      });

      const nextCode = await generateNextPlantCode(cma, {
        genus: String(commonInfo.fields.genus.fr ?? ''),
        species: String(commonInfo.fields.species.fr ?? ''),
        excludeEntryId: entrySys.id,
        contentTypeId: entrySys.contentType.sys.id,
      });

      field.setValue(nextCode);
    });

    return () => detach();
  }, [commonInfoField, field, entrySys, cma]);

  return (
    <div className="plant-field-code">
      <SlugEditor baseSdk={sdk} field={field} isInitiallyDisabled={true} />
    </div>
  );
};

export default Field;
