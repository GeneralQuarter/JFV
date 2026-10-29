import type { FieldAppSDK } from '@contentful/app-sdk';
import { SlugEditor } from '@contentful/field-editor-slug';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useCallback, useEffect } from 'react';
import './Field.css';

export const DuplicateErrorMessage = /*i18n*/ {
  id: 'FieldEditors.Slug.SlugEditorField.DuplicateSlugError',
  message: 'This full latin name is already used by another plant card',
};

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const field = sdk.field;

  useEffect(() => {
    sdk.window.startAutoResizer();

    return () => sdk.window.stopAutoResizer();
  }, [sdk]);

  const genusField = sdk.entry.fields.genus;
  const speciesField = sdk.entry.fields.species;
  const varietyCultivarField = sdk.entry.fields.varietyCultivar;

  const updateFullLatinName = useCallback(() => {
    const genus = genusField.getValue() as string;
    const species = speciesField.getValue() as string;
    const varietyCultivar = varietyCultivarField.getValue() as string;

    if (!genus || !species) {
      field.setValue('');
      return;
    }

    const parts = [genus, species];

    if (varietyCultivar) {
      parts.push(`'${varietyCultivar}'`);
    }

    const newValue = parts.join(' ');

    if (field.getValue() === newValue) {
      return;
    }

    field.setValue(newValue);
  }, [field, genusField, speciesField, varietyCultivarField]);

  useEffect(() => {
    const detach = genusField.onValueChanged(() => updateFullLatinName());
    return () => detach();
  }, [genusField, updateFullLatinName]);

  useEffect(() => {
    const detach = speciesField.onValueChanged(() => updateFullLatinName());
    return () => detach();
  }, [speciesField, updateFullLatinName]);

  useEffect(() => {
    const detach = varietyCultivarField.onValueChanged(() =>
      updateFullLatinName(),
    );
    return () => detach();
  }, [varietyCultivarField, updateFullLatinName]);

  return (
    <div className="plant-field-full-latin-name">
      <SlugEditor baseSdk={sdk} field={field} isInitiallyDisabled={true} />
    </div>
  );
};

export default Field;
