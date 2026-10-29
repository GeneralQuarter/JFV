import { Switch } from '@contentful/f36-components';
import type { FC } from 'react';
import type { VisibilityToggleKey } from '../hooks/useVisibilityToggles';
import useVisibilityToggles from '../hooks/useVisibilityToggles';

type VisibilityToggleProps = {
  toggleKey: VisibilityToggleKey;
  label: string;
};

const VisibilityToggle: FC<VisibilityToggleProps> = ({ label, toggleKey }) => {
  const isChecked = useVisibilityToggles((state) => state[toggleKey]);
  const onChange = useVisibilityToggles((state) => state.toggle)(toggleKey);

  return (
    <Switch
      isChecked={isChecked}
      onChange={onChange}
      css={{ '& > label': { cursor: 'pointer' } }}
    >
      {label}
    </Switch>
  );
};

export default VisibilityToggle;
