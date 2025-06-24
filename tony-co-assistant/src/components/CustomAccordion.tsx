import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  accordionItem: {
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'background-color 0.2s ease',
    marginBottom: '8px',
  },
  accordionHeader: {
    padding: '12px',
    cursor: 'pointer',
    '& > span': {
      backgroundColor: '#1f1f1f',
      borderRadius: '4px',
    },
  },
  accordionPanel: {
    padding: '12px',
  },
});

export interface CustomAccordionItem {
  id: string;
  renderHeader: (isExpanded: boolean) => React.ReactNode;
  renderContent: (isExpanded: boolean) => React.ReactNode;
}

interface CustomAccordionProps {
  items: CustomAccordionItem[];
}

const CustomAccordion: React.FC<CustomAccordionProps> = ({ items }) => {
  const styles = useStyles();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAccordionToggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <Accordion collapsible openItems={expanded ? [expanded] : []}>
      {items.map((item) => {
        const isExpanded = expanded === item.id;
        return (
          <AccordionItem
            key={item.id}
            value={item.id}
            className={styles.accordionItem}
            style={{
              backgroundColor: isExpanded ? tokens.colorNeutralBackground1 : tokens.colorNeutralBackground2,
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'background-color 0.2s ease',
            }}
          >
            <AccordionHeader className={styles.accordionHeader} onClick={() => handleAccordionToggle(item.id)}>
              {item.renderHeader(isExpanded)}
            </AccordionHeader>
            <AccordionPanel className={styles.accordionPanel}>
              {item.renderContent(isExpanded)}
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default CustomAccordion; 