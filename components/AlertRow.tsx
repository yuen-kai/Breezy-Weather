import React from 'react';
import { Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { useAppTheme } from '@/theme';

interface AlertRowProps {
  alert: {
    headline: string;
    severity: string;
    event: string;
    desc: string;
    instruction: string;
    effective: string;
    expires: string;
  };
}

const AlertRow: React.FC<AlertRowProps> = ({ alert }) => {
  const theme = useAppTheme();
  const [expanded, setExpanded] = React.useState(false);

  const getSeverityColor = () => {
    switch (alert.severity.toLowerCase()) {
      case 'extreme':
        return theme.colors.extremeWarning;
      case 'severe':
        return theme.colors.severeWarning;
      case 'moderate':
        return theme.colors.moderateWarning;
      default:
        return theme.colors.regularWarning;
    }
  };

  return (
    <Card 
      style={{ 
        margin: 8,
        borderLeftWidth: 4,
        borderLeftColor: getSeverityColor()
      }}
    >
      <Card.Content>
        <Title style={{ color: getSeverityColor(), marginBottom: 4 }}>{alert.event}</Title>
        <Paragraph style={{ fontSize: 12, color: '#757575' }}>
          {alert.headline}
        </Paragraph>
        <IconButton
          icon={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          style={{ position: 'absolute', right: 8, top: 8 }}
          onPress={() => setExpanded(!expanded)}
        />
        {expanded && (
          <>
            <Paragraph style={{ marginBottom: 8 }}>{alert.desc}</Paragraph>
            <Paragraph style={{ fontStyle: 'italic' }}>Instruction: {alert.instruction}</Paragraph>
          </>
        )}
      </Card.Content>
    </Card>
  );
};

export default AlertRow;
