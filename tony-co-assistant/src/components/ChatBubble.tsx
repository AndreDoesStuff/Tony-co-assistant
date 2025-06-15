import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { CopyRegular, EditRegular, CheckmarkRegular, DismissRegular } from '@fluentui/react-icons';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  isEditing?: boolean;
  editValue?: string;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onEditChange?: (v: string) => void;
  onCopy?: () => void;
  isCopied?: boolean;
}

const useStyles = makeStyles({
  bubble: {
    borderRadius: '12px',
    padding: '12px 16px',
    margin: '8px 0',
    position: 'relative',
    minWidth: '120px',
    maxWidth: '80%',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxShadow: 'none',
    border: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  user: {
    backgroundColor: tokens.colorNeutralBackground2, // <-- edit this for user bubble color
    alignSelf: 'flex-end',
  },
  ai: {
    backgroundColor: tokens.colorNeutralBackground1, // <-- edit this for AI bubble color
    alignSelf: 'flex-start',
  },
  actions: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    gap: '4px',
    zIndex: 2,
  },
  iconButton: {
    background: 'none',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    color: '#fff',
    borderRadius: '4px',
    transition: 'background 0.2s',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: tokens.colorNeutralBackground3,
    },
  },
  editTextarea: {
    width: '100%',
    minHeight: '60px',
    fontSize: '14px',
    fontFamily: 'inherit',
    borderRadius: '8px',
    border: 'none',
    padding: '8px',
    background: tokens.colorNeutralBackground2,
    color: '#fff',
    resize: 'vertical',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
});

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  sender,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onEditChange,
  onCopy,
  isCopied,
}) => {
  const styles = useStyles();
  return (
    <div className={`${styles.bubble} ${sender === 'user' ? styles.user : styles.ai}`}> 
      {sender === 'user' && (
        <div className={styles.actions}>
          <button className={styles.iconButton} title={isCopied ? 'Copied!' : 'Copy'} onClick={onCopy}>
            <CopyRegular />
          </button>
          {isEditing ? (
            <>
              <button className={styles.iconButton} title="Save" onClick={onSave}>
                <CheckmarkRegular />
              </button>
              <button className={styles.iconButton} title="Cancel" onClick={onCancel}>
                <DismissRegular />
              </button>
            </>
          ) : (
            <button className={styles.iconButton} title="Edit" onClick={onEdit}>
              <EditRegular />
            </button>
          )}
        </div>
      )}
      {isEditing ? (
        <textarea
          className={styles.editTextarea}
          value={editValue}
          onChange={e => onEditChange && onEditChange(e.target.value)}
          autoFocus
        />
      ) : (
        <pre style={{ margin: 0 }}>{message}</pre>
      )}
    </div>
  );
};

export default ChatBubble; 