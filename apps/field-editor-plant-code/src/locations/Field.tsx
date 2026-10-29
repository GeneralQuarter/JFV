import type { FieldAppSDK } from '@contentful/app-sdk';
import { SlugEditor } from '@contentful/field-editor-slug';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';
import './Field.css';

const CODE_NUMBER_LENGTH = 3;

function generatePaddedNumber(n: number): string {
  return n.toString().padStart(CODE_NUMBER_LENGTH, '0');
}

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const commonInfoField = sdk.entry.fields.commonInfo;
  const field = sdk.field;
  const entrySys = sdk.entry.getSys();
  const cma = sdk.cma;

  useEffect(() => {
    sdk.window.startAutoResizer();

    return () => {
      sdk.window.stopAutoResizer();
    };
  }, [sdk]);

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

      const codeStart =
        `${commonInfo.fields.genus.fr.slice(0, 2)}${commonInfo.fields.species.fr.slice(0, 2)}-`.toUpperCase();

      const searchQuery = {
        content_type: entrySys.contentType.sys.id,
        'fields.code[match]': codeStart,
        'sys.id[ne]': entrySys.id,
        order: '-fields.code',
        limit: 1,
      };

      const results = await cma.entry.getMany({
        query: searchQuery,
      });

      if (results.total === 0) {
        field.setValue(`${codeStart}${generatePaddedNumber(1)}`);
        return;
      }

      const lastPlant = results.items[0];
      const lastNumber = parseInt(lastPlant.fields.code.fr.split('-')[1], 10);
      const nextNumber = generatePaddedNumber(lastNumber + 1);

      field.setValue(`${codeStart}${nextNumber}`);
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
