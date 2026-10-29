import type { PageAppSDK } from '@contentful/app-sdk';
import {
  Button,
  Flex,
  FormControl,
  Modal,
  Note,
  Paragraph,
  Stack,
  Text,
  TextInput,
} from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { type FC, useEffect, useState } from 'react';
import useEntries from '../hooks/useEntries';
import useMapFocus from '../hooks/useMapFocus';
import useSectorDrawing from '../hooks/useSectorDrawing';
import useVisibilityToggles from '../hooks/useVisibilityToggles';
import { coordsCenter } from '../lib/geo';
import { createSector } from '../lib/mutations/sector-actions';

const SectorDrawing: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const isDrawing = useSectorDrawing((state) => state.isDrawing);
  const vertices = useSectorDrawing((state) => state.vertices);
  const pending = useSectorDrawing((state) => state.pending);
  const undo = useSectorDrawing((state) => state.undo);
  const cancel = useSectorDrawing((state) => state.cancel);
  const finish = useSectorDrawing((state) => state.finish);
  const clearPending = useSectorDrawing((state) => state.clearPending);
  const addMapSector = useEntries((state) => state.addMapSector);
  const setVisibility = useVisibilityToggles((state) => state.setVisibility);
  const focus = useMapFocus((state) => state.focus);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isDrawing) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;

      if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
      } else if (event.key === 'Enter' || event.key === 'Backspace') {
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') {
          return;
        }

        event.preventDefault();

        if (event.key === 'Enter') {
          finish();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancel, finish, isDrawing, undo]);

  useEffect(() => {
    if (pending) {
      setName('');
    }
  }, [pending]);

  const create = async () => {
    if (!pending || !name.trim() || saving) {
      return;
    }

    setSaving(true);

    try {
      const sector = await createSector(sdk.cma, name.trim(), pending);
      addMapSector(sector);
      setVisibility('mapSectors', true);
      focus({ ...coordsCenter(pending), zoom: 18 });
      clearPending();
      sdk.notifier.success(t`Sector “${name.trim()}” created.`);
    } catch (error) {
      console.error('Sector creation failed', error);
      sdk.notifier.error(t`Could not create the sector. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (!isDrawing && !pending) {
    return null;
  }

  return (
    <>
      {isDrawing && (
        <div
          css={{
            left: '50%',
            position: 'absolute',
            top: 16,
            transform: 'translateX(-50%)',
            width: 'min(460px, calc(100% - 32px))',
            zIndex: 3,
          }}
        >
          <Note title={t`Draw sector`} variant="primary">
            <Stack flexDirection="column" spacing="spacingS">
              <Text>
                <Trans>
                  Click the map to add points. Press Enter to finish or Escape
                  to cancel.
                </Trans>
              </Text>
              <Flex
                alignItems="center"
                gap="spacingS"
                justifyContent="space-between"
              >
                <Text fontColor="gray600">
                  {vertices.length === 1 ? (
                    <Trans>1 point</Trans>
                  ) : (
                    <Trans>{vertices.length} points</Trans>
                  )}
                </Text>
                <Flex gap="spacingXs">
                  <Button
                    isDisabled={vertices.length === 0}
                    onClick={undo}
                    size="small"
                  >
                    <Trans>Undo</Trans>
                  </Button>
                  <Button onClick={cancel} size="small">
                    <Trans>Cancel</Trans>
                  </Button>
                  <Button
                    isDisabled={vertices.length < 3}
                    onClick={finish}
                    size="small"
                    variant="primary"
                  >
                    <Trans>Finish</Trans>
                  </Button>
                </Flex>
              </Flex>
            </Stack>
          </Note>
        </div>
      )}

      <Modal
        isShown={Boolean(pending)}
        onClose={clearPending}
        title={t`New sector`}
      >
        <Modal.Content>
          <FormControl id="sector-name" isRequired>
            <FormControl.Label>
              <Trans>Name</Trans>
            </FormControl.Label>
            <TextInput
              autoFocus
              id="sector-name"
              onChange={(event) => setName(event.target.value)}
              placeholder={t`Sector name`}
              value={name}
            />
          </FormControl>
          <Paragraph marginBottom="none">
            <Trans>
              {pending?.length ?? 0} points · the sector will appear on the map
              right away.
            </Trans>
          </Paragraph>
        </Modal.Content>
        <Modal.Controls>
          <Button isDisabled={saving} onClick={clearPending}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            isDisabled={!name.trim() || saving}
            isLoading={saving}
            onClick={() => void create()}
            variant="primary"
          >
            <Trans>Create sector</Trans>
          </Button>
        </Modal.Controls>
      </Modal>
    </>
  );
};

export default SectorDrawing;
