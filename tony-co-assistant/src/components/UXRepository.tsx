import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@fluentui/react-components';
import styled from 'styled-components';
import CustomAccordion from './CustomAccordion';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  dialogContent: {
    display: 'flex',
    gap: '16px',
    height: '600px',
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  rawText: {
    flex: 1,
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '4px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
  },
  summaryText: {
    flex: 1,
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '4px',
    overflowY: 'auto',
  },
  highlighted: {
    backgroundColor: tokens.colorBrandBackground2,
  },
  accordionItem: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1,
    },
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

interface Summary {
  id: string;
  title: string;
  rawContent: string;
  summaryContent: string;
}

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 8px;
  border: 1px solid ${tokens.colorNeutralStroke1};
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  background-color: ${tokens.colorNeutralBackground1};
  color: ${tokens.colorNeutralForeground1};

  &:focus {
    outline: none;
    border-color: ${tokens.colorBrandStroke1};
  }
`;

const UXRepository: React.FC = () => {
  const styles = useStyles();
  const [summaries, setSummaries] = useState<Summary[]>([
    {
      id: '1',
      title: 'User Research Interview - John Doe',
      rawContent: 'Interview transcript with John Doe about the new feature...',
      summaryContent: 'John expressed concerns about the current workflow...',
    },
    // Add more sample summaries
  ]);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAccordionToggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleSummaryClick = (summary: Summary) => {
    setSelectedSummary(summary);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSummary(null);
  };

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    setIsDialogOpen(false);
    setSelectedSummary(null);
  };

  const handleSummaryEdit = (id: string, newContent: string) => {
    setSummaries(
      summaries.map((summary) =>
        summary.id === id
          ? { ...summary, summaryContent: newContent }
          : summary
      )
    );
  };

  const handleTextHighlight = (text: string) => {
    setHighlightedText(text);
  };

  return (
    <div className={styles.root}>
      <div className={styles.summaryList}>
        <CustomAccordion
          items={summaries.map((summary) => ({
            id: summary.id,
            renderHeader: (isExpanded) => summary.title,
            renderContent: () => (
              <>
                <Text>{summary.summaryContent}</Text>
                <Dialog open={isDialogOpen} onOpenChange={(e, data) => !data.open && handleCloseDialog()}>
                  <DialogTrigger>
                    <Button onClick={() => handleSummaryClick(summary)}>
                      Open Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogSurface>
                    <DialogBody>
                      <DialogTitle>Summary Editor</DialogTitle>
                      <DialogContent>
                        <div className={styles.dialogContent}>
                          <div className={styles.panel}>
                            <Text weight="semibold">Raw Content</Text>
                            <div className={styles.rawText}>
                              {selectedSummary?.rawContent}
                            </div>
                          </div>
                          <div className={styles.panel}>
                            <Text weight="semibold">Summary</Text>
                            <StyledTextArea
                              value={selectedSummary?.summaryContent || ''}
                              onChange={(e) =>
                                selectedSummary && handleSummaryEdit(selectedSummary.id, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </DialogContent>
                      <DialogActions>
                        <Button appearance="secondary" onClick={handleCloseDialog}>Close</Button>
                        <Button appearance="primary" onClick={handleSaveChanges}>Save Changes</Button>
                      </DialogActions>
                    </DialogBody>
                  </DialogSurface>
                </Dialog>
              </>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default UXRepository; 