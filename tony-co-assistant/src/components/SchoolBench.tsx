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
  learningList: {
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
  tag: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: tokens.colorBrandBackground2,
    marginRight: '8px',
    marginBottom: '8px',
  },
  accordionItem: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  accordionHeader: {
    padding: '12px',
    cursor: 'pointer',
  },
  accordionPanel: {
    padding: '12px',
  },
});

interface LearningMaterial {
  id: string;
  title: string;
  type: 'design-system' | 'research-method' | 'feedback' | 'other';
  rawContent: string;
  summaryContent: string;
  tags: string[];
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

const SchoolBench: React.FC = () => {
  const styles = useStyles();
  const [materials, setMaterials] = useState<LearningMaterial[]>([
    {
      id: '1',
      title: 'Design System - Color Guidelines',
      type: 'design-system',
      rawContent: 'Complete color system documentation...',
      summaryContent: 'Primary colors should be used for main actions...',
      tags: ['colors', 'design-system', 'guidelines'],
    },
    // Add more sample materials
  ]);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMaterialClick = (material: LearningMaterial) => {
    setSelectedMaterial(material);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMaterial(null);
  };

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    setIsDialogOpen(false);
    setSelectedMaterial(null);
  };

  const handleSummaryEdit = (id: string, newContent: string) => {
    setMaterials(
      materials.map((material) =>
        material.id === id
          ? { ...material, summaryContent: newContent }
          : material
      )
    );
  };

  const handleTextHighlight = (text: string) => {
    setHighlightedText(text);
  };

  return (
    <div className={styles.root}>
      <div className={styles.learningList}>
        <CustomAccordion
          items={materials.map((material) => ({
            id: material.id,
            renderHeader: (isExpanded) => (
              <div>
                <Text weight="semibold">{material.title}</Text>
                <div>
                  {material.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ),
            renderContent: () => (
              <>
                <Text>{material.summaryContent}</Text>
                <Dialog open={isDialogOpen} onOpenChange={(e, data) => !data.open && handleCloseDialog()}>
                  <DialogTrigger>
                    <Button onClick={() => handleMaterialClick(material)}>
                      Open Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogSurface>
                    <DialogBody>
                      <DialogTitle>Learning Material Editor</DialogTitle>
                      <DialogContent>
                        <div className={styles.dialogContent}>
                          <div className={styles.panel}>
                            <Text weight="semibold">Raw Content</Text>
                            <div className={styles.rawText}>
                              {selectedMaterial?.rawContent}
                            </div>
                          </div>
                          <div className={styles.panel}>
                            <Text weight="semibold">Summary</Text>
                            <StyledTextArea
                              value={selectedMaterial?.summaryContent || ''}
                              onChange={(e) =>
                                selectedMaterial && handleSummaryEdit(selectedMaterial.id, e.target.value)
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

export default SchoolBench; 