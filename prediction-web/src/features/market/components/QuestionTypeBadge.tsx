interface QuestionTypeBadgeProps {
  questionType: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  optionsCount?: number;
  isCompact?: boolean;
}

export function QuestionTypeBadge({ 
  questionType, 
  optionsCount,
  isCompact = false 
}: QuestionTypeBadgeProps) {
  const config = {
    YES_NO: {
      icon: '✅',
      label: '是非題',
      color: '#00FFFF',
    },
    SINGLE_CHOICE: {
      icon: '🎲',
      label: '單選題',
      color: '#FFD700',
    },
    MULTIPLE_CHOICE: {
      icon: '🎯',
      label: '多選題',
      color: '#B620E0',
    },
  };

  const { icon, label, color } = config[questionType] || config.YES_NO;

  return (
    <div
      className="inline-flex items-center justify-center gap-1 rounded-lg border backdrop-blur-xl"
      style={{
        padding: isCompact ? '2px 6px' : '4px 8px',
        background: `${color}20`,
        borderColor: color,
        boxShadow: `0 0 ${isCompact ? '6px' : '8px'} ${color}30`,
      }}
    >
      <span style={{ fontSize: isCompact ? '10px' : '12px', lineHeight: '1' }}>
        {icon}
      </span>
      <span
        className="font-black"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: isCompact ? '8px' : '9px',
          color: color,
          textShadow: `0 0 ${isCompact ? '4px' : '6px'} ${color}80`,
          lineHeight: '1',
        }}
      >
        {label}
      </span>
      {(questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE') && optionsCount && (
        <span
          className="font-bold"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: isCompact ? '8px' : '9px',
            color: color,
            lineHeight: '1',
          }}
        >
          {optionsCount}選
        </span>
      )}
    </div>
  );
}



