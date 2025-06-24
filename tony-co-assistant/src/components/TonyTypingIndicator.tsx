import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 0,
    borderRadius: 0,
    gap: '4px',
    marginTop: '8px',
    marginBottom: '8px',
  },
  dot: {
    width: '2px',
    height: '2px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralForeground2,
    animationName: 'bounce',
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '&:nth-child(1)': {
      animationDelay: '0s',
    },
    '&:nth-child(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-child(3)': {
      animationDelay: '0.4s',
    },
  },
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '30%': {
      transform: 'translateY(-3px)',
    },
    '60%': {
      transform: 'translateY(0)',
    },
  },
});

const TonyTypingIndicator: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container} role="status" aria-label="Tony is typing">
      <div className={styles.dot} />
      <div className={styles.dot} />
      <div className={styles.dot} />
    </div>
  );
};

export default TonyTypingIndicator; 