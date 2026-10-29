import { Stack, Text } from '@contentful/f36-components';
import type { ColorTokens } from '@contentful/f36-tokens';
import type { FC } from 'react';

type MetricVariant = 'positive' | 'negative';

type MetricProps = {
  variant?: MetricVariant;
  label: string;
  value: number;
};

const fontColorFromVariant = (variant?: MetricVariant): ColorTokens => {
  switch (variant) {
    case 'positive':
      return 'colorPositive';
    case 'negative':
      return 'colorNegative';
    default:
      return 'gray700';
  }
};

const Metric: FC<MetricProps> = ({ variant, label, value }) => {
  const fontColor = fontColorFromVariant(variant);

  return (
    <Stack justifyContent="space-between" fullWidth>
      <Text fontColor="gray900">{label}</Text>
      <Text
        fontColor={fontColor}
        fontWeight="fontWeightDemiBold"
        fontSize="fontSizeL"
      >
        {value}
      </Text>
    </Stack>
  );
};

export default Metric;
